/**
 * QuestionEditor - Right panel for editing selected question
 */

import React from "react";
import useBuilderStore from "../../store/builderStore";
import { getQuestionType } from "./questionTypes";

function OptionsEditor({ options = [], onChange }) {
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    // Auto-update value if label changes and value matches old pattern
    if (field === "label" && newOptions[index].value.startsWith("option")) {
      newOptions[index].value =
        value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .slice(0, 20) || `option${index + 1}`;
    }
    onChange(newOptions);
  };

  const addOption = () => {
    const newIndex = options.length + 1;
    onChange([...options, { value: `option${newIndex}`, label: `Option ${newIndex}` }]);
  };

  const removeOption = (index) => {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Optionen</label>
      {options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={option.label}
            onChange={(e) => handleOptionChange(index, "label", e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button onClick={() => removeOption(index)} disabled={options.length <= 1} className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30">
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        className="w-full p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
      >
        + Option hinzufügen
      </button>
    </div>
  );
}

function ScaleConfigEditor({ config = {}, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum</label>
          <input
            type="number"
            value={config.min || 1}
            onChange={(e) => onChange({ ...config, min: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maximum</label>
          <input
            type="number"
            value={config.max || 5}
            onChange={(e) => onChange({ ...config, max: parseInt(e.target.value) || 5 })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Label</label>
          <input
            type="text"
            value={config.min_label || ""}
            onChange={(e) => onChange({ ...config, min_label: e.target.value })}
            placeholder="z.B. Niedrig"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Label</label>
          <input
            type="text"
            value={config.max_label || ""}
            onChange={(e) => onChange({ ...config, max_label: e.target.value })}
            placeholder="z.B. Hoch"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function QuestionEditor() {
  const { selectedQuestionId, survey, updateQuestion, selectQuestion } = useBuilderStore();

  const question = survey.questions.find((q) => q.id === selectedQuestionId);

  if (!question) {
    return (
      <div className="w-80 p-6 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
          <div className="text-4xl mb-4">👈</div>
          <p className="text-sm">Wählen Sie eine Frage aus, um sie zu bearbeiten</p>
        </div>
      </div>
    );
  }

  const questionType = getQuestionType(question.type);
  const hasOptions = ["radio", "checkbox", "dropdown", "ranking"].includes(question.type);
  const hasScale = question.type === "scale";

  const handleUpdate = (field, value) => {
    updateQuestion(question.id, { [field]: value });
  };

  return (
    <div className="w-80 p-4 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">{questionType?.icon}</span>
          <span className="font-medium">{questionType?.label}</span>
        </div>
        <button onClick={() => selectQuestion(null)} className="p-1 text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fragetext</label>
          <textarea
            value={question.text || ""}
            onChange={(e) => handleUpdate("text", e.target.value)}
            rows={3}
            placeholder="Geben Sie Ihre Frage ein..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pflichtfeld</label>
          <button
            onClick={() => handleUpdate("required", !question.required)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${question.required ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${question.required ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {/* Options (for radio/checkbox/dropdown) */}
        {hasOptions && <OptionsEditor options={question.options || []} onChange={(options) => handleUpdate("options", options)} />}

        {/* Scale Config */}
        {hasScale && <ScaleConfigEditor config={question.config || {}} onChange={(config) => handleUpdate("config", config)} />}

        {/* Logic Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bedingte Logik</label>
            {question.show_if && <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded">Aktiv</span>}
          </div>
          <input
            type="text"
            value={question.show_if || ""}
            onChange={(e) => handleUpdate("show_if", e.target.value)}
            placeholder="z.B. answers.q1 == 'yes'"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
          />
          <p className="mt-1 text-xs text-slate-400">Expression die true sein muss, damit diese Frage angezeigt wird</p>
        </div>

        {/* Question ID (readonly) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-medium text-slate-500 mb-1">Frage-ID</label>
          <code className="block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">{question.id}</code>
        </div>
      </div>
    </div>
  );
}
