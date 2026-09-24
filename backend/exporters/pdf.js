import PDFDocument from "pdfkit";
import { styleFor } from "../templateStyles.js";

const INK = "#1c1a24";
const DIM = "#5c5870";

function contactLine(personal) {
  return [personal.email, personal.phone, personal.location, ...personal.links.map((l) => l.url)]
    .filter(Boolean)
    .join("   •   ");
}

function sectionTitle(doc, text, style) {
  doc.moveDown(0.8);
  doc
    .fillColor(style.accentHex)
    .fontSize(11)
    .font(style.headingFont)
    .text(style.upper ? text.toUpperCase() : text, { characterSpacing: style.upper ? 0.6 : 0 });
  if (style.divider) {
    doc.moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - doc.page.margins.right, doc.y + 2).strokeColor("#d8d4e8").lineWidth(1).stroke();
  }
  doc.moveDown(0.5);
  doc.fillColor(INK);
}

export function buildResumePdf(data, template) {
  const s = styleFor(template);
  const style = { ...s, accentHex: `#${s.accent}`, bodyFontReg: s.bodyFont };
  const bodyBold = style.bodyFont === "Times-Roman" ? "Times-Bold" : "Helvetica-Bold";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor(INK).font(style.nameFont).fontSize(22).text(data.personal.fullName || "Sans nom");
    if (data.personal.title) {
      doc.font(style.bodyFont).fontSize(13).fillColor(style.accentHex).text(data.personal.title);
    }
    const contact = contactLine(data.personal);
    if (contact) {
      doc.moveDown(0.3);
      doc.font(style.bodyFont).fontSize(9.5).fillColor(DIM).text(contact);
    }

    if (data.summary) {
      sectionTitle(doc, "Profil", style);
      doc.font(style.bodyFont).fontSize(10.5).fillColor(INK).text(data.summary, { lineGap: 2 });
    }

    if (data.experiences.length) {
      sectionTitle(doc, "Expérience professionnelle", style);
      data.experiences.forEach((e, i) => {
        if (i > 0) doc.moveDown(0.6);
        doc.font(bodyBold).fontSize(11).fillColor(INK).text(`${e.role || "Poste"} — ${e.company || "Entreprise"}`);
        const dates = [e.startDate, e.current ? "Présent" : e.endDate].filter(Boolean).join(" – ");
        const meta = [dates, e.location].filter(Boolean).join("   ·   ");
        if (meta) doc.font(style.bodyFont).fontSize(9.5).fillColor(DIM).text(meta);
        if (e.description) doc.font(style.bodyFont).fontSize(10).fillColor(INK).moveDown(0.15).text(e.description, { lineGap: 2 });
        (e.achievements || []).forEach((a) => {
          doc.font(style.bodyFont).fontSize(10).fillColor(INK).text(`•  ${a}`, { indent: 10, lineGap: 2 });
        });
      });
    }

    if (data.education.length) {
      sectionTitle(doc, "Formation", style);
      data.education.forEach((ed, i) => {
        if (i > 0) doc.moveDown(0.4);
        doc.font(bodyBold).fontSize(10.5).fillColor(INK).text([ed.degree, ed.field].filter(Boolean).join(" — ") || ed.school);
        const meta = [ed.school, [ed.startDate, ed.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("   ·   ");
        if (meta) doc.font(style.bodyFont).fontSize(9.5).fillColor(DIM).text(meta);
        if (ed.description) doc.font(style.bodyFont).fontSize(10).fillColor(INK).text(ed.description, { lineGap: 2 });
      });
    }

    if (data.skills.length) {
      sectionTitle(doc, "Compétences", style);
      doc.font(style.bodyFont).fontSize(10.5).fillColor(INK).text(data.skills.map((s2) => s2.name).join("   •   "), { lineGap: 3 });
    }

    if (data.languages.length) {
      sectionTitle(doc, "Langues", style);
      doc.font(style.bodyFont).fontSize(10.5).fillColor(INK).text(
        data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("   •   ")
      );
    }

    if (data.certifications.length) {
      sectionTitle(doc, "Certifications", style);
      data.certifications.forEach((c) => {
        doc.font(style.bodyFont).fontSize(10.5).fillColor(INK).text([c.name, c.issuer, c.date].filter(Boolean).join("  —  "));
      });
    }

    if (data.projects.length) {
      sectionTitle(doc, "Projets", style);
      data.projects.forEach((p, i) => {
        if (i > 0) doc.moveDown(0.3);
        doc.font(bodyBold).fontSize(10.5).fillColor(INK).text(p.name);
        if (p.description) doc.font(style.bodyFont).fontSize(10).fillColor(INK).text(p.description, { lineGap: 2 });
      });
    }

    if (data.interests.length) {
      sectionTitle(doc, "Centres d'intérêt", style);
      doc.font(style.bodyFont).fontSize(10.5).fillColor(INK).text(data.interests.join("   •   "));
    }

    doc.end();
  });
}
