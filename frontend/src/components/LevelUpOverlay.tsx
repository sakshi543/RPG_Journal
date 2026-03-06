"use client";

import { AnimatePresence, motion } from "framer-motion";

export function LevelUpOverlay({
  show,
  level,
  onClose,
}: {
  show: boolean;
  level: number | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/90 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-gold/50 bg-gradient-to-b from-card to-deep p-8 text-center shadow-gold-strong"
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl mb-4">🎉</div>
              <div className="font-display text-sm uppercase tracking-widest text-gold">
                Level Up!
              </div>
              <div className="mt-2 font-display text-5xl font-bold text-gold">
                Level {level ?? "—"}
              </div>
              <div className="mt-4 text-muted">
                Your side quest gave you real progress. Keep going!
              </div>
              <button
                onClick={onClose}
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-gold-dim to-gold px-6 py-3 font-semibold text-ink shadow-gold transition hover:shadow-gold-strong"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
