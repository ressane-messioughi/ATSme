import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./db.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mailer.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const APP_URL = process.env.APP_URL || "https://atsme.ressane.fr";

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createUser({ email, password, name }) {
  const password_hash = await bcrypt.hash(password, 10);
  const verify_token = newToken();
  const verify_token_expires = new Date(Date.now() + VERIFY_TTL_MS);
  const [result] = await db.query(
    "INSERT INTO users (email, password_hash, name, verify_token, verify_token_expires) VALUES (?, ?, ?, ?, ?)",
    [email, password_hash, name, verify_token, verify_token_expires]
  );
  await sendVerificationEmail(email, `${APP_URL}/verifier-email?token=${verify_token}`).catch((err) =>
    console.error("[mailer] échec envoi email de vérification :", err.message)
  );
  return { id: result.insertId, email, name, plan: "free" };
}

export async function findUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, email, name, plan, is_admin, avatar, email_verified_at, bonus_resumes FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
}

export async function findUserAndCheckPassword(email, plain) {
  const [rows] = await db.query(
    "SELECT id, email, name, plan, is_admin, avatar, email_verified_at, bonus_resumes, password_hash FROM users WHERE email = ?",
    [email]
  );
  if (!rows.length) return null;
  const user = rows[0];
  const ok = await bcrypt.compare(plain, user.password_hash);
  if (!ok) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

export async function updateUserName(id, name) {
  await db.query("UPDATE users SET name = ? WHERE id = ?", [name, id]);
}

const AVATARS = ["cat", "fox", "owl", "bear", "robot", "star", "rocket", "plant", "coffee", "book"];

export async function updateUserAvatar(id, avatar) {
  if (avatar !== null && !AVATARS.includes(avatar)) throw new Error("avatar invalide");
  await db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatar, id]);
}

export async function verifyEmailToken(token) {
  const [rows] = await db.query(
    "SELECT id, email, name, plan, is_admin, avatar, bonus_resumes FROM users WHERE verify_token = ? AND verify_token_expires > NOW()",
    [token]
  );
  if (!rows.length) return null;
  const user = rows[0];
  await db.query(
    "UPDATE users SET email_verified_at = NOW(), verify_token = NULL, verify_token_expires = NULL WHERE id = ?",
    [user.id]
  );
  return user;
}

export async function resendVerification(email) {
  const [rows] = await db.query("SELECT id, email_verified_at FROM users WHERE email = ?", [email]);
  if (!rows.length || rows[0].email_verified_at) return; // ne révèle jamais si le compte existe déjà / est vérifié
  const verify_token = newToken();
  const verify_token_expires = new Date(Date.now() + VERIFY_TTL_MS);
  await db.query("UPDATE users SET verify_token = ?, verify_token_expires = ? WHERE id = ?", [
    verify_token,
    verify_token_expires,
    rows[0].id,
  ]);
  await sendVerificationEmail(email, `${APP_URL}/verifier-email?token=${verify_token}`).catch((err) =>
    console.error("[mailer] échec renvoi email de vérification :", err.message)
  );
}

export async function requestPasswordReset(email) {
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (!rows.length) return; // ne révèle jamais si l'email existe
  const reset_token = newToken();
  const reset_token_expires = new Date(Date.now() + RESET_TTL_MS);
  await db.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [
    reset_token,
    reset_token_expires,
    rows[0].id,
  ]);
  await sendPasswordResetEmail(email, `${APP_URL}/reinitialiser-mot-de-passe?token=${reset_token}`).catch((err) =>
    console.error("[mailer] échec envoi email de réinitialisation :", err.message)
  );
}

export async function resetPasswordWithToken(token, newPassword) {
  const [rows] = await db.query("SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()", [token]);
  if (!rows.length) return false;
  const password_hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", [
    password_hash,
    rows[0].id,
  ]);
  return true;
}

export async function changePassword(id, currentPassword, newPassword) {
  const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [id]);
  if (!rows.length) return false;
  const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!ok) return false;
  const password_hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, id]);
  return true;
}

export function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // Trace réelle de dernière activité (utilisée par le panel admin pour un statut
    // en ligne/hors ligne honnête) — fire-and-forget, ne bloque jamais la requête.
    db.query("UPDATE users SET last_seen_at = NOW() WHERE id = ?", [req.user.sub]).catch(() => {});
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export async function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    const [rows] = await db.query("SELECT is_admin FROM users WHERE id = ?", [req.user.sub]);
    if (!rows.length || !rows[0].is_admin) return res.status(403).json({ error: "forbidden" });
    next();
  });
}
