/**
 * LogicEditor - Visual builder for show_if expressions
 */

import React, { useState, useEffect } from "react";

const OPERATORS = [
  { value: "==", label: "ist gleich" },
  { value: "!=", label: "ist nicht gleich" },
  { value: "contains", label: "enthält" },
  { value: ">", label: "größer als" },
  { value: "<", label: "kleiner als" },
  { value: "isEmpty", label: "ist leer" },
  { value: "isNotEmpty", label: "ist nicht leer" },
];

// Parse existing expression into conditions
function parseExpression(expr) {
  if (!expr) return [];

  // Simple parser for expressions like: answers.q1 == 'yes' && answers.q2 != ''
  const conditions = [];
  const parts = expr.split(/\s*&&\s*/);

  for (const part of parts) {
    // Match: answers.questionId operator 'value' or answers.questionId operator value
    const match = part.match(/answers\.(\w+)\s*(==|!=|>|<|contains)\s*['"]?([^'"]*?)['"]?$/);
    if (match) {
      conditions.push({
        questionId: match[1],
        operator: match[2],
        value: match[3],
      });
    }
    // Match: answers.questionId (isEmpty check)
    const emptyMatch = part.match(/^!?answers\.(\w+)$/);
    if (emptyMatch) {
      conditions.push({
        questionId: emptyMatch[1],
        operator: part.startsWith("!") ? "isNotEmpty" : "isEmpty",
        value: "",
      });
    }
  }

  return conditions.length > 0 ? conditions : [{ questionId: "", operator: "==", value: "" }];
}

// Generate expression from conditions
function generateExpression(conditions) {
  const parts = conditions
    .filter((c) => c.questionId)
    .map((c) => {
      if (c.operator === "isEmpty") {
        return `!answers.${c.questionId}`;
      }
      if (c.operator === "isNotEmpty") {
        return `answers.${c.questionId}`;
      }
      if (c.operator === "contains") {
        return `answers.${c.questionId}.includes('${c.value}')`;
      }
      return `answers.${c.questionId} ${c.operator} '${c.value}'`;
    });

  return parts.join(" && ");
}

function ConditionRow({ condition, questions, onChange, onRemove, canRemove }) {
  const selectedQuestion = questions.find((q) => q.id === condition.questionId);
  const hasOptions = selectedQuestion?.options?.length > 0;
  const needsValue = !["isEmpty", "isNotEmpty"].includes(condition.operator);

  return (
    <div className="flex gap-2 items-start">
      {/* Question Select */}
      <select
        value={condition.questionId}
        onChange={(e) => onChange({ ...condition, questionId: e.target.value })}
        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
      >
        <option value="">Frage wählen...</option>
        {questions.map((q) => (
          <option key={q.id} value={q.id}>
            {q.text?.slice(0, 40) || q.id}
          </option>
        ))}
      </select>

      {/* Operator Select */}
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value })}
        className="w-40 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value Input */}
      {needsValue &&
        (hasOptions ? (
          <select
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="">Wert wählen...</option>
            {selectedQuestion.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Wert..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        ))}

      {/* Remove Button */}
      {canRemove && (
        <button onClick={onRemove} className="p-2 text-slate-400 hover:text-red-500">
          ✕
        </button>
      )}
    </div>
  );
}

export default function LogicEditor({ isOpen, currentExpression, questions, onSave, onClose }) {
  const [conditions, setConditions] = useState([]);
  const [mode, setMode] = useState("visual"); // 'visual' or 'manual'
  const [manualExpression, setManualExpression] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConditions(parseExpression(currentExpression));
      setManualExpression(currentExpression || "");
      // Default to manual mode if expression couldn't be parsed
      if (currentExpression && parseExpression(currentExpression).length === 1 && !parseExpression(currentExpression)[0].questionId) {
        setMode("manual");
      } else {
        setMode("visual");
      }
    }
  }, [isOpen, currentExpression]);

  const handleConditionChange = (index, newCondition) => {
    const updated = [...conditions];
    updated[index] = newCondition;
    setConditions(updated);
  };

  const addCondition = () => {
    setConditions([...conditions, { questionId: "", operator: "==", value: "" }]);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const expr = mode === "manual" ? manualExpression : generateExpression(conditions);
    onSave(expr);
    onClose();
  };

  const handleClear = () => {
    onSave("");
    onClose();
  };

  const expression = generateExpression(conditions);

  // Sync manual expression when switching from visual mode
  const handleModeChange = (newMode) => {
    if (newMode === "manual" && mode === "visual") {
      setManualExpression(expression);
    }
    setMode(newMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold">🔀 Bedingte Logik</h3>
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-sm">
              <button
                onClick={() => handleModeChange("visual")}
                className={`px-3 py-1 rounded transition-colors ${mode === "visual" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                Visual
              </button>
              <button
                onClick={() => handleModeChange("manual")}
                className={`px-3 py-1 rounded transition-colors ${mode === "manual" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                Code
              </button>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mode === "visual" ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">Diese Frage anzeigen, wenn folgende Bedingungen erfüllt sind:</p>

              {/* Conditions */}
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index}>
                    {index > 0 && <div className="text-center text-xs text-slate-400 font-medium my-2">UND</div>}
                    <ConditionRow
                      condition={condition}
                      questions={questions}
                      onChange={(c) => handleConditionChange(index, c)}
                      onRemove={() => removeCondition(index)}
                      canRemove={conditions.length > 1}
                    />
                  </div>
                ))}
              </div>

              {/* Add Condition */}
              <button
                onClick={addCondition}
                className="w-full p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
              >
                + UND Bedingung hinzufügen
              </button>

              {/* Expression Preview */}
              {expression && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Generierte Expression:</div>
                  <code className="text-sm text-slate-700 dark:text-slate-300 break-all">{expression}</code>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expression (JavaScript-Syntax)</label>
                <textarea
                  value={manualExpression}
                  onChange={(e) => setManualExpression(e.target.value)}
                  rows={4}
                  placeholder="z.B. answers.q1 == 'yes' && answers.age >= 18"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">💡 Expression-Syntax</div>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">answers.frage_id == 'wert'</code> - Gleichheit
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">answers.frage_id != 'wert'</code> - Ungleichheit
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">answers.frage_id {">"} 5</code> - Größer als
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">answers.frage_id.includes('text')</code> - Enthält
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">!answers.frage_id</code> - Ist leer
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">expr1 && expr2</code> - UND Verknüpfung
                  </li>
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">expr1 || expr2</code> - ODER Verknüpfung
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <button onClick={handleClear} className="px-4 py-2 text-sm text-red-600 hover:text-red-700">
            Logik entfernen
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              Abbrechen
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Übernehmen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
