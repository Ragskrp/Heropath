import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

/**
 * An accessibility-friendly skeletal placeholder loader.
 */
export default function SkeletonLoader({ className = "", variant = "rectangular" }: SkeletonProps) {
  const baseClass = "animate-pulse bg-slate-700/40 dark:bg-slate-800/60";
  
  let variantClass = "rounded-lg";
  if (variant === "text") {
    variantClass = "h-4 rounded w-3/4 mb-2";
  } else if (variant === "circular") {
    variantClass = "rounded-full";
  }

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading content..."
      className={`${baseClass} ${variantClass} ${className}`}
    />
  );
}
