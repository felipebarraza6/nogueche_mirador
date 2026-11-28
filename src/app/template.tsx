"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Subtle architectural glass veil sweep on route change */}
      <motion.div
        initial={{ scaleY: 1, opacity: 0.94 }}
        animate={{ scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.56, ease: EDITORIAL_EASE }}
        className="fixed inset-0 z-[70] origin-top bg-gradient-to-b from-sand via-mist-soft/95 to-sand/85 backdrop-blur-xl pointer-events-none flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0.85, scale: 0.96 }}
          animate={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.34, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-2"
        >
          <span className="h-[1px] w-16 bg-gradient-to-r from-transparent via-sunset to-transparent" />
          <span className="font-serif text-xs uppercase tracking-[0.38em] text-ocean/70">
            Mirador de Nogueche
          </span>
          <span className="h-[1px] w-16 bg-gradient-to-r from-transparent via-sunset to-transparent" />
        </motion.div>
      </motion.div>

      {/* Luminous gold-sunset hairline progress sweep */}
      <motion.div
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.62, ease: EDITORIAL_EASE }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sunset via-cream to-forest origin-left z-[71] pointer-events-none"
      />

      {/* Opacity-only wrapper so position:fixed children (TopNav, Modals, Floating Bars) ALWAYS anchor to viewport */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.05, ease: EDITORIAL_EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}
