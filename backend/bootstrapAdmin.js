import bcrypt from "bcryptjs";
import db from "./db.js";

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length) {
    await db.query("UPDATE users SET is_admin = 1 WHERE email = ?", [email]);
    return;
  }
  const password_hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, 'Admin ATSme', 1)",
    [email, password_hash]
  );
  console.log(`atsme-api: compte admin initialisé (${email})`);
}
