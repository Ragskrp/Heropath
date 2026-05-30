"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, collection, query, orderBy, limit, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAvatarSvg, getAvatarName } from "@/components/AvatarSelector";
import StreakCounter from "@/components/StreakCounter";
import JourneyMap from "@/components/JourneyMap";
import ExamSimulator from "@/components/ExamSimulator";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import Toast, { ToastType } from "@/components/ui/Toast";
import { StudentProfile } from "@/types/auth";
import { StudentProgress, QuestProgress, TopicMastery } from "@/types/progress";
import { Subject, Quest } from "@/types/curriculum";
import { LogOut, BookOpen, Trophy, ShieldAlert, Shield, Sparkles, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";


export default function DashboardPage() {
  const router = useRouter();

  // Core state
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; level: number; xp: number }>>([]);
  
  // Interactive / UI states
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [isDyslexicFriendly, setIsDyslexicFriendly] = useState(false);
  const [countdownText, setCountdownText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastVisible, setToastVisible] = useState(false);

  const showFeedback = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Load Session and Fetch Student Data
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/me");
        if (!sessionRes.ok) {
          router.push("/login");
          return;
        }

        const { session } = await sessionRes.json();
        const uid = session.uid;

        // Fetch Student Profile
        const profileDoc = await getDoc(doc(db, "students", uid));
        if (!profileDoc.exists()) {
          router.push("/login");
          return;
        }
        const profileData = profileDoc.data() as StudentProfile;

        // Fetch Progress
        const progressDoc = await getDoc(doc(db, "progress", uid));
        const progressData = progressDoc.exists()
          ? (progressDoc.data() as StudentProgress)
          : { uid, completedQuests: {}, topicMastery: {}, badges: [] };

        // Fetch Curriculum Curriculum
        const curSnapshot = await getDocs(collection(db, "curriculum"));
        const curList = curSnapshot.docs.map((doc) => doc.data() as Subject);

        // Filter subject by Year Group (KS3 vs KS4)
        const isKs4 = profileData.yearGroup >= 10;
        const filteredSubjects = curList.filter((sub) =>
          isKs4 ? sub.level === "KS4" : sub.level === "KS3"
        );

        // Fetch Leaderboard
        const lbQuery = query(collection(db, "students"), orderBy("xp", "desc"), limit(5));
        const lbSnapshot = await getDocs(lbQuery);
        const lbList = lbSnapshot.docs.map((d) => {
          const data = d.data();
          return {
            username: data.username as string,
            level: data.level as number,
            xp: data.xp as number,
          };
        });

        if (active) {
          setProfile(profileData);
          setProgress(progressData);
          setSubjects(filteredSubjects);
          setActiveSubject(filteredSubjects[0] || null);
          setLeaderboard(lbList);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (active) {
          showFeedback("Failed to sync records with cloud scroll.", "error");
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [router]);

  // Countdown timer calculation
  useEffect(() => {
    if (!profile?.gcseExamDate) return;

    const interval = setInterval(() => {
      const examTime = new Date(profile.gcseExamDate!).getTime();
      const now = new Date().getTime();
      const diff = examTime - now;

      if (diff <= 0) {
        setCountdownText("GCSE Exam time has arrived!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownText(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      showFeedback("Failed to secure exit gates.", "error");
    }
  };

  // Complete Quest and Save progress transactional changes
  const handleCompleteQuest = async (score: number, xpEarned: number) => {
    if (!profile || !progress || !activeQuest) return;

    const questId = activeQuest.id;
    const studentId = profile.uid;

    try {
      setIsLoading(true);

      await runTransaction(db, async (transaction) => {
        const studentRef = doc(db, "students", studentId);
        const progressRef = doc(db, "progress", studentId);

        const currentStudentSnap = await transaction.get(studentRef);
        const currentProgressSnap = await transaction.get(progressRef);

        if (!currentStudentSnap.exists() || !currentProgressSnap.exists()) {
          throw new Error("Student documents do not exist!");
        }

        const studentData = currentStudentSnap.data() as StudentProfile;
        const progressData = currentProgressSnap.data() as StudentProgress;

        // Update Quest Progress
        const existingQuestProgress = progressData.completedQuests[questId];
        const newAttempts = (existingQuestProgress?.attempts || 0) + 1;
        const isFirstCompletion = !existingQuestProgress;

        const newQuestProgress: QuestProgress = {
          questId,
          completedAt: new Date().toISOString(),
          highscore: Math.max(existingQuestProgress?.highscore || 0, score),
          xpEarned: (existingQuestProgress?.xpEarned || 0) + (isFirstCompletion ? xpEarned : Math.round(xpEarned * 0.2)),
          attempts: newAttempts,
        };

        // Calculate mastery pip adjustments
        // Find which topic this quest belongs to
        let topicId = "";
        for (const sub of subjects) {
          for (const topic of sub.topics) {
            if (topic.quests.some((q) => q.id === questId)) {
              topicId = topic.id;
              break;
            }
          }
          if (topicId) break;
        }

        const currentTopicMastery = progressData.topicMastery[topicId] || {
          topicId,
          masteryPips: 0,
          updatedAt: new Date().toISOString(),
        };

        // Increase mastery pips depending on score performance
        let bonusPips = 0;
        if (score >= 90) bonusPips = 2;
        else if (score >= 50) bonusPips = 1;

        const newTopicMastery: TopicMastery = {
          topicId,
          masteryPips: Math.min(5, currentTopicMastery.masteryPips + (isFirstCompletion ? bonusPips : 0)),
          updatedAt: new Date().toISOString(),
        };

        // Update student metrics
        const totalXpGain = isFirstCompletion ? xpEarned : Math.round(xpEarned * 0.2);
        const updatedXp = studentData.xp + totalXpGain;
        const newLevel = Math.floor(updatedXp / 1000) + 1;
        const levelUpOccurred = newLevel > studentData.level;

        // Daily login/Streak update check
        const today = new Date().toDateString();
        const lastLoginDay = new Date(studentData.lastLoginAt).toDateString();
        let newStreak = studentData.streak;

        if (lastLoginDay !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastLoginDay === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1; // reset streak if missed
          }
        }

        // Commit transaction writes
        transaction.update(studentRef, {
          xp: updatedXp,
          level: newLevel,
          streak: newStreak,
          lastLoginAt: new Date().toISOString(),
        });

        const updatedCompletedQuests = {
          ...progressData.completedQuests,
          [questId]: newQuestProgress,
        };
        const updatedTopicMastery = {
          ...progressData.topicMastery,
          [topicId]: newTopicMastery,
        };

        transaction.update(progressRef, {
          completedQuests: updatedCompletedQuests,
          topicMastery: updatedTopicMastery,
        });

        // Set local state variables safely
        setProfile((prev) => {
          if (!prev) return null;
          return { ...prev, xp: updatedXp, level: newLevel, streak: newStreak };
        });
        setProgress((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            completedQuests: updatedCompletedQuests,
            topicMastery: updatedTopicMastery,
          };
        });

        if (levelUpOccurred) {
          showFeedback(`LEVEL UP! You ascended to Level ${newLevel}!`, "success");
        } else {
          showFeedback(`Quest complete! Gained +${totalXpGain} XP!`, "success");
        }
      });
    } catch (err) {
      console.error("Transaction completion error:", err);
      showFeedback("Failed to report victory scroll to servers.", "error");
    } finally {
      setIsLoading(false);
      setActiveQuest(null);
    }
  };

  if (isLoading && !profile) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 md:p-12 flex flex-col justify-center items-center gap-6">
        <SkeletonLoader className="w-full max-w-4xl h-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <SkeletonLoader className="col-span-2 h-[450px]" />
          <SkeletonLoader className="h-[450px]" />
        </div>
      </main>
    );
  }

  if (!profile || !progress) return null;

  const isMarvel = profile.theme === "marvel";
  const xpInLevel = profile.xp % 1000;
  const levelProgressPct = (xpInLevel / 1000) * 100;

  return (
    <main
      className={`min-h-screen bg-slate-950 text-white font-lexend p-4 md:p-8 relative ${
        isDyslexicFriendly ? "dyslexic-font" : ""
      }`}
    >
      {/* Background visual adapts */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isMarvel ? "bg-marvel-cosmic" : "bg-princess-realm"
        }`}
      />
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Navigation & Controls */}
        <header className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-4 glass-panel">
          <div className="flex items-center gap-4">
            {/* Avatar representation */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${isMarvel ? "from-red-600 to-yellow-500" : "from-pink-500 to-violet-500"} p-0.5`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                {getAvatarSvg(profile.avatarId)}
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold font-lexend tracking-wide text-slate-100 uppercase">
                {profile.username}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {getAvatarName(profile.avatarId)} • Year {profile.yearGroup}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            {/* Dyslexia Toggle */}
            <button
              onClick={() => setIsDyslexicFriendly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-lexend transition-all ${
                isDyslexicFriendly
                  ? "bg-amber-400 border-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : "bg-slate-850 border-slate-700/60 hover:bg-slate-800 text-slate-300"
              }`}
              title="Toggle dyslexia-friendly font setting (Lexend)"
              aria-pressed={isDyslexicFriendly}
            >
              Dyslexia Font
            </button>

            {/* Streak Indicator */}
            <StreakCounter streak={profile.streak} theme={profile.theme} />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-850 border border-slate-700/60 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
              aria-label="Secure Exit"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dynamic GCSE Countdown Clock alert banner */}
        {profile.gcseExamDate && (
          <div
            className={`w-full p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
              isMarvel
                ? "bg-gradient-to-r from-red-950/40 to-slate-950 border-red-500/30 text-red-200"
                : "bg-gradient-to-r from-purple-950/40 to-slate-950 border-pink-500/30 text-pink-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-400 animate-bounce shrink-0" />
              <div>
                <h2 className="font-lexend font-bold text-sm tracking-wide">
                  {isMarvel ? "COSMIC DOOMSDAY COUNTDOWN" : "CELESTIAL ALIGNMENT PREPARATION"}
                </h2>
                <p className="text-[11px] opacity-80">
                  Secure your GCSE battle ready tactics. The final boss emerges in:
                </p>
              </div>
            </div>
            <span className="font-mono text-base md:text-lg font-black tracking-widest bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
              {countdownText || "Calculating stardust..."}
            </span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main learning section (Journey map & subject selection) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Subject / Chapter Bar selection */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-2xl p-4 glass-panel">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-extrabold uppercase tracking-wide">Choose Path</span>
              </div>
              <div className="flex gap-2">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubject(sub)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-lexend transition-all ${
                      activeSubject?.id === sub.id
                        ? isMarvel
                          ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          : "bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Display active Journey Map */}
            {activeSubject ? (
              <JourneyMap
                theme={profile.theme}
                topics={activeSubject.topics}
                completedQuestIds={Object.keys(progress.completedQuests)}
                onSelectQuest={(quest) => setActiveQuest(quest)}
              />
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel text-slate-400 text-sm">
                No active paths found for your level.
              </div>
            )}
          </div>

          {/* Sidebar Panels (Stats, Leaderboard, Level info) */}
          <div className="space-y-6">
            
            {/* XP & Level Panel */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 glass-panel flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Current rank</span>
                  <h3 className="text-xl font-black font-lexend">LEVEL {profile.level}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${isMarvel ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-pink-500/10 text-pink-300 border-pink-500/20"} border`}>
                  {isMarvel ? <Shield className="h-5 w-5 fill-cyan-400/20" /> : <Sparkles className="h-5 w-5" />}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 font-mono text-slate-300">
                  <span>{xpInLevel} / 1000 XP</span>
                  <span>{Math.round(levelProgressPct)}%</span>
                </div>
                {/* Progress bar wrapper */}
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${levelProgressPct}%` }}
                    className={`h-full rounded-full ${isMarvel ? "bg-cyan-500" : "bg-pink-500"}`}
                  />
                </div>
              </div>
            </div>

            {/* Anonymized Leaderboard Panel */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 glass-panel">
              <h3 className="text-sm font-extrabold uppercase tracking-widest mb-4 text-slate-200 flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-yellow-400" /> Leaderboard Rankings
              </h3>
              
              <div className="space-y-3">
                {leaderboard.map((lbItem, index) => {
                  const isSelf = lbItem.username === profile.username;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isSelf
                          ? isMarvel
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                            : "bg-pink-500/10 border-pink-500/40 text-pink-200"
                          : "bg-slate-950/40 border-transparent hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs w-4">#{index + 1}</span>
                        <span className="font-semibold text-xs font-lexend">{lbItem.username}</span>
                      </div>
                      <span className="text-xs font-bold font-mono">
                        Lvl {lbItem.level} • {lbItem.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Launcher for Exam Simulator */}
      {activeQuest && (
        <ExamSimulator
          quest={activeQuest}
          theme={profile.theme}
          onClose={() => setActiveQuest(null)}
          onComplete={handleCompleteQuest}
        />
      )}

      {/* Status Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </main>
  );
}
