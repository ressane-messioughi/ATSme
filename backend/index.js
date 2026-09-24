import "./env.js";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./db.js";
import {
  createUser,
  findUserByEmail,
  findUserAndCheckPassword,
  issueToken,
  requireAuth,
  requireAdmin,
  updateUserName,
  changePassword,
} from "./auth.js";
import { emptyResumeData, normalizeResumeData, newId } from "./resumeModel.js";
import { scoreResume } from "./scoring.js";
import { extractText, structureFromText } from "./parsing.js";
import { matchResumeToJob } from "./jobMatch.js";
import { buildResumePdf } from "./exporters/pdf.js";
import { buildResumeDocx } from "./exporters/docx.js";
import { buildResumeTxt } from "./exporters/txt.js";
import { ensureAdminUser } from "./bootstrapAdmin.js";

const STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: STORAGE_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${newId()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.(pdf|docx)$/i.test(file.originalname);
    cb(ok ? null : new Error("format non supporté (PDF ou DOCX uniquement)"), ok);
  },
});

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Limiteur de débit en mémoire (process unique derrière nginx, pas de dépendance externe
// nécessaire) — protège les routes sensibles/coûteuses contre le brute-force et l'abus.
const rateBuckets = new Map();
function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) || [];
    const fresh = bucket.filter((t) => now - t < windowMs);
    if (fresh.length >= max) {
      return res.status(429).json({ error: "trop de tentatives, réessayez plus tard" });
    }
    fresh.push(now);
    rateBuckets.set(key, fresh);
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    const fresh = bucket.filter((t) => now - t < 15 * 60 * 1000);
    if (fresh.length) rateBuckets.set(key, fresh);
    else rateBuckets.delete(key);
  }
}, 5 * 60 * 1000).unref();

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const importRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });

async function ownedResumeRow(id, userId) {
  const [rows] = await db.query("SELECT * FROM resumes WHERE id = ? AND user_id = ?", [id, userId]);
  return rows[0] || null;
}

function parseResumeRow(row) {
  return {
    id: row.id,
    title: row.title,
    template: row.template,
    source: row.source,
    hasOriginal: Boolean(row.original_path),
    atsScore: row.ats_score,
    scoreBreakdown: row.score_breakdown,
    recommendations: row.recommendations,
    data: typeof row.data === "string" ? JSON.parse(row.data) : row.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function saveScoredResume(id, data) {
  const { total, breakdown, recommendations } = scoreResume(data);
  await db.query(
    "UPDATE resumes SET data = ?, ats_score = ?, score_breakdown = ?, recommendations = ? WHERE id = ?",
    [JSON.stringify(data), total, JSON.stringify(breakdown), JSON.stringify(recommendations), id]
  );
  return { total, breakdown, recommendations };
}

// ---------- Auth ----------

app.post("/api/auth/register", authRateLimit, async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isEmail(email) || !password || password.length < 8 || !name) {
    return res.status(400).json({ error: "email, mot de passe (8 caractères min) et nom requis" });
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: "un compte existe déjà avec cet email" });
  }
  const user = await createUser({ email, password, name });
  res.status(201).json({ token: issueToken(user), user });
});

app.post("/api/auth/login", authRateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(401).json({ error: "identifiants invalides" });
  const user = await findUserAndCheckPassword(email, password);
  if (!user) return res.status(401).json({ error: "identifiants invalides" });
  res.json({ token: issueToken(user), user });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const user = await findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: "introuvable" });
  res.json(user);
});

app.put("/api/me", requireAuth, async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 120);
  if (!name) return res.status(400).json({ error: "nom requis" });
  await updateUserName(req.user.sub, name);
  const user = await findUserByEmail(req.user.email);
  res.json(user);
});

app.post("/api/me/password", requireAuth, authRateLimit, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "mot de passe actuel et nouveau mot de passe (8 caractères min) requis" });
  }
  const ok = await changePassword(req.user.sub, currentPassword, newPassword);
  if (!ok) return res.status(401).json({ error: "mot de passe actuel incorrect" });
  res.json({ ok: true });
});

// ---------- Dashboard ----------

app.get("/api/dashboard/summary", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const [[{ resumeCount }]] = await db.query("SELECT COUNT(*) AS resumeCount FROM resumes WHERE user_id = ?", [userId]);
  const [[{ avgScore }]] = await db.query(
    "SELECT AVG(ats_score) AS avgScore FROM resumes WHERE user_id = ? AND ats_score IS NOT NULL",
    [userId]
  );
  const [[{ analysisCount }]] = await db.query(
    "SELECT COUNT(*) AS analysisCount FROM resumes WHERE user_id = ? AND ats_score IS NOT NULL",
    [userId]
  );
  const [recentResumes] = await db.query(
    "SELECT id, title, ats_score, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5",
    [userId]
  );
  res.json({
    resumeCount,
    avgScore: avgScore ? Math.round(avgScore) : null,
    analysisCount,
    recentResumes,
  });
});

