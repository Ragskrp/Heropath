"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Delete, Lock, User } from "lucide-react";
import { StudentTheme } from "@/types/auth";

interface LoginProps {
  theme: StudentTheme;
  onSubmit: (username: string, pin: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Student Login Portal with interactive PIN pad.
 */
export default function PinLoginForm({ theme, onSubmit, isLoading }: LoginProps) {
  const isMarvel = theme === "marvel";
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 6) return;
    setPin((prev) => prev + num);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || pin.length < 4) return;
    onSubmit(username, pin);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 w-full">
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
          Apprentice Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <User className="h-4 w-4" />
          </div>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Hero Name"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-slate-200 text-sm font-lexend transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* PIN Code Field */}
      <div>
        <label className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
          Secure PIN (4-6 digits)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPin ? "text" : "password"}
            readOnly
            value={pin}
            placeholder="••••••"
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-center text-lg font-mono tracking-widest text-slate-200 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPin((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
            title={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Graphical Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <motion.button
            key={num}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => handleKeyPress(num)}
            disabled={isLoading}
            className="h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600 font-lexend font-bold text-base transition-colors"
          >
            {num}
          </motion.button>
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleClear}
          disabled={isLoading}
          className="h-12 rounded-xl bg-slate-900/20 border border-slate-800/80 text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-900/40 hover:text-slate-400 font-lexend font-bold"
        >
          Clear
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => handleKeyPress("0")}
          disabled={isLoading}
          className="h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600 font-lexend font-bold text-base transition-colors"
        >
          0
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          disabled={isLoading}
          className="h-12 rounded-xl bg-slate-900/20 border border-slate-800/80 flex items-center justify-center text-slate-500 hover:bg-slate-900/40 hover:text-slate-400"
          title="Delete last digit"
        >
          <Delete className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || username.length < 3 || pin.length < 4}
        className={`w-full py-3.5 rounded-xl font-bold font-lexend text-sm transition-all focus:outline-none ${
          username.length >= 3 && pin.length >= 4 && !isLoading
            ? isMarvel
              ? "bg-gradient-to-r from-red-600 to-yellow-500 hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] text-white hover:scale-[1.02] cursor-pointer"
              : "bg-gradient-to-r from-pink-500 to-violet-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] text-white hover:scale-[1.02] cursor-pointer"
            : "bg-slate-850 border border-slate-800 text-slate-500 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Summoning Profile..." : "Enter Portal"}
      </button>
    </form>
  );
}
