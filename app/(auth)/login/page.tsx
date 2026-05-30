"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Shield } from "lucide-react";
import PinLoginForm from "@/components/PinLoginForm";
import AvatarSelector from "@/components/AvatarSelector";
import Toast, { ToastType } from "@/components/ui/Toast";
import { Gender, StudentTheme } from "@/types/auth";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [theme, setTheme] = useState<StudentTheme>("marvel");

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    setTheme(themeParam === "princess" ? "princess" : "marvel");
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regGender, setRegGender] = useState<Gender>("boy");
  const [regAvatarId, setRegAvatarId] = useState("");
  const [regYear, setRegYear] = useState<number>(7);
  const [regGcseDate, setRegGcseDate] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastVisible, setToastVisible] = useState(false);

  const showFeedback = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleGenderChange = (selectedGender: Gender) => {
    setRegGender(selectedGender);
    setTheme(selectedGender === "boy" ? "marvel" : "princess");
    setRegAvatarId("");
  };

  const handleLoginSubmit = async (username: string, pin: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Login failed", "error");
      } else {
        showFeedback("Realm Entry Authorized!", "success");
        router.refresh();
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch {
      showFeedback("Could not reach secure gate", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || regPin.length < 4 || !regAvatarId) {
      showFeedback("Please complete all registration fields", "error");
      return;
    }
    if (regYear >= 10 && !regGcseDate) {
      showFeedback("GCSE Exam date is required", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: regUsername,
          pin: regPin,
          gender: regGender,
          avatarId: regAvatarId,
          yearGroup: regYear,
          gcseExamDate: regYear >= 10 ? regGcseDate : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback(data.error || "Registration failed", "error");
      } else {
        showFeedback("Legendary Apprentice registered!", "success");
        router.refresh();
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch {
      showFeedback("Could not complete scroll registry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isMarvel = theme === "marvel";

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none font-lexend">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isMarvel
          ? "bg-[radial-gradient(circle_at_20%_20%,rgba(226,54,54,0.1)_0%,transparent_50%)]"
          : "bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1)_0%,transparent_50%)]"
      }`} />

      <div className="w-full max-w-xl rounded-3xl glass-panel-dark border-white/10 p-6 md:p-8 text-white relative z-10 shadow-2xl">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
          aria-label="Back to portal selection"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Portal Chamber
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            {isMarvel ? (
              <Shield className="h-10 w-10 text-cyan-400 animate-float" />
            ) : (
              <Sparkles className="h-10 w-10 text-pink-400 animate-float" />
            )}
          </div>
          <h2 className="text-2xl font-black tracking-wide font-lexend">
            {isMarvel ? "SUPERHERO HQ" : "SPELLCAST ACADEMY"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {isMarvel ? "Lock in coordinates. Upgrade your powers." : "Decipher magical runes. Gain celestial rewards."}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "login"
                ? isMarvel ? "bg-cyan-500 text-white" : "bg-pink-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Apprentice Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "register"
                ? isMarvel ? "bg-cyan-500 text-white" : "bg-pink-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Hero Profile
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <PinLoginForm theme={theme} onSubmit={handleLoginSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label htmlFor="regUsername" className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                    Summoner Username
                  </label>
                  <input
                    id="regUsername"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. AstroKnight_99"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-slate-200 text-sm font-lexend transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="regPin" className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                    Create Security PIN (4-6 digits)
                  </label>
                  <input
                    id="regPin"
                    type="password"
                    maxLength={6}
                    required
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter digits"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-slate-200 text-sm font-lexend tracking-widest transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                    Quest Theme Path
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("boy")}
                      className={`py-3 rounded-xl font-bold border transition-all text-xs ${
                        regGender === "boy"
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                          : "bg-slate-900/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      Superhero Marvel (Boys)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("girl")}
                      className={`py-3 rounded-xl font-bold border transition-all text-xs ${
                        regGender === "girl"
                          ? "bg-pink-500/20 border-pink-400 text-pink-200"
                          : "bg-slate-900/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      Magical Academy (Girls)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="regYear" className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                      Year Group
                    </label>
                    <select
                      id="regYear"
                      value={regYear}
                      onChange={(e) => setRegYear(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-slate-200 text-sm font-lexend"
                    >
                      {[7, 8, 9, 10, 11].map((yr) => (
                        <option key={yr} value={yr} className="bg-slate-950">
                          Year {yr} ({yr >= 10 ? "KS4" : "KS3"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {regYear >= 10 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
                      <label htmlFor="regGcseDate" className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                        GCSE Exam Date
                      </label>
                      <input
                        id="regGcseDate"
                        type="date"
                        required
                        value={regGcseDate}
                        onChange={(e) => setRegGcseDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-amber-400 focus:outline-none text-slate-200 text-sm font-lexend"
                      />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mb-2">
                    Choose Your Hero Avatar
                  </label>
                  <AvatarSelector
                    selectedTheme={theme}
                    selectedAvatarId={regAvatarId}
                    onSelect={setRegAvatarId}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold font-lexend text-sm transition-all focus:outline-none mt-4 ${
                    isMarvel
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
                >
                  {isLoading ? "Forging Profile..." : "Initialize Learning Journey"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toast message={toastMessage} type={toastType} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
