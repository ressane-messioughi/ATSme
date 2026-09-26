import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type ModalProps = {
  /** Titre affiché en haut de la fenêtre. */
  title: string;
  /** Appelé quand l'utilisateur ferme la fenêtre (clic sur le fond ou sur ×). */
  onClose: () => void;
  children: ReactNode;
  /** Largeur maximale de la fenêtre. */
  maxWidth?: string;
};

/**
 * Fenêtre modale avec fond flouté et animation d'entrée. À monter conditionnellement
 * (idéalement sous `AnimatePresence` du côté appelant pour l'animation de sortie).
 *
 * @example
 * <Modal title="Exporter mon CV" onClose={() => setOpen(false)}>
 *   <p>Contenu de la fenêtre.</p>
 * </Modal>
 */
export function Modal({ title, onClose, children, maxWidth = "32rem" }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid place-items-center w-7 h-7 rounded-full text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
