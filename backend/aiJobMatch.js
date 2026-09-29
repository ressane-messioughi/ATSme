// Analyse CV ↔ offre par IA (Gemini). Ne doit jamais faire échouer le flux principal : toute
// erreur (pas de clé, quota, réseau, JSON invalide) renvoie null et l'appelant retombe sur
// l'analyse déterministe par mots-clés (jobMatch.js).

const GEMINI_MODEL = "gemini-3.8-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    matched: { type: "array", items: { type: "string" } },
    missing: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
  },
  required: ["score", "matched", "missing", "suggestions"],
};

function resumeSummaryText(data) {
  return [
    data.personal?.title,
    data.summary,
    ...(data.skills || []).map((s) => s.name),
    ...(data.experiences || []).flatMap((e) => [e.role, e.company, e.description, ...(e.achievements || [])]),
    ...(data.projects || []).flatMap((p) => [p.name, p.description]),
    ...(data.education || []).map((e) => `${e.degree} ${e.school}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export async function aiJobMatch(resumeData, jobText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tu es un recruteur technique francophone expert en ATS (Applicant Tracking System).
Compare le CV ci-dessous à l'offre d'emploi et réponds UNIQUEMENT avec un objet JSON conforme au schéma demandé.

- score : pourcentage de correspondance global (0 à 100), en tenant compte des compétences, de l'expérience et du niveau requis, pas seulement des mots-clés exacts.
- matched : 8 à 15 compétences/mots-clés de l'offre que le CV couvre réellement (même reformulés).
- missing : 5 à 12 compétences/mots-clés importants de l'offre qui manquent au CV.
- suggestions : 3 à 5 conseils concrets et actionnables, en français, pour adapter ce CV à cette offre précise (pas de généralités).

--- CV ---
${resumeSummaryText(resumeData).slice(0, 6000)}

--- OFFRE D'EMPLOI ---
${jobText.slice(0, 6000)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );
    if (!resp.ok) {
      console.error("[aiJobMatch] Gemini HTTP", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    const json = await resp.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const matched = Array.isArray(parsed.matched) ? parsed.matched.map(String).slice(0, 20) : [];
    const missing = Array.isArray(parsed.missing) ? parsed.missing.map(String).slice(0, 20) : [];
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).slice(0, 8) : [];
    return { score, matched, missing, suggestions, source: "ai" };
  } catch (err) {
    console.error("[aiJobMatch] échec, repli sur l'analyse par mots-clés :", err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
