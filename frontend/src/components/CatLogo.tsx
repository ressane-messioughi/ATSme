// Tête de chat, logo ATSme — mêmes tracés que design_handoff_atsme_3d/logo/atsme-chat.svg,
// en inline SVG (pas <img>) pour que ses couleurs suivent le thème actif via les jetons
// --t-cat*/--t-collar/--t-bell.
export default function CatLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className={className} style={{ flex: "none", display: "block" }}>
      <path d="M5.2 15 L6.6 3.6 L14 9.4 Z" fill="var(--t-cat)" stroke="var(--t-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26.8 15 L25.4 3.6 L18 9.4 Z" fill="var(--t-cat)" stroke="var(--t-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.6 11.6 L8.3 6.6 L11.9 9.6 Z" fill="var(--t-cat-pink)" />
      <path d="M24.4 11.6 L23.7 6.6 L20.1 9.6 Z" fill="var(--t-cat-pink)" />
      <path
        d="M3.8 18.4 A12.2 10.2 0 1 0 28.2 18.4 A12.2 10.2 0 1 0 3.8 18.4 Z"
        fill="var(--t-cat)"
        stroke="var(--t-ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.6 9.2 L14.2 12" fill="none" stroke="var(--t-cat-stripe)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8.6 L16 12.4" fill="none" stroke="var(--t-cat-stripe)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.4 9.2 L17.8 12" fill="none" stroke="var(--t-cat-stripe)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6 22.6 A5.4 3.7 0 1 0 21.4 22.6 A5.4 3.7 0 1 0 10.6 22.6 Z" fill="var(--t-cat-light)" />
      <path d="M9.2 17.4 A2.1 2.6 0 1 0 13.4 17.4 A2.1 2.6 0 1 0 9.2 17.4 Z" fill="var(--t-cat-eye)" />
      <path d="M18.6 17.4 A2.1 2.6 0 1 0 22.8 17.4 A2.1 2.6 0 1 0 18.6 17.4 Z" fill="var(--t-cat-eye)" />
      <path d="M11.3 16.4 A0.8 0.8 0 1 0 12.9 16.4 A0.8 0.8 0 1 0 11.3 16.4 Z" fill="#ffffff" />
      <path d="M20.7 16.4 A0.8 0.8 0 1 0 22.3 16.4 A0.8 0.8 0 1 0 20.7 16.4 Z" fill="#ffffff" />
      <path d="M14.8 20.9 L17.2 20.9 L16 22.2 Z" fill="var(--t-cat-pink)" />
      <path d="M16 22.2 Q15.2 23.6 13.8 23" fill="none" stroke="var(--t-ink)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 22.2 Q16.8 23.6 18.2 23" fill="none" stroke="var(--t-ink)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 26.2 Q16 30.4 23.4 26.2" fill="none" stroke="var(--t-collar)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14.4 29.3 A1.6 1.6 0 1 0 17.6 29.3 A1.6 1.6 0 1 0 14.4 29.3 Z"
        fill="var(--t-bell)"
        stroke="var(--t-ink)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
