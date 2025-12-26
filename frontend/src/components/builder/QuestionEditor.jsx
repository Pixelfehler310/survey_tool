/**
 * QuestionEditor - Right panel for editing selected question
 */

import React, { useState } from "react";
import useBuilderStore from "../../store/builderStore";
import { getQuestionType } from "./questionTypes";
import LogicEditor from "./LogicEditor";
import { getPluginEditor, isPluginType } from "../../lib/pluginRegistry";

/**
 * Tooltip component with info icon
 */
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-help"
      >
        i
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg w-48 text-center">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
        </div>
      )}
    </span>
  );
}

function OptionsEditor({ options = [], onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
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
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
          Optionen
          <InfoTooltip text="Definieren Sie die Antwortmöglichkeiten. Klicken Sie auf 'IDs bearbeiten' um die technischen Werte für Expressions anzupassen." />
        </label>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-indigo-500 hover:text-indigo-600">
          {showAdvanced ? "IDs ausblenden" : "IDs bearbeiten"}
        </button>
      </div>
      {options.map((option, index) => (
        <div key={index} className="space-y-1">
          <div className="flex gap-2">
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
          {showAdvanced && (
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs text-slate-400">ID:</span>
              <input
                type="text"
                value={option.value}
                onChange={(e) => handleOptionChange(index, "value", e.target.value.replace(/[^a-z0-9_]/gi, "_").toLowerCase())}
                placeholder="option_id"
                className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
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

// Logic section with modal trigger
function LogicSection({ question, allQuestions, onUpdate }) {
  const [showLogicEditor, setShowLogicEditor] = useState(false);

  // Filter out current question from list
  const availableQuestions = allQuestions.filter((q) => q.id !== question.id);

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bedingte Logik</label>
        {question.show_if && <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded">Aktiv</span>}
      </div>

      {question.show_if ? (
        <div className="space-y-2">
          <code className="block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400 break-all">{question.show_if}</code>
          <button
            onClick={() => setShowLogicEditor(true)}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            🔀 Logik bearbeiten
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLogicEditor(true)}
          className="w-full px-3 py-2 text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-purple-400 hover:text-purple-500 transition-colors"
        >
          + Bedingte Logik hinzufügen
        </button>
      )}

      <LogicEditor isOpen={showLogicEditor} currentExpression={question.show_if || ""} questions={availableQuestions} onSave={onUpdate} onClose={() => setShowLogicEditor(false)} />
    </div>
  );
}

export default function QuestionEditor() {
  const { selectedQuestionId, survey, updateQuestion, selectQuestion } = useBuilderStore();

  const question = survey.questions.find((q) => q.id === selectedQuestionId);

  if (!question) {
    return (
      <div className="w-80 h-full p-6 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
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
    <div className="w-80 h-full p-4 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto">
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
          <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
            Pflichtfeld
            <InfoTooltip text="Wenn aktiviert, muss der Nutzer diese Frage beantworten, bevor er fortfahren kann." />
          </label>
          <button
            onClick={() => handleUpdate("required", !question.required)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${question.required ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}
            `}
          >
            <span
              className={`
                absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                ${question.required ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </div>

        {/* Options (for radio/checkbox/dropdown) */}
        {hasOptions && <OptionsEditor options={question.options || []} onChange={(options) => handleUpdate("options", options)} />}

        {/* Scale Config */}
        {hasScale && <ScaleConfigEditor config={question.config || {}} onChange={(config) => handleUpdate("config", config)} />}

        {/* Plugin-specific Editor */}
        {isPluginType(question.type) &&
          (() => {
            const PluginEditor = getPluginEditor(question.type);
            if (PluginEditor) {
              return (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Plugin-Einstellungen</h4>
                  <PluginEditor
                    question={question}
                    onChange={(updatedQuestion) => {
                      Object.entries(updatedQuestion).forEach(([key, value]) => {
                        if (value !== question[key]) {
                          handleUpdate(key, value);
                        }
                      });
                    }}
                  />
                </div>
              );
            }
            return null;
          })()}

        {/* Logic Section */}
        <LogicSection question={question} allQuestions={survey.questions} onUpdate={(expr) => handleUpdate("show_if", expr)} />

        {/* Question ID (editable) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Frage-ID
            <InfoTooltip text="Eindeutige ID für diese Frage. Wird in Expressions referenziert als 'answers.<id>'. Verwenden Sie aussagekräftige Namen wie 'age', 'gender', 'satisfaction'." />
          </label>
          <input
            type="text"
            value={question.id}
            onChange={(e) => {
              const newId = e.target.value.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
              if (newId && newId !== question.id) {
                handleUpdate("id", newId);
              }
            }}
            placeholder="question_id"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-slate-400">
            Referenzieren als: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">answers.{question.id}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