// ---------- Resumes ----------

// Préparation du modèle SaaS (Free/Pro/Premium/Entreprise, cf. brief §25) : quota de CV par
// offre, appliqué avant toute création. `users.plan` vaut "free" par défaut pour tout le monde
// tant qu'il n'existe pas de flux de paiement/upgrade.
const PLAN_LIMITS = {
  free: { maxResumes: 5 },
  pro: { maxResumes: 30 },
  premium: { maxResumes: 100 },
  entreprise: { maxResumes: Infinity },
};

async function checkResumeQuota(req, res) {
  const [[user]] = await db.query("SELECT plan FROM users WHERE id = ?", [req.user.sub]);
  const plan = user?.plan || "free";
  const limit = PLAN_LIMITS[plan]?.maxResumes ?? PLAN_LIMITS.free.maxResumes;
  const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM resumes WHERE user_id = ?", [req.user.sub]);
  if (count >= limit) {
    res.status(403).json({ error: `Limite de ${limit} CV atteinte pour votre offre (${plan}). Supprimez un CV existant ou passez à une offre supérieure.` });
    return false;
  }
  return true;
}

app.get("/api/resumes", requireAuth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, title, template, source, ats_score, updated_at, created_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC",
    [req.user.sub]
  );
  res.json(rows);
});

app.post("/api/resumes", requireAuth, async (req, res) => {
  if (!(await checkResumeQuota(req, res))) return;
  const title = (req.body?.title || "Nouveau CV").slice(0, 190);
  const data = emptyResumeData();
  const { total, breakdown, recommendations } = scoreResume(data);
  const [result] = await db.query(
    "INSERT INTO resumes (user_id, title, data, template, source, ats_score, score_breakdown, recommendations) VALUES (?, ?, ?, 'violet', 'scratch', ?, ?, ?)",
    [req.user.sub, title, JSON.stringify(data), total, JSON.stringify(breakdown), JSON.stringify(recommendations)]
  );
  const row = await ownedResumeRow(result.insertId, req.user.sub);
  res.status(201).json(parseResumeRow(row));
});

app.post("/api/resumes/import", requireAuth, importRateLimit, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "fichier requis" });
  if (!(await checkResumeQuota(req, res))) {
    fs.unlink(req.file.path, () => {});
    return;
  }
  try {
    const buffer = fs.readFileSync(req.file.path);
    const text = await extractText(buffer, req.file.mimetype, req.file.originalname);
    const data = structureFromText(text, req.user.name);
    const title = req.file.originalname.replace(/\.(pdf|docx)$/i, "").slice(0, 190) || "CV importé";
    const { total, breakdown, recommendations } = scoreResume(data);
    const [result] = await db.query(
      `INSERT INTO resumes (user_id, title, data, template, source, original_filename, original_path, ats_score, score_breakdown, recommendations)
       VALUES (?, ?, ?, 'ats-classic', 'import', ?, ?, ?, ?, ?)`,
      [
        req.user.sub,
        title,
        JSON.stringify(data),
        req.file.originalname,
        req.file.path,
        total,
        JSON.stringify(breakdown),
        JSON.stringify(recommendations),
      ]
    );
    const row = await ownedResumeRow(result.insertId, req.user.sub);
    res.status(201).json(parseResumeRow(row));
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    res.status(422).json({ error: err.message || "échec de l'analyse du fichier" });
  }
});

app.get("/api/resumes/:id", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  res.json(parseResumeRow(row));
});

app.put("/api/resumes/:id", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });

  const title = req.body?.title != null ? String(req.body.title).slice(0, 190) : row.title;
  const template = req.body?.template ? String(req.body.template).slice(0, 40) : row.template;
  const data = req.body?.data ? normalizeResumeData(req.body.data) : normalizeResumeData(row.data);

  const scored = await saveScoredResume(row.id, data);
  await db.query("UPDATE resumes SET title = ?, template = ? WHERE id = ?", [title, template, row.id]);

  const updated = await ownedResumeRow(row.id, req.user.sub);
  res.json({ ...parseResumeRow(updated), ...scored });
});

