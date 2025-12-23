/**
 * RadioGroup - Single-select option group
 */

export default function RadioGroup({ question, value, onChange }) {
  const options = question.options || [];

  return (
    <div className="space-y-3 w-full">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${
              value === option.value
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }
          `}
        >
          <input type="radio" name={question.id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
          <span
            className={`
            w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
            ${value === option.value ? "border-indigo-500" : "border-slate-300 dark:border-slate-600"}
          `}
          >
            {value === option.value && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
          </span>
          <span className="font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
