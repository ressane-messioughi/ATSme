// Moteur de score ATS — 100% déterministe et reproductible (aucun appel IA),
// conformément à la contrainte du brief : "ne jamais afficher un score arbitraire".

const ACTION_VERBS = [
  "développé", "développe", "conçu", "conçois", "piloté", "pilote", "géré", "gère",
  "optimisé", "optimise", "automatisé", "automatise", "dirigé", "dirige", "lancé", "lance",
  "amélioré", "améliore", "créé", "crée", "coordonné", "coordonne", "livré", "livre",
  "réduit", "augmenté", "augmente", "implémenté", "implémente", "déployé", "déploie",
  "led", "built", "designed", "managed", "optimized", "automated", "launched", "improved",
  "created", "coordinated", "delivered", "reduced", "increased", "implemented", "deployed",
];

const HAS_NUMBER = /\d/;

function ratio(count, total) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, count / total));
}

function scoreKeywords(data) {
  const skillsScore = ratio(data.skills.length, 10) * 15;

  const experienceTexts = data.experiences.flatMap((e) => [
    e.description || "",
    ...(Array.isArray(e.achievements) ? e.achievements : []),
  ]);
  const quantified = experienceTexts.filter((t) => HAS_NUMBER.test(t));
  const quantifiedScore = ratio(quantified.length, Math.max(experienceTexts.length, 1)) * 10;

  const withActionVerb = experienceTexts.filter((t) =>
    ACTION_VERBS.some((v) => t.toLowerCase().includes(v))
  );
  const actionVerbScore = ratio(withActionVerb.length, Math.max(experienceTexts.length, 1)) * 5;

  return Math.round(skillsScore + quantifiedScore + actionVerbScore);
}

function scoreStructure(data) {
  const contactScore = (data.personal.fullName && data.personal.email && data.personal.phone) ? 6 : 0;

  const expTotal = data.experiences.length;
  const expComplete = data.experiences.filter((e) => e.company && e.role && e.startDate).length;
  const structureExpScore = ratio(expComplete, Math.max(expTotal, 1)) * (expTotal ? 8 : 0);

  const withBullets = data.experiences.filter((e) => Array.isArray(e.achievements) && e.achievements.length > 0);
  const bulletsScore = ratio(withBullets.length, Math.max(expTotal, 1)) * (expTotal ? 6 : 0);

  return Math.round(contactScore + structureExpScore + bulletsScore);
}

function scoreReadability(data) {
  const expTotal = data.experiences.length;
  const sane = data.experiences.filter((e) => {
    const len = (e.description || "").length;
    return len === 0 || (len >= 30 && len <= 500);
  });
  const lengthScore = ratio(sane.length, Math.max(expTotal, 1)) * (expTotal ? 10 : 0);

  const summaryLen = data.summary.length;
  const summaryScore = summaryLen >= 50 && summaryLen <= 500 ? 5 : summaryLen > 0 ? 2 : 0;

  const allAchievements = data.experiences.flatMap((e) => (Array.isArray(e.achievements) ? e.achievements : []));
  const shortEnough = allAchievements.filter((a) => a.length <= 200);
  const bulletLenScore = ratio(shortEnough.length, Math.max(allAchievements.length, 1)) * (allAchievements.length ? 5 : 5);

  return Math.round(lengthScore + summaryScore + bulletLenScore);
}

function scoreSections(data) {
  const checks = [
    Boolean(data.personal.fullName && data.personal.email),
    data.summary.length > 0,
    data.experiences.length > 0,
    data.education.length > 0,
    data.skills.length >= 3,
    data.languages.length > 0 || data.certifications.length > 0 || data.projects.length > 0,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 20);
}

function scoreAtsCompat(data) {
  let pts = 4; // rendu texte, mono-colonne, sans image ni tableau — garanti par le moteur de templates
  const wordCount = [
    data.summary,
    ...data.experiences.map((e) => e.description || ""),
    ...data.experiences.flatMap((e) => e.achievements || []),
  ].join(" ").split(/\s+/).filter(Boolean).length;
  pts += wordCount >= 80 && wordCount <= 1500 ? 3 : wordCount > 0 ? 1 : 0;
  pts += 3; // liens et contact toujours en texte brut dans le modèle de données
  return Math.round(pts);
}

export function scoreResume(data) {
  const breakdown = {
    keywords: scoreKeywords(data),
    structure: scoreStructure(data),
    readability: scoreReadability(data),
    sections: scoreSections(data),
    atsCompat: scoreAtsCompat(data),
  };
  const total = Math.min(
    100,
    breakdown.keywords + breakdown.structure + breakdown.readability + breakdown.sections + breakdown.atsCompat
  );

  const recommendations = [];

  if (breakdown.keywords < 22) {
    recommendations.push({
      issue: "Vos expériences contiennent peu de résultats quantifiables ou de compétences listées.",
      why: "Les ATS et les recruteurs valorisent des résultats chiffrés (CA, %, nombre d'utilisateurs, délais) plutôt que des descriptions génériques.",
      fix: "Ajoutez des chiffres à vos réalisations et complétez votre liste de compétences (visez au moins 8 à 10 compétences pertinentes).",
    });
  }
  if (breakdown.structure < 14) {
    recommendations.push({
      issue: "Certaines expériences manquent d'entreprise, de poste ou de dates, ou n'ont pas de réalisations en liste à puces.",
      why: "Un ATS extrait les informations champ par champ : une expérience incomplète ou en paragraphe dense est mal analysée.",
      fix: "Renseignez systématiquement entreprise, poste, dates, et décomposez chaque expérience en 2-4 réalisations courtes.",
    });
  }
  if (breakdown.readability < 14) {
    recommendations.push({
      issue: "Le résumé ou certaines descriptions sont absents, trop courts ou trop longs.",
      why: "Un texte trop dense ou trop vague réduit la lisibilité, pour un humain comme pour un ATS.",
      fix: "Visez un résumé de 50 à 500 caractères, et des descriptions d'expérience concises (30 à 500 caractères).",
    });
  }
  if (breakdown.sections < 14) {
    recommendations.push({
      issue: "Une ou plusieurs sections clés de votre CV sont vides (formation, compétences, langues...).",
      why: "Les sections manquantes créent des trous que l'ATS interprète comme un profil incomplet.",
      fix: "Complétez au minimum vos informations de contact, un résumé, une expérience, une formation et 3 compétences.",
    });
  }
  if (breakdown.atsCompat < 8) {
    recommendations.push({
      issue: "Le contenu de votre CV est trop court ou trop long pour une lecture ATS optimale.",
      why: "Un CV trop dense peut être tronqué par certains ATS ; un CV trop court manque de matière pour matcher une offre.",
      fix: "Visez environ 300 à 800 mots de contenu utile réparti sur vos sections.",
    });
  }

  return { total, breakdown, recommendations };
}
