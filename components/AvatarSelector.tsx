"use client";

import React from "react";
import { motion } from "framer-motion";
import { StudentTheme } from "@/types/auth";

export interface AvatarOption {
  id: string;
  name: string;
  theme: StudentTheme;
  color: string;
  svg: React.ReactNode;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  // Marvel / Superhero Avatars
  {
    id: "iron-hero",
    name: "Iron Sentinel",
    theme: "marvel",
    color: "from-red-600 to-yellow-500",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#e23636" strokeWidth="3" />
        <rect x="35" y="30" width="30" height="40" rx="10" fill="#e23636" />
        <polygon points="50,20 62,35 38,35" fill="#f39c12" />
        <rect x="40" y="42" width="20" height="6" rx="2" fill="#55e6c1" />
        <circle cx="50" cy="60" r="8" fill="#55e6c1" />
      </svg>
    ),
  },
  {
    id: "cyber-sentinel",
    name: "Cyber Knight",
    theme: "marvel",
    color: "from-cyan-500 to-blue-600",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
        <path d="M30 40 L70 40 L65 75 L35 75 Z" fill="#334155" />
        <rect x="25" y="45" width="50" height="8" rx="4" fill="#06b6d4" />
        <circle cx="50" cy="62" r="5" fill="#38bdf8" />
      </svg>
    ),
  },
  {
    id: "thunder-striker",
    name: "Storm Bringer",
    theme: "marvel",
    color: "from-amber-400 to-blue-700",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#f1c40f" strokeWidth="3" />
        <path d="M50 20 L35 45 L50 45 L45 75 L65 40 L50 40 Z" fill="#f1c40f" />
        <circle cx="50" cy="50" r="15" stroke="#3498db" strokeWidth="2" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "crimson-shadow",
    name: "Shadow Ninja",
    theme: "marvel",
    color: "from-purple-800 to-red-600",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#111827" stroke="#9333ea" strokeWidth="3" />
        <path d="M25 40 C 25 25, 75 25, 75 40 C 75 55, 60 75, 50 75 C 40 75, 25 55, 25 40 Z" fill="#374151" />
        <rect x="35" y="45" width="30" height="6" rx="3" fill="#111827" />
        <circle cx="42" cy="48" r="2.5" fill="#ef4444" />
        <circle cx="58" cy="48" r="2.5" fill="#ef4444" />
      </svg>
    ),
  },

  // Princess / Magical Quest Avatars
  {
    id: "twilight-enchantress",
    name: "Twilight Mage",
    theme: "princess",
    color: "from-purple-500 to-pink-500",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#2d1b4e" stroke="#ec4899" strokeWidth="3" />
        <polygon points="50,15 75,65 25,65" fill="#ec4899" opacity="0.8" />
        <circle cx="50" cy="48" r="10" fill="#fbcfe8" />
        <polygon points="50,25 53,32 60,32 55,37 57,44 50,40 43,44 45,37 40,32 47,32" fill="#fdf2f8" />
      </svg>
    ),
  },
  {
    id: "stardust-sorceress",
    name: "Astral Princess",
    theme: "princess",
    color: "from-yellow-300 to-pink-600",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#3b0764" stroke="#fbcfe8" strokeWidth="3" />
        <path d="M 30 70 C 30 50, 70 50, 70 70 Z" fill="#db2777" />
        <polygon points="50,22 58,40 35,32 65,32 42,40" fill="#facc15" />
        <circle cx="50" cy="55" r="9" fill="#fce7f3" />
      </svg>
    ),
  },
  {
    id: "crystal-monarch",
    name: "Crystal Queen",
    theme: "princess",
    color: "from-teal-400 to-indigo-500",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#042f2e" stroke="#2dd4bf" strokeWidth="3" />
        <polygon points="50,25 70,55 50,85 30,55" fill="#2dd4bf" opacity="0.8" />
        <polygon points="50,35 60,55 50,75 40,55" fill="#99f6e4" />
        <circle cx="50" cy="55" r="4" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: "dawn-whisperer",
    name: "Fae Whisperer",
    theme: "princess",
    color: "from-emerald-400 to-pink-400",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#14532d" stroke="#f472b6" strokeWidth="3" />
        <circle cx="35" cy="50" r="12" fill="#f472b6" opacity="0.6" />
        <circle cx="65" cy="50" r="12" fill="#f472b6" opacity="0.6" />
        <circle cx="50" cy="50" r="16" fill="#fce7f3" />
        <path d="M42 48 Q50 58 58 48" stroke="#db2777" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
];

interface SelectorProps {
  selectedTheme: StudentTheme;
  selectedAvatarId: string;
  onSelect: (id: string) => void;
}

export default function AvatarSelector({ selectedTheme, selectedAvatarId, onSelect }: SelectorProps) {
  const filtered = AVATAR_OPTIONS.filter((avatar) => avatar.theme === selectedTheme);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {filtered.map((avatar) => {
        const isSelected = selectedAvatarId === avatar.id;
        return (
          <motion.button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
              isSelected
                ? "bg-slate-800/80 border-amber-400 shadow-[0_0_15px_rgba(243,156,18,0.3)]"
                : "bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/40 hover:border-slate-600"
            }`}
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${avatar.color} p-1 mb-2.5`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                {avatar.svg}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-200 text-center font-lexend">{avatar.name}</span>
            {isSelected && (
              <motion.div
                layoutId="avatar-glow"
                className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function getAvatarSvg(id: string): React.ReactNode {
  return AVATAR_OPTIONS.find((a) => a.id === id)?.svg || AVATAR_OPTIONS[0]?.svg;
}
export function getAvatarName(id: string): string {
  return AVATAR_OPTIONS.find((a) => a.id === id)?.name || "Hero Apprentice";
}
export function getAvatarColor(id: string): string {
  return AVATAR_OPTIONS.find((a) => a.id === id)?.color || "from-slate-600 to-slate-700";
}
