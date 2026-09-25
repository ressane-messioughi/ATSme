// Styles partagés par les 3 exporteurs (PDF/DOCX) pour que le champ `template` d'un CV
// produise réellement un rendu différent — sans jamais sortir du mono-colonne texte-only
// imposé par la compatibilité ATS (cf. scoring.js scoreAtsCompat). La photo de profil
// optionnelle est la seule exception : un élément décoratif hors du flux de texte, qui ne
// remet donc pas en cause cette contrainte.
export const TEMPLATE_STYLES = {
  violet: {
    accent: "5b21b6",
    nameFont: "Helvetica-Bold",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    divider: true,
    upper: true,
  },
  obsidian: {
    accent: "1c1a24",
    nameFont: "Helvetica-Bold",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    divider: true,
    upper: true,
  },
  nightfall: {
    accent: "312e81",
    nameFont: "Helvetica-Bold",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    divider: false,
    upper: true,
  },
  "purple-minimal": {
    accent: "9d7bfb",
    nameFont: "Helvetica",
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
    divider: false,
    upper: false,
  },
  "dark-elegant": {
    accent: "5b21b6",
    nameFont: "Times-Bold",
    headingFont: "Times-Bold",
    bodyFont: "Times-Roman",
    divider: true,
    upper: false,
  },
};

export function styleFor(template) {
  return TEMPLATE_STYLES[template] || TEMPLATE_STYLES.violet;
}
