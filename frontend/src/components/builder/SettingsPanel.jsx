/**
 * SettingsPanel - Survey settings editor
 */

import React, { useState } from "react";
import useBuilderStore from "../../store/builderStore";

const TYPEWRITER_PRESETS = {
  slow: 22,
  normal: 35,
  fast: 55,
};

function SettingToggle({ label, description, value, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`
          relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4
          ${value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
            ${value ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

export default function SettingsPanel({ isOpen, onClose }) {
  const { survey, setTitle, setSettings, setBranding } = useBuilderStore();
  const [activeTab, setActiveTab] = useState("general");

  if (!isOpen) return null;

  const tabs = [
    { id: "general", label: "Allgemein", icon: "⚙️" },
    { id: "funmode", label: "Fun Mode", icon: "✨" },
    { id: "branding", label: "Branding", icon: "🎨" },
    { id: "thankyou", label: "Dankeseite", icon: "🎉" },
  ];

  const funMode = survey.settings?.fun_mode || {};
  const typewriter = funMode.typewriter || {};
  const character = funMode.character || {};
  const isPagedLayout = (survey.settings?.layout || "paged") === "paged";

  const updateFunMode = (updates) => {
    setSettings({ fun_mode: { ...funMode, ...updates } });
  };

  const updateTypewriter = (updates) => {
    setSettings({
      fun_mode: {
        ...funMode,
        typewriter: { ...typewriter, ...updates },
      },
    });
  };

  const updateCharacter = (updates) => {
    setSettings({
      fun_mode: {
        ...funMode,
        character: { ...character, ...updates },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold">Umfrage-Einstellungen</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"}
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel</label>
                <input
                  type="text"
                  value={survey.title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Setting Toggles */}
              <div className="mt-6">
                <SettingToggle
                  label="Zurück-Navigation"
                  description="Nutzer können zu vorherigen Fragen zurückkehren"
                  value={survey.settings?.allow_back ?? true}
                  onChange={(v) => setSettings({ allow_back: v })}
                />
                <SettingToggle
                  label="Fortschrittsanzeige"
                  description="Zeigt den Fortschritt der Umfrage an"
                  value={survey.settings?.show_progress ?? true}
                  onChange={(v) => setSettings({ show_progress: v })}
                />
                <SettingToggle label="CAPTCHA" description="Cloudflare Turnstile für Bot-Schutz aktivieren" value={survey.settings?.captcha ?? false} onChange={(v) => setSettings({ captcha: v })} />
              </div>

              {/* Duplicate Prevention */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duplikat-Prävention</label>
                <select
                  value={survey.settings?.duplicate_prevention || "none"}
                  onChange={(e) => setSettings({ duplicate_prevention: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="none">Keine</option>
                  <option value="client">Client-seitig (Browser Fingerprint)</option>
                  <option value="server">Server-seitig (strikt)</option>
                </select>
              </div>

              {/* Layout Mode */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Layout-Modus</label>
                <select
                  value={survey.settings?.layout || "paged"}
                  onChange={(e) => setSettings({ layout: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="paged">Seitenweise (Weiter/Zurück-Buttons)</option>
                  <option value="scroll-reveal">Scroll mit Enthüllung (nächste Frage nach Antwort)</option>
                  <option value="scroll-all">Scroll komplett (alle Fragen sichtbar)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  {survey.settings?.layout === "scroll-reveal" && "Fragen werden nacheinander enthüllt, sobald die vorherige beantwortet wurde."}
                  {survey.settings?.layout === "scroll-all" && "Alle Fragen sind von Anfang an sichtbar."}
                  {(!survey.settings?.layout || survey.settings?.layout === "paged") && "Klassische Umfrage mit einer Frage pro Seite."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "funmode" && (
            <div className="space-y-4">
              {!isPagedLayout && (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-700 dark:text-amber-300">
                  Fun Mode ist nur im Layout-Modus "Seitenweise" aktiv. Stelle den Layout-Modus auf "paged", um ihn für Teilnehmer zu verwenden.
                </div>
              )}

              <div>
                <SettingToggle
                  label="Fun Mode aktivieren"
                  description="Rendert die paged Umfrage als spielartige Dialogszene"
                  value={funMode.enabled ?? false}
                  disabled={!isPagedLayout}
                  onChange={(v) => updateFunMode({ enabled: v })}
                />
                <SettingToggle
                  label="Teilnehmer können ausschalten"
                  description="Zeigt einen kompakten Button, der zurück zur normalen paged Ansicht wechselt"
                  value={funMode.participant_toggle ?? true}
                  onChange={(v) => updateFunMode({ participant_toggle: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Texttempo</label>
                  <select
                    value={typewriter.preset || "normal"}
                    onChange={(e) => updateTypewriter({ preset: e.target.value, characters_per_second: TYPEWRITER_PRESETS[e.target.value] })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="slow">Langsam</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Schnell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zeichen pro Sekunde</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={typewriter.characters_per_second ?? TYPEWRITER_PRESETS[typewriter.preset || "normal"]}
                    onChange={(e) => updateTypewriter({ characters_per_second: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <SettingToggle
                  label="Klick zeigt ganzen Text"
                  description="Teilnehmer können die Typewriter-Animation überspringen"
                  value={typewriter.skip_on_click ?? true}
                  onChange={(v) => updateTypewriter({ skip_on_click: v })}
                />
                <SettingToggle
                  label="Antworten erst nach Text"
                  description="Antwortcontrols erscheinen erst nach vollständiger Dialogzeile"
                  value={typewriter.answers_after_reveal ?? true}
                  onChange={(v) => updateTypewriter({ answers_after_reveal: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Charakter</label>
                  <select
                    value={character.preset || "default_host"}
                    onChange={(e) => updateCharacter({ preset: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="default_host">Default Host</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Standardausdruck</label>
                  <select
                    value={character.default_expression || "friendly"}
                    onChange={(e) => updateCharacter({ default_expression: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="curious">Curious</option>
                    <option value="thinking">Thinking</option>
                    <option value="happy">Happy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Antwortreaktion</label>
                  <select
                    value={character.answer_reaction || "happy_bounce"}
                    onChange={(e) => updateCharacter({ answer_reaction: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="happy_bounce">Happy Bounce</option>
                    <option value="none">Keine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endanimation</label>
                  <select
                    value={character.completion_animation || "celebrate"}
                    onChange={(e) => updateCharacter({ completion_animation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="celebrate">Celebrate</option>
                    <option value="none">Keine</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Ausdrucke und Endanimationen werden als JSON-Konfiguration gespeichert. Die erste Implementierung nutzt den Default Host und einfache CSS-Animationen.
              </p>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={survey.branding?.logo_url || ""}
                  onChange={(e) => setBranding({ logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primärfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={survey.branding?.primary_color || "#6366f1"}
                    onChange={(e) => setBranding({ primary_color: e.target.value })}
                    className="w-12 h-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={survey.branding?.primary_color || "#6366f1"}
                    onChange={(e) => setBranding({ primary_color: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Schriftart</label>
                <input
                  type="text"
                  value={survey.branding?.font_family || ""}
                  onChange={(e) => setBranding({ font_family: e.target.value })}
                  placeholder="Inter, system-ui, sans-serif"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {activeTab === "thankyou" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel</label>
                <input
                  type="text"
                  value={survey.settings?.thank_you?.title || ""}
                  onChange={(e) => setSettings({ thank_you: { ...survey.settings?.thank_you, title: e.target.value } })}
                  placeholder="Vielen Dank!"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nachricht</label>
                <textarea
                  value={survey.settings?.thank_you?.message || ""}
                  onChange={(e) => setSettings({ thank_you: { ...survey.settings?.thank_you, message: e.target.value } })}
                  placeholder="Ihre Antworten wurden erfolgreich übermittelt."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={survey.settings?.thank_you?.cta_text || ""}
                    onChange={(e) => setSettings({ thank_you: { ...survey.settings?.thank_you, cta_text: e.target.value } })}
                    placeholder="Zur Website"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA URL</label>
                  <input
                    type="url"
                    value={survey.settings?.thank_you?.cta_url || ""}
                    onChange={(e) => setSettings({ thank_you: { ...survey.settings?.thank_you, cta_url: e.target.value } })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}
