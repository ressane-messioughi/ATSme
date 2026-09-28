import { useEffect } from "react";

export default function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="md:hidden fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "rgba(20,14,8,.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="md:hidden fixed top-0 left-0 z-50 h-[100dvh] w-[260px] max-w-[82vw] transition-transform duration-200 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          background: "var(--t-surface)",
          borderRight: "1px solid var(--t-line-soft)",
        }}
      >
        {children}
      </div>
    </>
  );
}
