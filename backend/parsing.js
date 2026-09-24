import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { emptyResumeData, newId } from "./resumeModel.js";

const SECTION_PATTERNS = {
  experiences: /^(exp[ée]riences?( professionnelles?)?|work experience|employment)/i,
  education: /^(formations?|[ée]ducation|dipl[oô]mes?)/i,
  skills: /^(comp[ée]tences?|skills|technologies)/i,
  languages: /^(langues?|languages)/i,
  certifications: /^(certifications?|certificats?)/i,
  projects: /^(projets?|projects)/i,
  interests: /^(centres? d.int[ée]r[êe]t|interests|hobbies)/i,
  summary: /^(profil( professionnel)?|r[ée]sum[ée]|summary|[àa] propos|about)/i,
};
// Sections reconnues mais volontairement non collectées : coordonnées/contact sont déjà
// extraites du texte brut entier via EMAIL_RE/PHONE_RE/URL_RE, donc on se contente d'arrêter
// la contamination du bucket précédent plutôt que de dupliquer l'extraction.
const IGNORED_PATTERNS = {
  contact: /^(coordonn[ée]es?|contact)/i,
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Numéro FR (0X XX XX XX XX, avec ou sans séparateurs) ou international (+...) — volontairement
// strict pour ne pas confondre une plage d'années ("2025-2026") avec un téléphone.
const PHONE_RE = /(\+\d[\d .-]{7,}\d|0\d(?:[ .-]?\d{2}){4})/;
const URL_RE = /(https?:\/\/[^\s]+|(?:www\.)[^\s]+)/i;
const DATE_RANGE_RE = /((?:\d{4}|jan|f[ée]v|mar|avr|mai|juin|juil|ao[uû]t|sep|oct|nov|d[ée]c)[a-zéû.]*\s?\d{0,4})\s*[-–—àto]+\s*(pr[ée]sent|aujourd'?hui|current|now|(?:\d{4}|[a-zéû.]+\s?\d{0,4}))/i;

// Détecte un en-tête de section même quand l'extraction PDF a collé le contenu directement
// après (ex. "COORDONNÉEST éléphone : ...") : on isole le préfixe reconnu et on restitue le
// reste comme première ligne de la nouvelle section, au lieu de la perdre ou de la laisser
// polluer la section précédente.
function detectSection(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  for (const [key, re] of Object.entries(IGNORED_PATTERNS)) {
    const m = re.exec(trimmed);
    if (m && m.index === 0) return { key, rest: trimmed.slice(m[0].length).trim() };
  }
  for (const [key, re] of Object.entries(SECTION_PATTERNS)) {
    const m = re.exec(trimmed);
    if (m && m.index === 0) return { key, rest: trimmed.slice(m[0].length).trim() };
  }
  return null;
}

function looksLikeSectionHeader(line) {
  const trimmed = line.trim();
  return (
    Object.values(IGNORED_PATTERNS).some((re) => re.test(trimmed)) ||
    Object.values(SECTION_PATTERNS).some((re) => re.test(trimmed))
  );
}

// Choisit la ligne la plus plausible pour le nom complet plutôt que de faire confiance
// aveuglément à la première ligne extraite (qui peut être un bloc de sidebar mal ordonné).
function guessFullName(nonEmpty) {
  for (const raw of nonEmpty.slice(0, 8)) {
    const line = raw.trim();
    if (!line || line.length > 60) continue;
    if (/\d/.test(line) || EMAIL_RE.test(line) || URL_RE.test(line)) continue;
    if (looksLikeSectionHeader(line)) continue;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) return line;
  }
  return (nonEmpty[0] || "").trim();
}

function splitBlocks(lines) {
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length) blocks.push(current);
      current = [];
    } else {
      current.push(line.trim());
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

function parseExperienceBlock(block) {
  const dateMatch = block.join(" ").match(DATE_RANGE_RE);
  const headerLine = block[0] || "";
  const [rolePart, companyPart] = headerLine.split(/ [-–@|] /);
  return {
    id: newId(),
    company: (companyPart || headerLine).trim(),
    role: (rolePart || "").trim(),
    location: "",
    startDate: dateMatch ? dateMatch[1].trim() : "",
    endDate: dateMatch ? dateMatch[2].trim() : "",
    current: dateMatch ? /pr[ée]sent|current|now|aujourd/i.test(dateMatch[2]) : false,
    description: "",
    achievements: block.slice(1).filter((l) => l.length > 0),
    technologies: [],
  };
}

function parseEducationBlock(block) {
  const dateMatch = block.join(" ").match(DATE_RANGE_RE);
  return {
    id: newId(),
    school: block[0] || "",
    degree: block[1] || "",
    field: "",
    startDate: dateMatch ? dateMatch[1].trim() : "",
    endDate: dateMatch ? dateMatch[2].trim() : "",
    description: block.slice(2).join(" "),
  };
}

function splitList(text) {
  return text
    .split(/[,;•\n]/)
    .map((s) => cleanTag(s))
    .filter(Boolean);
}

// Retire les puces ("-", "–", "*") et le point final qu'une liste à puces laisse sur chaque
// ligne extraite — cosmétique uniquement, ne touche jamais au contenu utile de la ligne.
function cleanTag(s) {
  return s
    .trim()
    .replace(/^[-–•*]\s*/, "")
    .replace(/\.$/, "")
    .trim();
}

// Une "compétence" ou "langue" de plus de 60 caractères est presque toujours un fragment de
// phrase mal aiguillé (colonne voisine collée sans saut de ligne) plutôt qu'un intitulé réel —
// on l'exclut plutôt que d'afficher un tag illisible, sans jamais transformer son contenu.
const MAX_TAG_LEN = 60;
function isPlausibleTag(s) {
  return s.length > 0 && s.length <= MAX_TAG_LEN;
}

export async function extractText(buffer, mimetype, filename) {
  const lower = (filename || "").toLowerCase();
  if (mimetype === "application/pdf" || lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("format non supporté (PDF ou DOCX uniquement)");
}

// Reconstruit une structure CVData à partir du texte brut extrait, par règles déterministes.
// Ne complète jamais un champ absent avec une valeur inventée : au pire une section reste vide.
// `accountName` (le nom déjà fourni par l'utilisateur à son inscription) sert de valeur de
// confiance pour le nom complet : bien plus fiable qu'une heuristique sur un texte PDF dont
// l'ordre de lecture peut être brouillé par une mise en page en colonnes.
export function structureFromText(rawText, accountName) {
  const data = emptyResumeData();
  const lines = rawText.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trimEnd());
  const nonEmpty = lines.filter((l) => l.trim() !== "");

  const email = rawText.match(EMAIL_RE)?.[0] || "";
  const phone = rawText.match(PHONE_RE)?.[0] || "";
  data.personal.fullName = (accountName ? accountName.trim() : guessFullName(nonEmpty)).slice(0, 120);
  data.personal.email = email;
  data.personal.phone = phone;
  const link = rawText.match(URL_RE)?.[0];
  if (link) data.personal.links.push({ label: "Lien", url: link.startsWith("http") ? link : `https://${link}` });

  let currentSection = "summary";
  const buckets = { summary: [], experiences: [], education: [], skills: [], languages: [], certifications: [], projects: [], interests: [] };

  for (const line of lines.slice(1)) {
    const detected = detectSection(line);
    if (detected) {
      currentSection = detected.key;
      if (detected.rest && !EMAIL_RE.test(detected.rest)) buckets[currentSection]?.push(detected.rest);
      continue;
    }
    if (line.trim() === "" || EMAIL_RE.test(line) || (PHONE_RE.test(line) && line.trim().length < 30)) {
      if (line.trim() === "") buckets[currentSection]?.push("");
      continue;
    }
    buckets[currentSection]?.push(line);
  }

  data.summary = buckets.summary.join(" ").replace(/\s+/g, " ").trim().slice(0, 800);

  splitBlocks(buckets.experiences).forEach((block) => data.experiences.push(parseExperienceBlock(block)));
  splitBlocks(buckets.education).forEach((block) => data.education.push(parseEducationBlock(block)));

  splitList(buckets.skills.join(",")).filter(isPlausibleTag).forEach((name) => data.skills.push({ id: newId(), name, level: "" }));
  splitList(buckets.languages.join(",")).filter(isPlausibleTag).forEach((name) => data.languages.push({ id: newId(), name, level: "" }));
  buckets.certifications
    .map((c) => cleanTag(c))
    .filter(isPlausibleTag)
    .forEach((name) => data.certifications.push({ id: newId(), name, issuer: "", date: "" }));
  splitBlocks(buckets.projects).forEach((block) =>
    data.projects.push({ id: newId(), name: block[0] || "", description: block.slice(1).join(" "), url: "", technologies: [] })
  );
  splitList(buckets.interests.join(",")).filter(isPlausibleTag).forEach((i) => data.interests.push(i));

  return data;
}
