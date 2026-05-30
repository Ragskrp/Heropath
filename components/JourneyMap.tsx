"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Award, Play, ShieldAlert, Sparkles, Sword } from "lucide-react";
import { StudentTheme } from "@/types/auth";
import { Quest, Topic } from "@/types/curriculum";

interface JourneyMapProps {
  theme: StudentTheme;
  topics: Topic[];
  completedQuestIds: string[];
  onSelectQuest: (quest: Quest) => void;
}

/**
 * Interactive SVG Hero Journey Map.
 * Marvel (cosmic pathways) vs Princess (magical enchanted trail).
 */
export default function JourneyMap({ theme, topics, completedQuestIds, onSelectQuest }: JourneyMapProps) {
  const isMarvel = theme === "marvel";
  const [hoveredQuest, setHoveredQuest] = useState<Quest | null>(null);

  // Flat list of quests with their visual coordinates on a map
  const mapQuests = topics.flatMap((topic, topicIdx) =>
    topic.quests.map((quest, questIdx) => {
      // Calculate a winding S-shape path layout
      const row = topicIdx * 2 + Math.floor(questIdx / 2);
      const col = questIdx % 2;
      const x = col === 0 ? 25 + row * 8 : 75 - row * 6;
      const y = 15 + row * 16;
      
      // Determine lock status
      // A quest is unlocked if it's the first one, or if the previous quest was completed
      const flatIndex = topicIdx * 4 + questIdx;
      let isUnlocked = true;
      
      if (flatIndex > 0) {
        const allFlatQuests = topics.flatMap(t => t.quests);
        const prevQuest = allFlatQuests[flatIndex - 1];
        isUnlocked = prevQuest ? completedQuestIds.includes(prevQuest.id) : true;
      }

      const isCompleted = completedQuestIds.includes(quest.id);

      return {
        ...quest,
        x,
        y,
        isUnlocked,
        isCompleted,
      };
    })
  );

  return (
    <div className="relative w-full aspect-[16/10] max-h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 glass-panel">
      {/* Dynamic Cinematic Backgrounds */}
      {isMarvel ? (
        <div className="absolute inset-0 bg-marvel-cosmic bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950" />
          {/* Moving Cosmic Stars */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-60" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-princess-realm bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-pink-950/40 to-purple-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/15 via-transparent to-transparent opacity-60" />
        </div>
      )}

      {/* SVG Pathways */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Draw the connecting path */}
        {mapQuests.length > 1 && (
          <motion.path
            d={mapQuests.reduce((acc, quest, idx) => {
              if (idx === 0) return `M ${quest.x} ${quest.y}`;
              // Smooth bezier path curve
              const prev = mapQuests[idx - 1];
              if (!prev) return acc;
              const cpY = (prev.y + quest.y) / 2;
              return `${acc} C ${prev.x} ${cpY}, ${quest.x} ${cpY}, ${quest.x} ${quest.y}`;
            }, "")}
            fill="none"
            stroke={isMarvel ? "rgba(6, 182, 212, 0.4)" : "rgba(236, 72, 153, 0.4)"}
            strokeWidth="0.8"
            strokeDasharray="2, 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* Nodes mapping */}
      {mapQuests.map((quest) => {
        const isBoss = quest.isBossBattle;
        const colorClass = isMarvel
          ? quest.isCompleted
            ? "bg-cyan-500 shadow-[0_0_15px_#06b6d4]"
            : quest.isUnlocked
            ? "bg-slate-800 border-2 border-cyan-400 cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.2)]"
            : "bg-slate-900 border border-slate-700/60 opacity-60"
          : quest.isCompleted
          ? "bg-pink-500 shadow-[0_0_15px_#ec4899]"
          : quest.isUnlocked
          ? "bg-slate-800 border-2 border-pink-400 cursor-pointer shadow-[0_0_8px_rgba(236,72,153,0.2)]"
          : "bg-slate-900 border border-slate-700/60 opacity-60";

        return (
          <div
            key={quest.id}
            style={{ left: `${quest.x}%`, top: `${quest.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <motion.button
              whileHover={quest.isUnlocked ? { scale: 1.15 } : {}}
              whileTap={quest.isUnlocked ? { scale: 0.95 } : {}}
              onMouseEnter={() => quest.isUnlocked && setHoveredQuest(quest)}
              onMouseLeave={() => setHoveredQuest(null)}
              onClick={() => quest.isUnlocked && onSelectQuest(quest)}
              disabled={!quest.isUnlocked}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${colorClass}`}
              aria-label={`${quest.title} - ${
                quest.isCompleted ? "Completed" : quest.isUnlocked ? "Unlocked" : "Locked"
              }`}
            >
              {quest.isCompleted ? (
                <Award className="h-5 w-5 text-white" />
              ) : isBoss ? (
                isMarvel ? (
                  <Sword className="h-5 w-5 text-red-400 animate-pulse" />
                ) : (
                  <Sparkles className="h-5 w-5 text-pink-300 animate-pulse" />
                )
              ) : quest.isUnlocked ? (
                <Play className="h-4 w-4 text-white ml-0.5 fill-white" />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </motion.button>

            {/* Custom overlay/glow for Boss Battle */}
            {isBoss && quest.isUnlocked && !quest.isCompleted && (
              <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-60 pointer-events-none" />
            )}
          </div>
        );
      })}

      {/* Floating Info Overlay panel */}
      <AnimatePresence>
        {hoveredQuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel text-white border-white/10 z-30 max-w-sm pointer-events-none"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-lexend font-bold text-sm text-slate-100 flex items-center gap-1.5">
                {hoveredQuest.isBossBattle && (
                  <ShieldAlert className="h-4 w-4 text-red-500 animate-bounce" />
                )}
                {hoveredQuest.title}
              </h3>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                isMarvel ? "bg-cyan-500/20 text-cyan-400" : "bg-pink-500/20 text-pink-300"
              }`}>
                +{hoveredQuest.xpReward} XP
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-lexend">
              {hoveredQuest.description}
            </p>
            <div className="mt-2.5 flex gap-1 items-center text-[10px] text-slate-400 font-mono">
              <span>{hoveredQuest.questions.length} questions</span>
              <span>•</span>
              <span>{hoveredQuest.isBossBattle ? "Boss Combat" : "Training Mission"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
