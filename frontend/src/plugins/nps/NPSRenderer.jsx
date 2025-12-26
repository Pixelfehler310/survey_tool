/**
 * NPS Renderer - Survey-side component for NPS question
 *
 * Renders a 0-10 scale with color coding:
 * - 0-6: Detractors (red)
 * - 7-8: Passives (yellow)
 * - 9-10: Promoters (green)
 */

import React from "react";

export default function NPSRenderer({ question, value, onChange }) {
  const { config = {} } = question;
  const lowLabel = config.lowLabel || "Überhaupt nicht wahrscheinlich";
  const highLabel = config.highLabel || "Sehr wahrscheinlich";

  const getButtonClass = (n, isSelected) => {
    let base = "w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ";

    // Color based on NPS category
    if (n <= 6) {
      // Detractor - red
      base += isSelected ? "bg-red-500 text-white ring-2 ring-red-600 ring-offset-2" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400";
    } else if (n <= 8) {
      // Passive - yellow
      base += isSelected ? "bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-2" : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    } else {
      // Promoter - green
      base += isSelected ? "bg-green-500 text-white ring-2 ring-green-600 ring-offset-2" : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400";
    }

    return base;
  };

  const getCategory = (n) => {
    if (n === null || n === undefined) return null;
    if (n <= 6) return "Kritiker";
    if (n <= 8) return "Passiv";
    return "Promoter";
  };

  const getCategoryColor = (n) => {
    if (n === null || n === undefined) return "";
    if (n <= 6) return "text-red-600";
    if (n <= 8) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-4">
      {/* Question text is rendered by parent Question component */}

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      {/* Score buttons */}
      <div className="flex justify-between gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className={getButtonClass(n, value === n)}>
            {n}
          </button>
        ))}
      </div>

      {/* Selected value indicator */}
      {value !== null && value !== undefined && (
        <div className="text-center text-sm">
          <span className="text-slate-500">Ihre Bewertung: </span>
          <span className={`font-bold ${getCategoryColor(value)}`}>
            {value} – {getCategory(value)}
          </span>
        </div>
      )}
    </div>
  );
}
