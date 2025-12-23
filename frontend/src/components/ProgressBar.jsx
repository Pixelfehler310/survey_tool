/**
 * ProgressBar - Visual progress indicator
 */

export default function ProgressBar({ progress, showLabel = true }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {showLabel && <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fortschritt</span>}
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
