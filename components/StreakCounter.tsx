"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { StudentTheme } from "@/types/auth";

interface StreakProps {
  streak: number;
  theme: StudentTheme;
}

/**
 * Animated streak counter.
 * Flame/fire for Marvel theme, magic sparkles for Princess theme.
 */
export default function StreakCounter({ streak, theme }: StreakProps) {
  const isMarvel = theme === "marvel";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-lg font-lexend font-bold text-sm select-none ${
        isMarvel
          ? "bg-gradient-to-r from-red-600/20 to-orange-500/20 border-orange-500/40 text-orange-400"
          : "bg-gradient-to-r from-pink-500/20 to-violet-500/20 border-pink-400/40 text-pink-300"
      }`}
    >
      {isMarvel ? (
        <div className="relative">
          {/* Flame animation back-glow */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-orange-500/30 blur-sm rounded-full"
          />
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="relative z-10"
          >
            <Flame className="h-5 w-5 fill-orange-500 text-orange-400" />
          </motion.div>
        </div>
      ) : (
        <div className="relative">
          {/* Magic stardust pulse */}
          <motion.div
            animate={{ scale: [0.9, 1.3, 0.9], rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="absolute inset-0 text-pink-400 blur-sm"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="relative z-10"
          >
            <Sparkles className="h-5 w-5 text-pink-300 fill-pink-500/30" />
          </motion.div>
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <motion.span
          key={streak}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base font-extrabold"
        >
          {streak}
        </motion.span>
        <span className="text-[11px] uppercase tracking-wider opacity-90">
          {isMarvel ? "Power Streak" : "Magic Streak"}
        </span>
      </div>
    </motion.div>
  );
}
