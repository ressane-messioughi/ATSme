export function emptyResumeData() {
  return {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", links: [], photoUrl: "" },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    interests: [],
  };
}

let seq = 1;
export function newId() {
  return `${Date.now().toString(36)}${(seq++).toString(36)}`;
}

// La photo arrive en data URI (redimensionnée côté navigateur avant l'envoi). On ne
// fait confiance ni au format ni à la taille annoncés par le client : un contenu qui ne
// ressemble pas à une image raisonnable est simplement ignoré plutôt que de gonfler la
// ligne en base ou de faire échouer la génération du PDF/DOCX plus tard.
const PHOTO_DATA_URL = /^data:image\/(png|jpe?g|webp);base64,[a-zA-Z0-9+/=]+$/;
const PHOTO_MAX_LENGTH = 700_000; // ~500 Ko décodés, largement suffisant pour un portrait

function sanitizePhotoUrl(value) {
  if (typeof value !== "string" || !value) return "";
  if (value.length > PHOTO_MAX_LENGTH) return "";
  if (!PHOTO_DATA_URL.test(value)) return "";
  return value;
}

// Normalise un objet arbitraire vers la forme CVData attendue, sans jamais inventer de contenu :
// tout champ absent reste vide plutôt que d'être rempli par une valeur par défaut fictive.
export function normalizeResumeData(input) {
  const base = emptyResumeData();
  if (!input || typeof input !== "object") return base;
  return {
    personal: {
      ...base.personal,
      ...(input.personal || {}),
      photoUrl: sanitizePhotoUrl(input.personal?.photoUrl),
    },
    summary: typeof input.summary === "string" ? input.summary : "",
    experiences: Array.isArray(input.experiences) ? input.experiences : [],
    education: Array.isArray(input.education) ? input.education : [],
    skills: Array.isArray(input.skills) ? input.skills : [],
    languages: Array.isArray(input.languages) ? input.languages : [],
    certifications: Array.isArray(input.certifications) ? input.certifications : [],
    projects: Array.isArray(input.projects) ? input.projects : [],
    achievements: Array.isArray(input.achievements) ? input.achievements : [],
    interests: Array.isArray(input.interests) ? input.interests : [],
  };
}
