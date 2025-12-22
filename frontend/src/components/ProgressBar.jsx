/**
 * ProgressBar - Visual progress indicator
 */

export default function ProgressBar({ progress, showLabel = true }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {showLabel && <span className="text-sm text-slate-500">Fortschritt</span>}
        <span className="text-sm font-medium text-indigo-600">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
