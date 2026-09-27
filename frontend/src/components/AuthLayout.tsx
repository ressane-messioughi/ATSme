import type { ReactNode } from "react";
import CatLogo from "./CatLogo.tsx";

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
    <div className="min-h-screen grid place-items-center px-5 py-10" style={{ background: "var(--t-bg)", color: "var(--t-ink)" }}>
      <div style={{ width: "min(420px,100%)" }}>
        <div className="flex items-center gap-2.5 mb-6">
          <CatLogo size={52} />
          <span className="sr-only">ATSme</span>
        </div>
        <div
          className="flex flex-col gap-4 p-[30px] rounded-[var(--t-r-lg)]"
          style={{ background: "var(--t-surface)", border: "1px solid var(--t-line-soft)" }}
        >
          <div>
            <h1 className="font-black text-[30px] m-0" style={{ fontFamily: "var(--t-display)" }}>
              {title}
            </h1>
            <p className="text-sm mt-1.5 mb-0" style={{ color: "var(--t-ink2)" }}>
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
