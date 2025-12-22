/**
 * Dropdown - Select dropdown component
 */

export default function Dropdown({ question, value, onChange }) {
  const options = question.options || [];

  return (
    <div className="w-full">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="input-field appearance-none bg-white cursor-pointer pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "20px",
        }}
      >
        <option value="" disabled>
          Bitte wählen...
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
