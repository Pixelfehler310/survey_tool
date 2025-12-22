/**
 * TextInput - Single-line text input question
 */

export default function TextInput({ question, value, onChange }) {
  const config = question.config || {};

  return (
    <div className="w-full">
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder || "Deine Antwort..."}
        maxLength={config.maxLength}
        minLength={config.minLength}
        className="input-field"
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
