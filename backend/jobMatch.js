// Comparaison CV ↔ offre par recouvrement de mots-clés — déterministe, sans appel IA.

const STOPWORDS = new Set(
  `le la les un une des de du au aux et ou en pour par avec sans sur sous dans est sont
   ce cet cette ces vous nous votre vos notre nos son sa ses leur leurs qui que quoi dont
   the a an of to in on for with and or is are be will your our their this that these
   we you they poste offre entreprise mission missions profil recherche recherchons`
    .split(/\s+/)
    .filter(Boolean)
);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ0-9+.#]{3,}/gi) || []).filter(
    (w) => !STOPWORDS.has(w)
  );
}

function topKeywords(tokens, limit = 25) {
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function matchResumeToJob(data, jobText) {
  const jobKeywords = topKeywords(tokenize(jobText));

  const resumeText = [
    data.summary,
    ...data.skills.map((s) => s.name),
    ...data.experiences.flatMap((e) => [e.role, e.company, e.description, ...(e.achievements || [])]),
    ...data.projects.flatMap((p) => [p.name, p.description]),
  ]
    .join(" ")
    .toLowerCase();

  const matched = jobKeywords.filter((k) => resumeText.includes(k));
  const missing = jobKeywords.filter((k) => !resumeText.includes(k));
  const score = jobKeywords.length ? Math.round((matched.length / jobKeywords.length) * 100) : 0;

  return { score, matched, missing };
}
