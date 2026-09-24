import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth.tsx";
import AppShell from "./components/AppShell.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CvList from "./pages/CvList.tsx";
import CvNew from "./pages/CvNew.tsx";
import CvEditor from "./pages/CvEditor.tsx";
import Templates from "./pages/Templates.tsx";
import AtsAnalysis from "./pages/AtsAnalysis.tsx";
import JobOffers from "./pages/JobOffers.tsx";
import History from "./pages/History.tsx";
import Settings from "./pages/Settings.tsx";
import AdminShell from "./components/AdminShell.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminResumes from "./pages/admin/AdminResumes.tsx";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cv" element={<CvList />} />
        <Route path="cv/nouveau" element={<CvNew />} />
        <Route path="cv/:id" element={<CvEditor />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analyse" element={<AtsAnalysis />} />
        <Route path="offres" element={<JobOffers />} />
        <Route path="historique" element={<History />} />
        <Route path="parametres" element={<Settings />} />
      </Route>
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
        <Route path="cv" element={<AdminResumes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
