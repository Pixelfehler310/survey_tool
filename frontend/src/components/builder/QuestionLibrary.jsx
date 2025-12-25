/**
 * QuestionLibrary - Sidebar with draggable question types
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { getQuestionTypeList } from "./questionTypes";

function DraggableQuestionType({ type, icon, label, description }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { type, isNew: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 rounded-lg border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800 cursor-grab
        hover:border-indigo-400 hover:shadow-md
        transition-all duration-200
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionLibrary() {
  const questionTypes = getQuestionTypeList();

  return (
    <div className="w-64 p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Fragetypen</h3>

      <div className="space-y-2">
        {questionTypes.map((qt) => (
          <DraggableQuestionType key={qt.type} type={qt.type} icon={qt.icon} label={qt.label} description={qt.description} />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 italic">Ziehen Sie einen Fragetyp in den Bearbeitungsbereich</p>
      </div>
    </div>
  );
}
