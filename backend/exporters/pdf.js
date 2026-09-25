import PDFDocument from "pdfkit";
import { styleFor } from "../templateStyles.js";

const INK = "#1c1a24";
const DIM = "#5c5870";
const BASE_MARGIN = 54;

function contactLine(personal) {
  return [personal.email, personal.phone, personal.location, ...personal.links.map((l) => l.url)]
    .filter(Boolean)
    .join("   •   ");
}

// La photo arrive en data URI (déjà validée et bornée en taille par resumeModel.js).
// pdfkit attend un Buffer ou un chemin de fichier, jamais une chaîne data: — on décode
// donc la partie base64 ici.
function decodePhoto(photoUrl) {
  if (!photoUrl) return null;
  const match = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(photoUrl);
  if (!match) return null;
  try {
    return Buffer.from(match[2], "base64");
  } catch {
    return null;
  }
}

function sectionTitle(doc, text, style, scale) {
  doc.moveDown(0.8 * scale);
  doc
    .fillColor(style.accentHex)
    .fontSize(11 * scale)
    .font(style.headingFont)
    .text(style.upper ? text.toUpperCase() : text, { characterSpacing: style.upper ? 0.6 : 0 });
  if (style.divider) {
    doc.moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - doc.page.margins.right, doc.y + 2).strokeColor("#d8d4e8").lineWidth(1).stroke();
  }
  doc.moveDown(0.5 * scale);
  doc.fillColor(INK);
}

