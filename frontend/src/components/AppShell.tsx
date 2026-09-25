import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.tsx";
import BrandOrb from "./BrandOrb.tsx";
import { useAuth } from "../lib/auth.tsx";

export default function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <span className="flex items-center gap-2">
            <BrandOrb size={24} className="shrink-0" />
            <span className="font-[var(--ff-display)] font-bold text-sm">ATSme</span>
          </span>
          <button
            onClick={logout}
            className="text-xs font-[var(--ff-mono)] border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--violet-soft)] transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </header>
        <main className="flex-1 px-6 md:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
