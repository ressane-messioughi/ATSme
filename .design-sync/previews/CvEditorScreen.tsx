import { CvEditorScreen } from "@atsme/ui-kit";

const initialData = {
  personal: {
    fullName: "Ressane Messioughi",
    title: "Développeur Full-Stack",
    email: "ressane@example.com",
    phone: "06 12 34 56 78",
    location: "Paris, France",
    links: [{ label: "LinkedIn", url: "https://linkedin.com/in/ressane" }],
  },
  summary: "Développeur Full-Stack expérimenté, spécialisé en React et Node.js, avec un fort accent sur la performance et la fiabilité des systèmes déployés en production.",
  experiences: [
    {
      company: "ATSme",
      role: "Développeur Full-Stack",
      location: "Paris",
      startDate: "2024",
      endDate: "",
      description: "Conception et développement de la plateforme de création de CV optimisés ATS.",
      achievements: ["Réduit le temps de génération d'un CV de 40%", "Mis en place l'export PDF/DOCX/TXT", "Conçu le moteur de score ATS déterministe"],
    },
    {
      company: "TechCorp",
      role: "Développeur Frontend",
      location: "Lyon",
      startDate: "2021",
      endDate: "2024",
      description: "Développement d'interfaces React pour une plateforme SaaS B2B.",
      achievements: ["Migré l'application vers TypeScript", "Amélioré le score Lighthouse de 62 à 94"],
    },
  ],
  education: [{ school: "École 42", degree: "Formation développeur", date: "2020" }],
  skills: [{ name: "React" }, { name: "TypeScript" }, { name: "Node.js" }, { name: "PostgreSQL" }, { name: "Tailwind CSS" }],
  languages: [{ name: "Français", level: "natif" }, { name: "Anglais", level: "courant" }],
  certifications: [{ name: "AWS Certified Developer", issuer: "Amazon", date: "2023" }],
  projects: [{ name: "ATSme", description: "SaaS de création de CV optimisés ATS." }],
  achievements: [],
  interests: ["Course à pied", "Photographie"],
};

export function Default() {
  return <CvEditorScreen initialData={initialData} initialTitle="Développeur Full-Stack" initialScore={83} />;
}
