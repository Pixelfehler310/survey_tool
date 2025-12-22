/**
 * TextArea - Multi-line text input question
 */

export default function TextArea({ question, value, onChange }) {
  const config = question.config || {};

  return (
    <div className="w-full">
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder || "Deine Antwort..."}
        maxLength={config.maxLength}
        rows={config.rows || 4}
        className="input-field resize-none"
        autoFocus
      />
      {config.maxLength && (
        <p className="text-sm text-slate-500 mt-2 text-right">
          {(value || "").length} / {config.maxLength}
        </p>
      )}
    </div>
  );
}
