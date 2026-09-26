import { CvPreviewCard } from "@atsme/ui-kit";

const data = {
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
      achievements: ["Réduit le temps de génération d'un CV de 40%", "Mis en place l'export PDF/DOCX/TXT"],
    },
  ],
  education: [{ school: "École 42", degree: "Formation développeur", date: "2020" }],
  skills: [{ name: "React" }, { name: "TypeScript" }, { name: "Node.js" }],
  languages: [{ name: "Français", level: "natif" }, { name: "Anglais", level: "courant" }],
  certifications: [{ name: "AWS Certified Developer", issuer: "Amazon", date: "2023" }],
  projects: [{ name: "ATSme", description: "SaaS de création de CV optimisés ATS." }],
  achievements: [],
  interests: ["Course à pied", "Photographie"],
};

export function Default() {
  return (
    <div style={{ maxWidth: 480 }}>
      <CvPreviewCard data={data} />
    </div>
  );
}
