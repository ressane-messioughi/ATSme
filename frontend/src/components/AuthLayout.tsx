import type { ReactNode } from "react";
import { motion } from "framer-motion";
import BrandOrb from "./BrandOrb.tsx";

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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <BrandOrb size={34} className="shrink-0 drop-shadow-[0_4px_14px_var(--violet-glow)]" />
          <span className="font-[var(--ff-display)] font-bold text-lg tracking-tight">ATSme</span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-7 py-8 shadow-xl">
          <h1 className="text-xl font-bold mb-1.5">{title}</h1>
          <p className="text-sm text-[var(--text-dim)] mb-7">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
