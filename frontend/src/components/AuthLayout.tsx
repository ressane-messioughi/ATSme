import type { ReactNode } from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--violet)] to-[var(--violet-soft)] grid place-items-center text-white text-sm font-bold font-[var(--ff-display)] shadow-[0_4px_14px_var(--violet-glow)]">
            A
          </span>
          <span className="font-[var(--ff-display)] font-bold text-lg tracking-tight">ATSme</span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-7 py-8">
          <h1 className="text-xl font-bold mb-1.5">{title}</h1>
          <p className="text-sm text-[var(--text-dim)] mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
