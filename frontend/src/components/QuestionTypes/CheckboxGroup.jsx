/**
 * CheckboxGroup - Multi-select option group
 */

export default function CheckboxGroup({ question, value, onChange }) {
  const options = question.options || [];
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optionValue) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <label
            key={option.value}
            className={`
              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
            `}
          >
            <input type="checkbox" value={option.value} checked={isSelected} onChange={() => handleToggle(option.value)} className="sr-only" />
            <span
              className={`
              w-5 h-5 rounded border-2 mr-4 flex items-center justify-center transition-colors
              ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}
            `}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-slate-700 font-medium">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