app.post("/api/resumes/:id/duplicate", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  if (!(await checkResumeQuota(req, res))) return;
  const [result] = await db.query(
    "INSERT INTO resumes (user_id, title, data, template, source, ats_score, score_breakdown, recommendations) VALUES (?, ?, ?, ?, 'scratch', ?, ?, ?)",
    [
      req.user.sub,
      `${row.title} (copie)`.slice(0, 190),
      JSON.stringify(row.data),
      row.template,
      row.ats_score,
      JSON.stringify(row.score_breakdown),
      JSON.stringify(row.recommendations),
    ]
  );
  const created = await ownedResumeRow(result.insertId, req.user.sub);
  res.status(201).json(parseResumeRow(created));
});

app.delete("/api/resumes/:id", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  if (row.original_path) fs.unlink(row.original_path, () => {});
  await db.query("DELETE FROM resumes WHERE id = ?", [row.id]);
  res.json({ ok: true });
});

app.get("/api/resumes/:id/original", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row || !row.original_path || !fs.existsSync(row.original_path)) {
    return res.status(404).json({ error: "aucun fichier original" });
  }
  res.download(row.original_path, row.original_filename || "cv-original");
});

// ---------- Versions ----------

app.get("/api/resumes/:id/versions", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  const [versions] = await db.query(
    "SELECT id, label, ats_score, created_at FROM resume_versions WHERE resume_id = ? ORDER BY created_at DESC",
    [row.id]
  );
  res.json(versions);
});

app.post("/api/resumes/:id/versions", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  const label = req.body?.label ? String(req.body.label).slice(0, 120) : null;
  await db.query(
    "INSERT INTO resume_versions (resume_id, label, data, ats_score, score_breakdown) VALUES (?, ?, ?, ?, ?)",
    [row.id, label, JSON.stringify(row.data), row.ats_score, JSON.stringify(row.score_breakdown)]
  );
  res.status(201).json({ ok: true });
});

app.post("/api/resumes/:id/versions/:versionId/restore", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  const [versions] = await db.query("SELECT * FROM resume_versions WHERE id = ? AND resume_id = ?", [req.params.versionId, row.id]);
  if (!versions.length) return res.status(404).json({ error: "version introuvable" });
  const data = normalizeResumeData(typeof versions[0].data === "string" ? JSON.parse(versions[0].data) : versions[0].data);
  const scored = await saveScoredResume(row.id, data);
  const updated = await ownedResumeRow(row.id, req.user.sub);
  res.json({ ...parseResumeRow(updated), ...scored });
});

app.post("/api/resumes/:id/versions/:versionId/duplicate", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  if (!(await checkResumeQuota(req, res))) return;
  const [versions] = await db.query("SELECT * FROM resume_versions WHERE id = ? AND resume_id = ?", [req.params.versionId, row.id]);
  if (!versions.length) return res.status(404).json({ error: "version introuvable" });
  const v = versions[0];
  const data = normalizeResumeData(typeof v.data === "string" ? JSON.parse(v.data) : v.data);
  const [result] = await db.query(
    "INSERT INTO resumes (user_id, title, data, template, source, ats_score, score_breakdown, recommendations) VALUES (?, ?, ?, ?, 'scratch', ?, ?, ?)",
    [
      req.user.sub,
      `${row.title} (${v.label || "version"})`.slice(0, 190),
      JSON.stringify(data),
      row.template,
      v.ats_score,
      JSON.stringify(v.score_breakdown),
      "[]",
    ]
  );
  const created = await ownedResumeRow(result.insertId, req.user.sub);
  res.status(201).json(parseResumeRow(created));
});

// ---------- Job matching ----------

app.post("/api/resumes/:id/job-match", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  const jobText = String(req.body?.jobText || "").slice(0, 20000);
  if (!jobText.trim()) return res.status(400).json({ error: "texte de l'offre requis" });

  const data = normalizeResumeData(typeof row.data === "string" ? JSON.parse(row.data) : row.data);
  const result = matchResumeToJob(data, jobText);
  await db.query(
    "INSERT INTO job_matches (resume_id, job_text, match_score, matched_keywords, missing_keywords) VALUES (?, ?, ?, ?, ?)",
    [row.id, jobText, result.score, JSON.stringify(result.matched), JSON.stringify(result.missing)]
  );
  res.json(result);
});

app.get("/api/resumes/:id/job-match/latest", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  const [rows] = await db.query(
    "SELECT match_score AS score, matched_keywords AS matched, missing_keywords AS missing, created_at FROM job_matches WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1",
    [row.id]
  );
  res.json(rows[0] || null);
});

// ---------- Export ----------

