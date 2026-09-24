export function buildResumeTxt(data) {
  const lines = [];
  lines.push(data.personal.fullName || "Sans nom");
  if (data.personal.title) lines.push(data.personal.title);
  const contact = [data.personal.email, data.personal.phone, data.personal.location, ...data.personal.links.map((l) => l.url)]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);
  lines.push("");

  if (data.summary) {
    lines.push("PROFIL", data.summary, "");
  }

  if (data.experiences.length) {
    lines.push("EXPÉRIENCE PROFESSIONNELLE");
    data.experiences.forEach((e) => {
      lines.push(`${e.role || "Poste"} — ${e.company || "Entreprise"}`);
      const dates = [e.startDate, e.current ? "Présent" : e.endDate].filter(Boolean).join(" - ");
      if (dates) lines.push(dates);
      if (e.description) lines.push(e.description);
      (e.achievements || []).forEach((a) => lines.push(`- ${a}`));
      lines.push("");
    });
  }

  if (data.education.length) {
    lines.push("FORMATION");
    data.education.forEach((ed) => {
      lines.push([ed.degree, ed.field].filter(Boolean).join(" - ") || ed.school);
      lines.push(ed.school);
      lines.push("");
    });
  }

  if (data.skills.length) lines.push("COMPÉTENCES", data.skills.map((s) => s.name).join(", "), "");
  if (data.languages.length) lines.push("LANGUES", data.languages.map((l) => l.name).join(", "), "");
  if (data.certifications.length) lines.push("CERTIFICATIONS", ...data.certifications.map((c) => c.name), "");
  if (data.projects.length) {
    lines.push("PROJETS");
    data.projects.forEach((p) => lines.push(p.name, p.description || "", ""));
  }
  if (data.interests.length) lines.push("CENTRES D'INTÉRÊT", data.interests.join(", "));

  return lines.join("\n");
}
