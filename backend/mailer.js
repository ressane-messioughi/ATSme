import nodemailer from "nodemailer";

// Réutilise la boîte déjà configurée côté admin.ressane.fr (Gmail SMTP). Si MAIL_USER/
// MAIL_PASS ne sont pas définis (dev local par exemple), on n'envoie rien de réel : chaque
// appel se contente de logguer le lien, pour ne jamais bloquer le flux d'inscription/reset.
const mailer =
  process.env.MAIL_USER && process.env.MAIL_PASS
    ? nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      })
    : null;

async function send({ to, subject, html, text }) {
  if (!mailer) {
    console.log(`[mailer] pas de MAIL_USER/MAIL_PASS configuré — email non envoyé à ${to} : ${subject}`);
    console.log(text);
    return;
  }
  await mailer.sendMail({ from: `"ATSme" <${process.env.MAIL_USER}>`, to, subject, html, text });
}

const wrap = (title, bodyHtml) => `
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#3b2f25">
  <div style="font-weight:900;font-size:22px;margin-bottom:20px;color:#4f7f52">🐱 ATSme</div>
  <h1 style="font-size:19px;margin:0 0 14px">${title}</h1>
  ${bodyHtml}
  <p style="margin-top:32px;font-size:12px;color:#7d6a55">Vous recevez cet email car cette adresse a été utilisée sur atsme.ressane.fr.</p>
</div>`;

export async function sendVerificationEmail(to, verifyUrl) {
  await send({
    to,
    subject: "Confirmez votre adresse email — ATSme",
    html: wrap(
      "Confirmez votre adresse email",
      `<p style="line-height:1.6">Bienvenue sur ATSme. Cliquez sur le bouton ci-dessous pour activer votre compte (lien valable 24h).</p>
       <p><a href="${verifyUrl}" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#4f7f52;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Confirmer mon email</a></p>
       <p style="font-size:12px;color:#7d6a55;word-break:break-all">Ou copiez ce lien : ${verifyUrl}</p>`
    ),
    text: `Confirmez votre adresse email sur ATSme : ${verifyUrl} (valable 24h)`,
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  await send({
    to,
    subject: "Réinitialisation de votre mot de passe — ATSme",
    html: wrap(
      "Réinitialisez votre mot de passe",
      `<p style="line-height:1.6">Une demande de réinitialisation de mot de passe a été faite pour ce compte. Si ce n'est pas vous, ignorez cet email.</p>
       <p><a href="${resetUrl}" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#4f7f52;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Choisir un nouveau mot de passe</a></p>
       <p style="font-size:12px;color:#7d6a55;word-break:break-all">Ou copiez ce lien (valable 1h) : ${resetUrl}</p>`
    ),
    text: `Réinitialisez votre mot de passe ATSme : ${resetUrl} (valable 1h)`,
  });
}