app.get("/api/resumes/:id/export/:format", requireAuth, async (req, res) => {
  const row = await ownedResumeRow(req.params.id, req.user.sub);
  if (!row) return res.status(404).json({ error: "introuvable" });
  await sendExport(res, row, req.params.format);
});

async function sendExport(res, row, format) {
  const data = normalizeResumeData(typeof row.data === "string" ? JSON.parse(row.data) : row.data);
  const filename = (row.title || "cv").replace(/[^\w\- ]/g, "").trim() || "cv";
  if (format === "pdf") {
    const buffer = await buildResumePdf(data, row.template);
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}.pdf"` });
    return res.send(buffer);
  }
  if (format === "docx") {
    const buffer = await buildResumeDocx(data, row.template);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}.docx"`,
    });
    return res.send(buffer);
  }
  if (format === "txt") {
    const text = buildResumeTxt(data);
    res.set({ "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.txt"` });
    return res.send(text);
  }
  res.status(400).json({ error: "format non supporté" });
}

// ---------- Admin ----------

app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
  const [[{ newUsers7d }]] = await db.query("SELECT COUNT(*) AS newUsers7d FROM users WHERE created_at >= NOW() - INTERVAL 7 DAY");
  const [[{ onlineNow }]] = await db.query("SELECT COUNT(*) AS onlineNow FROM users WHERE last_seen_at >= NOW() - INTERVAL 5 MINUTE");
  const [[{ activeUsers30d }]] = await db.query("SELECT COUNT(*) AS activeUsers30d FROM users WHERE last_seen_at >= NOW() - INTERVAL 30 DAY");
  const [[{ totalResumes }]] = await db.query("SELECT COUNT(*) AS totalResumes FROM resumes");
  const [[{ analyzedResumes }]] = await db.query("SELECT COUNT(*) AS analyzedResumes FROM resumes WHERE ats_score IS NOT NULL");
  const [[{ importedResumes }]] = await db.query("SELECT COUNT(*) AS importedResumes FROM resumes WHERE source = 'import'");
  const [[{ avgScore }]] = await db.query("SELECT AVG(ats_score) AS avgScore FROM resumes WHERE ats_score IS NOT NULL");
  res.json({
    totalUsers,
    newUsers7d,
    onlineNow,
    activeUsers30d,
    totalResumes,
    analyzedResumes,
    importedResumes,
    avgScore: avgScore ? Math.round(avgScore) : null,
  });
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.name, u.plan, u.is_admin, u.created_at, u.last_seen_at,
            COUNT(r.id) AS resumeCount, AVG(r.ats_score) AS avgScore
     FROM users u LEFT JOIN resumes r ON r.user_id = u.id
     GROUP BY u.id ORDER BY u.created_at DESC`
  );
  res.json(rows.map((r) => ({ ...r, avgScore: r.avgScore ? Math.round(r.avgScore) : null })));
});

app.get("/api/admin/resumes", requireAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.id, r.title, r.template, r.source, r.ats_score, r.updated_at, r.created_at,
            (r.original_path IS NOT NULL) AS hasOriginal,
            u.id AS userId, u.name AS userName, u.email AS userEmail
     FROM resumes r JOIN users u ON u.id = r.user_id
     ORDER BY r.updated_at DESC`
  );
  res.json(rows.map((r) => ({ ...r, hasOriginal: Boolean(r.hasOriginal) })));
});

app.get("/api/admin/resumes/:id", requireAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, u.name AS userName, u.email AS userEmail
     FROM resumes r JOIN users u ON u.id = r.user_id WHERE r.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "introuvable" });
  const row = rows[0];
  res.json({ ...parseResumeRow(row), userName: row.userName, userEmail: row.userEmail });
});

app.get("/api/admin/resumes/:id/original", requireAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT original_path, original_filename FROM resumes WHERE id = ?", [req.params.id]);
  const row = rows[0];
  if (!row || !row.original_path || !fs.existsSync(row.original_path)) {
    return res.status(404).json({ error: "aucun fichier original" });
  }
  res.download(row.original_path, row.original_filename || "cv-original");
});

app.get("/api/admin/resumes/:id/export/:format", requireAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM resumes WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "introuvable" });
  await sendExport(res, rows[0], req.params.format);
});

app.get("/api/health", (req, res) => res.json({ ok: true, service: "atsme-api" }));

const port = process.env.PORT || 4200;
ensureAdminUser()
  .catch((err) => console.error("bootstrap admin:", err.message))
  .finally(() => {
    app.listen(port, () => console.log(`atsme-api sur le port ${port}`));
  });
