export function emptyResumeData() {
  return {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", links: [] },
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

// Normalise un objet arbitraire vers la forme CVData attendue, sans jamais inventer de contenu :
// tout champ absent reste vide plutôt que d'être rempli par une valeur par défaut fictive.
export function normalizeResumeData(input) {
  const base = emptyResumeData();
  if (!input || typeof input !== "object") return base;
  return {
    personal: { ...base.personal, ...(input.personal || {}) },
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
