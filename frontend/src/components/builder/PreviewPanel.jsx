/**
 * PreviewPanel - Live survey preview
 */

import React, { useState } from "react";
import Survey from "../Survey";

export default function PreviewPanel({ isOpen, survey, onClose }) {
  const [device, setDevice] = useState("desktop");

  if (!isOpen) return null;

  // Build survey definition for preview
  const previewDefinition = {
    id: survey.id || "preview",
    title: survey.title,
    version: survey.version || "1.0.0",
    settings: survey.settings || {},
    branding: survey.branding || null,
    questions: survey.questions || [],
  };

  const deviceWidths = {
    desktop: "max-w-3xl",
    tablet: "max-w-md",
    mobile: "max-w-xs",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">📱 Vorschau</h3>
            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded">Preview Mode</span>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setDevice("desktop")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  device === "desktop" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setDevice("tablet")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  device === "tablet" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  device === "mobile" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📲 Mobil
              </button>
            </div>

            <button onClick={onClose} className="ml-4 p-1 text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
          <div className={`mx-auto ${deviceWidths[device]} transition-all duration-300`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
              {previewDefinition.questions.length > 0 ? (
                <Survey surveyId="preview" previewDefinition={previewDefinition} isPreview={true} />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <div className="text-4xl mb-4">📝</div>
                  <p>Fügen Sie Fragen hinzu, um die Vorschau zu sehen</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Die Vorschau zeigt, wie die Umfrage für Teilnehmer aussieht. Änderungen werden in Echtzeit angezeigt.
        </div>
      </div>
    </div>
  );
}
