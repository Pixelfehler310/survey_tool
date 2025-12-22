/**
 * Scale - Numeric scale component (Likert, NPS, etc.)
 */

export default function Scale({ question, value, onChange }) {
  const config = question.config || {};
  const min = config.min ?? 1;
  const max = config.max ?? 5;

  // Generate array of values from min to max
  const values = [];
  for (let i = min; i <= max; i++) {
    values.push(i);
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        {values.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`
              min-w-[48px] h-12 rounded-lg font-medium text-lg transition-all duration-200
              ${value === num ? "bg-indigo-600 text-white scale-110 shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Labels */}
      {(config.min_label || config.max_label) && (
        <div className="flex justify-between mt-3 text-sm text-slate-500">
          <span>{config.min_label || ""}</span>
          <span>{config.max_label || ""}</span>
        </div>
      )}
    </div>
  );
}
