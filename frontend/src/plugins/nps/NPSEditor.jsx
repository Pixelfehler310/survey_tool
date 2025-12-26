/**
 * NPS Editor - Builder-side configuration for NPS question
 *
 * Allows customizing the low/high labels.
 */

import React from "react";

export default function NPSEditor({ question, onChange }) {
  const config = question.config || {};

  const handleConfigChange = (key, value) => {
    onChange({
      ...question,
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label für 0 (niedrig)</label>
        <input
          type="text"
          value={config.lowLabel || ""}
          onChange={(e) => handleConfigChange("lowLabel", e.target.value)}
          placeholder="Überhaupt nicht wahrscheinlich"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label für 10 (hoch)</label>
        <input
          type="text"
          value={config.highLabel || ""}
          onChange={(e) => handleConfigChange("highLabel", e.target.value)}
          placeholder="Sehr wahrscheinlich"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        />
      </div>

      {/* NPS Info Box */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs space-y-1">
        <div className="font-medium text-slate-700 dark:text-slate-300">📊 NPS Kategorien</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-600 dark:text-slate-400">0-6: Kritiker (Detractors)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 dark:text-slate-400">7-8: Passive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-slate-600 dark:text-slate-400">9-10: Promoter</span>
        </div>
      </div>
    </div>
  );
}