// Construit le PDF à une échelle donnée (1 = taille normale). En dessous de 1, tailles de
// police et espacements rétrécissent proportionnellement — c'est ce levier que
// buildResumePdf actionne pour tenir sur une seule page, sans jamais toucher au contenu
// ni à l'ordre de lecture linéaire dont dépend un ATS.
function renderAtScale(data, template, scale) {
  const s = styleFor(template);
  const style = { ...s, accentHex: `#${s.accent}`, bodyFontReg: s.bodyFont };
  const bodyBold = style.bodyFont === "Times-Roman" ? "Times-Bold" : "Helvetica-Bold";
  const margin = Math.round(BASE_MARGIN * Math.max(scale, 0.72));
  const photo = decodePhoto(data.personal.photoUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin, size: "A4", bufferPages: true });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);

    // La photo est posée en coordonnées absolues, dans le coin haut-droit de la première
    // page : elle ne fait donc jamais avancer le curseur de texte (doc.x/doc.y), qui reste
    // celui du bloc nom/titre/contact juste en dessous. Aucune colonne, aucun tableau,
    // aucun caractère de texte ne provient de cette image — un extracteur ATS qui lit le
    // flux de texte du PDF ne "voit" jamais la photo, dans le désordre ou autrement.
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let headerWidth = contentWidth;
    if (photo) {
      const size = Math.round(64 * Math.max(scale, 0.8));
      const px = doc.page.width - doc.page.margins.right - size;
      const py = doc.page.margins.top;
      // Sans cette réservation, un nom, un titre ou une ligne de contact assez longs
      // passaient tout droit sous la photo au lieu de s'arrêter avant elle — pdfkit ne
      // sait pas qu'une zone circulaire y est occupée tant qu'on ne le lui dit pas.
      headerWidth = px - doc.page.margins.left - 14;
      try {
        doc.save();
        doc.circle(px + size / 2, py + size / 2, size / 2).clip();
        doc.image(photo, px, py, { cover: [size, size] });
        doc.restore();
        doc.circle(px + size / 2, py + size / 2, size / 2).lineWidth(1.5).strokeColor("#d8d4e8").stroke();
      } catch {
        // Une image corrompue ne doit jamais faire échouer l'export du CV entier.
        doc.restore();
      }
    }

    doc
      .fillColor(INK)
      .font(style.nameFont)
      .fontSize(22 * scale)
      .text(data.personal.fullName || "Sans nom", doc.page.margins.left, doc.y, { width: headerWidth });
    if (data.personal.title) {
      doc.font(style.bodyFont).fontSize(13 * scale).fillColor(style.accentHex).text(data.personal.title, { width: headerWidth });
    }
    const contact = contactLine(data.personal);
    if (contact) {
      doc.moveDown(0.3 * scale);
      doc.font(style.bodyFont).fontSize(9.5 * scale).fillColor(DIM).text(contact, { width: headerWidth });
    }

    // Le bloc nom/titre/contact peut être plus court que la photo (nom court, pas de
    // titre) : sans ce plancher, les sections qui suivent remonteraient sous la photo au
    // lieu de commencer une fois le médaillon dégagé.
    if (photo) {
      const size = Math.round(64 * Math.max(scale, 0.8));
      const photoBottom = doc.page.margins.top + size;
      if (doc.y < photoBottom) doc.y = photoBottom;
    }

    if (data.summary) {
      sectionTitle(doc, "Profil", style, scale);
      doc.font(style.bodyFont).fontSize(10.5 * scale).fillColor(INK).text(data.summary, { lineGap: 2 * scale });
    }

    if (data.experiences.length) {
      sectionTitle(doc, "Expérience professionnelle", style, scale);
      data.experiences.forEach((e, i) => {
        if (i > 0) doc.moveDown(0.6 * scale);
        doc.font(bodyBold).fontSize(11 * scale).fillColor(INK).text(`${e.role || "Poste"} — ${e.company || "Entreprise"}`);
        const dates = [e.startDate, e.current ? "Présent" : e.endDate].filter(Boolean).join(" – ");
        const meta = [dates, e.location].filter(Boolean).join("   ·   ");
        if (meta) doc.font(style.bodyFont).fontSize(9.5 * scale).fillColor(DIM).text(meta);
        if (e.description)
          doc.font(style.bodyFont).fontSize(10 * scale).fillColor(INK).moveDown(0.15 * scale).text(e.description, { lineGap: 2 * scale });
        (e.achievements || []).forEach((a) => {
          doc.font(style.bodyFont).fontSize(10 * scale).fillColor(INK).text(`•  ${a}`, { indent: 10, lineGap: 2 * scale });
        });
      });
    }

    if (data.education.length) {
      sectionTitle(doc, "Formation", style, scale);
      data.education.forEach((ed, i) => {
        if (i > 0) doc.moveDown(0.4 * scale);
        doc.font(bodyBold).fontSize(10.5 * scale).fillColor(INK).text([ed.degree, ed.field].filter(Boolean).join(" — ") || ed.school);
        const meta = [ed.school, [ed.startDate, ed.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("   ·   ");
        if (meta) doc.font(style.bodyFont).fontSize(9.5 * scale).fillColor(DIM).text(meta);
        if (ed.description) doc.font(style.bodyFont).fontSize(10 * scale).fillColor(INK).text(ed.description, { lineGap: 2 * scale });
      });
    }

    if (data.skills.length) {
      sectionTitle(doc, "Compétences", style, scale);
      doc.font(style.bodyFont).fontSize(10.5 * scale).fillColor(INK).text(data.skills.map((s2) => s2.name).join("   •   "), { lineGap: 3 * scale });
    }

    if (data.languages.length) {
      sectionTitle(doc, "Langues", style, scale);
      doc.font(style.bodyFont).fontSize(10.5 * scale).fillColor(INK).text(
        data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("   •   ")
      );
    }

    if (data.certifications.length) {
      sectionTitle(doc, "Certifications", style, scale);
      data.certifications.forEach((c) => {
        doc.font(style.bodyFont).fontSize(10.5 * scale).fillColor(INK).text([c.name, c.issuer, c.date].filter(Boolean).join("  —  "));
      });
    }

    if (data.projects.length) {
      sectionTitle(doc, "Projets", style, scale);
      data.projects.forEach((p, i) => {
        if (i > 0) doc.moveDown(0.3 * scale);
        doc.font(bodyBold).fontSize(10.5 * scale).fillColor(INK).text(p.name);
        if (p.description) doc.font(style.bodyFont).fontSize(10 * scale).fillColor(INK).text(p.description, { lineGap: 2 * scale });
      });
    }

    if (data.interests.length) {
      sectionTitle(doc, "Centres d'intérêt", style, scale);
      doc.font(style.bodyFont).fontSize(10.5 * scale).fillColor(INK).text(data.interests.join("   •   "));
    }

    // bufferPages permet de compter les pages déjà produites avant de finaliser le
    // document : c'est ce que buildResumePdf lit pour décider si l'échelle testée tient
    // sur une seule page, sans avoir à ouvrir le PDF généré pour le savoir.
    const pageCount = doc.bufferedPageRange().count;
    doc.on("end", () => resolve({ buffer: Buffer.concat(chunks), pageCount }));
    doc.end();
  });
}

// scale décroissants essayés pour le mode "une seule page" : chaque palier reste lisible
// (aucun ne descend sous 80% de sa taille d'origine côté police), on s'arrête au premier
// qui tient, et à défaut on garde le plus compact plutôt que d'échouer l'export.
const SINGLE_PAGE_SCALES = [1, 0.93, 0.87, 0.82, 0.78, 0.75];

export async function buildResumePdf(data, template, options = {}) {
  if (!options.singlePage) {
    const { buffer } = await renderAtScale(data, template, 1);
    return buffer;
  }

  let last;
  for (const scale of SINGLE_PAGE_SCALES) {
    const result = await renderAtScale(data, template, scale);
    last = result.buffer;
    if (result.pageCount <= 1) return result.buffer;
  }
  return last;
}
