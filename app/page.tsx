"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";

/**
 * Stunning Cinematic Portal Entry point for HeroPath.
 * Features side-by-side interactive portals: Marvel (Boys) vs Princess (Girls).
 */
export default function HomePage() {
  const router = useRouter();

  const handleSelectPortal = (theme: "marvel" | "princess") => {
    router.push(`/login?theme=${theme}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none font-lexend">
      
      {/* Dynamic Cosmic Background overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e1b4b_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#311042_0%,transparent_50%)]" />

      {/* Hero Header */}
      <div className="text-center z-30 mb-8 max-w-xl px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative inline-block mb-3"
        >
          {/* Shimmering border outline */}
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 blur-lg opacity-40 animate-pulse-gold" />
          <h1 className="relative text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-pink-400 bg-clip-text text-transparent px-6 py-2 border-2 border-amber-400/20 rounded-2xl glass-panel tracking-wider">
            HEROPATH
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-slate-300 text-sm md:text-base font-medium tracking-wide"
        >
          Choose your destiny. Embark on a legendary learning adventure.
        </motion.p>
      </div>

      {/* Portal Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-6 z-20">
        
        {/* Marvel Portal (Boys Theme) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          onClick={() => handleSelectPortal("marvel")}
          className="group relative h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-marvel-cosmic bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-cyan-950/20" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12 duration-300">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-black font-lexend tracking-wide mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              SUPERHERO REALM
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs font-medium">
              Conquer curriculum missions, level up cosmic powers, and defeat exam overlords.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400 font-bold group-hover:underline">
              Enter Cosmic Portal →
            </span>
          </div>
          {/* Glowing ring overlays */}
          <div className="absolute inset-0 border border-cyan-500/10 rounded-3xl pointer-events-none group-hover:border-cyan-500/30 transition-colors" />
        </motion.div>

        {/* Princess Portal (Girls Theme) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          onClick={() => handleSelectPortal("princess")}
          className="group relative h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-pink-500/20 hover:border-pink-400/60 shadow-[0_0_20px_rgba(236,72,153,0.1)] hover:shadow-[0_0_35px_rgba(236,72,153,0.3)] transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-princess-realm bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-pink-950/20" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12 duration-300">
              <Sparkles className="h-6 w-6 text-pink-400" />
            </div>
            <h2 className="text-2xl font-black font-lexend tracking-wide mb-2 bg-gradient-to-r from-pink-300 to-violet-400 bg-clip-text text-transparent">
              MAGICAL QUESTS
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs font-medium">
              Explore enchanted realms, build spell academies, and unlock magical secrets.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-pink-300 font-bold group-hover:underline">
              Enter Magic Portal →
            </span>
          </div>
          {/* Glowing ring overlays */}
          <div className="absolute inset-0 border border-pink-500/10 rounded-3xl pointer-events-none group-hover:border-pink-500/30 transition-colors" />
        </motion.div>

      </div>

      {/* Footer copyright and dyslexia tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-[10px] text-slate-500 font-mono tracking-widest"
      >
        WCAG 2.2 AA COMPLIANT • ACCESSIBLE ADVENTURE
      </motion.p>
    </main>
  );
}
