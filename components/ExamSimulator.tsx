"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Eye, RefreshCw, Volume2 } from "lucide-react";
import { Quest, Question } from "@/types/curriculum";
import { StudentTheme } from "@/types/auth";

interface SimulatorProps {
  quest: Quest;
  theme: StudentTheme;
  onComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

/**
 * WCAG 2.2 AA Exam Simulator component.
 * Features: dyslexia font switch, text-to-speech option, instant grading feedback, clear contrast labels.
 */
export default function ExamSimulator({ quest, theme, onComplete, onClose }: SimulatorProps) {
  const isMarvel = theme === "marvel";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isDyslexicFriendly, setIsDyslexicFriendly] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  const questions = quest.questions;
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleTextToSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speechActive) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.onend = () => setSpeechActive(false);
    setSpeechActive(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isSubmitted) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.marks);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score percentage and XP
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const scorePct = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
      const xpEarned = Math.round(quest.xpReward * (scorePct / 100));
      onComplete(scorePct, xpEarned);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md select-none ${
        isDyslexicFriendly ? "dyslexic-font" : ""
      }`}
    >
      <div className="w-full max-w-2xl rounded-3xl glass-panel-dark border-white/10 text-white overflow-hidden shadow-2xl relative">
        
        {/* Header bar with controls */}
        <div className="px-6 py-4 bg-slate-900/60 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold font-lexend text-slate-100 flex items-center gap-2">
              {quest.isBossBattle ? "Boss Encounter" : "Training Mission"}
            </h2>
            <p className="text-xs text-slate-400 font-lexend">{quest.title}</p>
          </div>

          <div className="flex gap-2.5 items-center">
            {/* Accessibility features */}
            <button
              onClick={() => setIsDyslexicFriendly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-lexend transition-all ${
                isDyslexicFriendly
                  ? "bg-amber-400 border-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "bg-slate-800 border-slate-700/60 hover:bg-slate-700/60 text-slate-200"
              }`}
              title="Toggle dyslexia-friendly font setting (Lexend)"
              aria-pressed={isDyslexicFriendly}
            >
              Dyslexia Font
            </button>
            <button
              onClick={handleTextToSpeech}
              className={`p-2 rounded-lg border transition-all ${
                speechActive
                  ? "bg-cyan-500 border-cyan-600 text-white"
                  : "bg-slate-800 border-slate-700/60 hover:bg-slate-700/60 text-slate-300"
              }`}
              title="Read question aloud"
              aria-label="Read question text aloud"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all"
              aria-label="Quit session"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="w-full bg-slate-950 h-1.5">
          <motion.div
            className={`h-full ${isMarvel ? "bg-cyan-500" : "bg-pink-500"}`}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Question Text */}
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400 block mb-1">
              Question {currentIndex + 1} of {questions.length} • {currentQuestion.marks} Marks
            </span>
            <h3 className="text-xl font-bold font-lexend leading-relaxed text-slate-100">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Question Options */}
          <div className="space-y-3" role="radiogroup" aria-label="Question choices">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOpt = option === currentQuestion.correctAnswer;
              
              let optStyles = "bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300";
              if (isSelected) {
                optStyles = isMarvel
                  ? "bg-cyan-500/10 border-cyan-400 text-cyan-200"
                  : "bg-pink-500/10 border-pink-400 text-pink-200";
              }
              if (isSubmitted) {
                if (isCorrectOpt) {
                  optStyles = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold";
                } else if (isSelected) {
                  optStyles = "bg-rose-500/20 border-rose-500 text-rose-200";
                } else {
                  optStyles = "bg-slate-950/40 border-slate-900 text-slate-500";
                }
              }

              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left font-lexend text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${optStyles}`}
                >
                  <span>{option}</span>
                  {isSubmitted && isCorrectOpt && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrectOpt && <X className="h-4 w-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-white/5"
              >
                <div className="flex gap-2.5 items-start">
                  <div className="p-1 rounded-lg bg-slate-950 shrink-0">
                    <Eye className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono text-amber-400 font-bold mb-1">
                      {selectedAnswer === currentQuestion.correctAnswer ? "Correct Answer!" : "Keep learning!"}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-lexend">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-white/5 flex justify-end gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm font-lexend flex items-center gap-2 transition-all ${
                selectedAnswer
                  ? isMarvel
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer"
                    : "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"
                  : "bg-slate-800 border border-slate-700/60 text-slate-500 cursor-not-allowed"
              }`}
            >
              Verify Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm font-lexend flex items-center gap-2 text-white hover:opacity-95 transition-all ${
                isMarvel ? "bg-cyan-500" : "bg-pink-500"
              }`}
            >
              {currentIndex + 1 < questions.length ? (
                <>
                  Next Mission <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Finish Quest <RefreshCw className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
