import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./db.js";

export async function createUser({ email, password, name }) {
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
    [email, password_hash, name]
  );
  return { id: result.insertId, email, name, plan: "free" };
}

export async function findUserByEmail(email) {
  const [rows] = await db.query("SELECT id, email, name, plan, is_admin FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

export async function findUserAndCheckPassword(email, plain) {
  const [rows] = await db.query(
    "SELECT id, email, name, plan, is_admin, password_hash FROM users WHERE email = ?",
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
