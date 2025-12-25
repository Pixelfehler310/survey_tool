/**
 * QuestionCard - Single question representation in canvas
 */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getQuestionType } from "./questionTypes";

export default function QuestionCard({ question, isSelected, onSelect, onDelete, onDuplicate }) {
  const questionType = getQuestionType(question.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-4 rounded-lg border-2 bg-white dark:bg-slate-800
        transition-all duration-200 cursor-pointer
        ${isDragging ? "opacity-50 shadow-lg z-50" : ""}
        ${isSelected ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}
      `}
      onClick={() => onSelect(question.id)}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>

      {/* Content */}
      <div className="ml-6 mr-16">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{questionType?.icon || "❓"}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{questionType?.label || question.type}</span>
          {question.required && <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Pflicht</span>}
          {question.show_if && <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Logik</span>}
        </div>
        <p className="text-2xl font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{question.text || <span className="italic text-slate-400 font-normal">Keine Frage eingegeben</span>}</p>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(question.id);
          }}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Duplizieren"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question.id);
          }}
          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
          title="Löschen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
