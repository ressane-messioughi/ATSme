# ATSme

SaaS de création et d'optimisation de CV compatibles ATS (Applicant Tracking System) : dépôt d'un CV existant, analyse, score de correspondance avec une offre, export dans plusieurs formats.

## Structure

- `frontend/` — React + TypeScript + Vite + Tailwind CSS
- `backend/` — API Node.js/Express (auth JWT, parsing de CV, scoring, export PDF/DOCX/TXT)

## Démarrage

### Backend

```bash
cd backend
cp .env.example .env   # renseigner les variables (base de données, JWT_SECRET, compte admin)
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Les fichiers déposés par les utilisateurs (`backend/storage/`) ne sont jamais versionnés.
- `JWT_SECRET`, les identifiants de base de données et le compte admin sont fournis via `.env`, jamais en dur dans le code.
