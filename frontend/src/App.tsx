import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth.tsx";
import AppShell from "./components/AppShell.tsx";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CookieBanner from "./components/CookieBanner.tsx";

// Chargées à la demande : rien de tout ça n'est nécessaire pour le premier rendu (accueil
// public, connexion) ni juste après connexion (tableau de bord) — inutile de les faire
// payer au chargement initial. React.lazy + Suspense découpe chacune en son propre morceau
// de JS, récupéré seulement quand la route est visitée.
const CvList = lazy(() => import("./pages/CvList.tsx"));
const CvNew = lazy(() => import("./pages/CvNew.tsx"));
const CvEditor = lazy(() => import("./pages/CvEditor.tsx"));
const Templates = lazy(() => import("./pages/Templates.tsx"));
const AtsAnalysis = lazy(() => import("./pages/AtsAnalysis.tsx"));
const JobOffers = lazy(() => import("./pages/JobOffers.tsx"));
const History = lazy(() => import("./pages/History.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const Abonnement = lazy(() => import("./pages/Abonnement.tsx"));
const AdminShell = lazy(() => import("./components/AdminShell.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminResumes = lazy(() => import("./pages/admin/AdminResumes.tsx"));
const Confidentialite = lazy(() => import("./pages/Confidentialite.tsx"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AdminPromoCodes = lazy(() => import("./pages/admin/AdminPromoCodes.tsx"));

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
    <Suspense fallback={null}>
    <Routes>
      {/* Accueil 3D — public, toujours à "/" (design_handoff_atsme_3d/PROMPT_CLAUDE_CODE.md) */}
      <Route path="/" element={<Landing />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/verifier-email" element={<VerifyEmail />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
      <Route path="/confidentialite" element={<Confidentialite />} />
      <Route path="/mentions-legales" element={<MentionsLegales />} />

      {/* Route sans segment d'URL propre : enveloppe Protected+AppShell autour de chemins
          absolus qui gardent leur URL exacte (aucun préfixe "/dashboard" sur /cv etc.). */}
      <Route element={<Protected><AppShell /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv" element={<CvList />} />
        <Route path="/cv/nouveau" element={<CvNew />} />
        <Route path="/cv/:id" element={<CvEditor />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/analyse" element={<AtsAnalysis />} />
        <Route path="/offres" element={<JobOffers />} />
        <Route path="/historique" element={<History />} />
        <Route path="/abonnement" element={<Abonnement />} />
        <Route path="/parametres" element={<Settings />} />
      </Route>

      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
        <Route path="cv" element={<AdminResumes />} />
        <Route path="codes-promo" element={<AdminPromoCodes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
    <CookieBanner />
    </>
  );
}
