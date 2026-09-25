import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  TextWrappingType,
  TextWrappingSide,
} from "docx";
import { styleFor } from "../templateStyles.js";

const DIM = "5C5870";

// Même logique que exporters/pdf.js : décode la data URI (déjà validée par
// resumeModel.js) en Buffer. La bibliothèque docx ne sait embarquer que jpg/png/gif/bmp
// (pas webp) : dans ce cas rare, la photo reste dans le PDF mais est simplement omise du
// DOCX plutôt que de faire échouer tout l'export.
function decodePhoto(photoUrl) {
  if (!photoUrl) return null;
  const match = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(photoUrl);
  if (!match) return null;
  const type = match[1] === "png" ? "png" : match[1] === "webp" ? null : "jpg";
  if (!type) return null;
  try {
    return { buffer: Buffer.from(match[2], "base64"), type };
  } catch {
    return null;
  }
}

function heading(text, style) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text: style.upper ? text.toUpperCase() : text, color: style.accent, bold: true, size: 20, font: style.docxHeadingFont })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, ...opts })] });
}

export async function buildResumeDocx(data, template) {
  const s = styleFor(template);
  const style = { ...s, docxHeadingFont: s.headingFont.startsWith("Times") ? "Times New Roman" : "Arial" };
  const bodyFontName = style.bodyFont.startsWith("Times") ? "Times New Roman" : "Arial";
  const children = [];

  // La photo flotte au-dessus du texte, ancrée au coin haut-droit de la page : elle ne
  // s'insère dans aucun paragraphe de contenu et ne produit aucun texte extractible, donc
  // ne modifie jamais l'ordre de lecture linéaire du document (cf. la même remarque dans
  // exporters/pdf.js).
  const photo = decodePhoto(data.personal.photoUrl);
  if (photo) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: photo.type,
            data: photo.buffer,
            transformation: { width: 90, height: 90 },
            floating: {
              horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, align: HorizontalPositionAlign.RIGHT },
              verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, align: VerticalPositionAlign.TOP },
              margins: { top: 360, right: 360 },
              wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
            },
          }),
        ],
      })
    );
  }

  // Marge de sécurité en plus du habillage "square" : certains moteurs de rendu ne
  // recalculent pas toujours la largeur des paragraphes autour d'une image flottante
  // aussi finement que Word. En réservant explicitement la largeur du médaillon sur les
  // trois lignes d'en-tête, le nom ne peut jamais passer derrière la photo, quel que soit
  // le logiciel qui ouvre le document.
  const headerIndent = photo ? { right: 2260 } : undefined;

  children.push(
    new Paragraph({
      indent: headerIndent,
      children: [new TextRun({ text: data.personal.fullName || "Sans nom", bold: true, size: 40, font: bodyFontName })],
    })
  );
  if (data.personal.title) {
    children.push(
      new Paragraph({
        indent: headerIndent,
        children: [new TextRun({ text: data.personal.title, color: style.accent, size: 24, font: bodyFontName })],
      })
    );
  }
  const contact = [data.personal.email, data.personal.phone, data.personal.location, ...data.personal.links.map((l) => l.url)]
    .filter(Boolean)
    .join("  •  ");
  if (contact)
    children.push(
      new Paragraph({ indent: headerIndent, spacing: { after: 200 }, children: [new TextRun({ text: contact, color: DIM, size: 18 })] })
    );

  if (data.summary) {
    children.push(heading("Profil", style));
    children.push(para(data.summary));
  }

  if (data.experiences.length) {
    children.push(heading("Expérience professionnelle", style));
    data.experiences.forEach((e) => {
      children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `${e.role || "Poste"} — ${e.company || "Entreprise"}`, bold: true })] }));
      const dates = [e.startDate, e.current ? "Présent" : e.endDate].filter(Boolean).join(" – ");
      const meta = [dates, e.location].filter(Boolean).join("   ·   ");
      if (meta) children.push(new Paragraph({ children: [new TextRun({ text: meta, color: DIM, size: 18 })] }));
      if (e.description) children.push(para(e.description));
      (e.achievements || []).forEach((a) => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: a })] })));
    });
  }

  if (data.education.length) {
    children.push(heading("Formation", style));
    data.education.forEach((ed) => {
      children.push(new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: [ed.degree, ed.field].filter(Boolean).join(" — ") || ed.school, bold: true })] }));
      const meta = [ed.school, [ed.startDate, ed.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("   ·   ");
      if (meta) children.push(new Paragraph({ children: [new TextRun({ text: meta, color: DIM, size: 18 })] }));
      if (ed.description) children.push(para(ed.description));
    });
  }

  if (data.skills.length) {
    children.push(heading("Compétences", style));
    children.push(para(data.skills.map((s) => s.name).join("   •   ")));
  }

  if (data.languages.length) {
    children.push(heading("Langues", style));
    children.push(para(data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("   •   ")));
  }

  if (data.certifications.length) {
    children.push(heading("Certifications", style));
    data.certifications.forEach((c) => children.push(para([c.name, c.issuer, c.date].filter(Boolean).join("  —  "))));
  }

  if (data.projects.length) {
    children.push(heading("Projets", style));
    data.projects.forEach((p) => {
      children.push(new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: p.name, bold: true })] }));
      if (p.description) children.push(para(p.description));
    });
  }

  if (data.interests.length) {
    children.push(heading("Centres d'intérêt", style));
    children.push(para(data.interests.join("   •   ")));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
