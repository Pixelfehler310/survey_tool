/**
 * BuilderCanvas - Main editing area with drag-and-drop
 */

import React from "react";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import useBuilderStore from "../../store/builderStore";
import QuestionCard from "./QuestionCard";
import { getQuestionType } from "./questionTypes";

function DropZone({ isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop-zone" });

  if (!isEmpty) return null;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 flex items-center justify-center
        border-2 border-dashed rounded-xl
        transition-colors duration-200
        ${isOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-600"}
      `}
    >
      <div className="text-center p-8">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Starten Sie Ihre Umfrage</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ziehen Sie Fragetypen hierher oder klicken Sie auf einen Typ</p>
      </div>
    </div>
  );
}

export default function BuilderCanvas() {
  const { survey, selectedQuestionId, addQuestion, removeQuestion, duplicateQuestion, reorderQuestions, selectQuestion } = useBuilderStore();

  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Dropping a new question from library
    if (active.data.current?.isNew && active.data.current?.type) {
      addQuestion(active.data.current.type);
      return;
    }

    // Reordering existing questions
    if (active.id !== over.id) {
      const oldIndex = survey.questions.findIndex((q) => q.id === active.id);
      const newIndex = survey.questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

  const activeQuestion = activeId ? survey.questions.find((q) => q.id === activeId) : null;

  const activeType = activeId?.startsWith("library-") ? getQuestionType(activeId.replace("library-", "")) : null;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {survey.questions.length === 0 ? (
          <DropZone isEmpty={true} />
        ) : (
          <SortableContext items={survey.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="max-w-3xl mx-auto space-y-3">
              {survey.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={selectQuestion}
                  onDelete={removeQuestion}
                  onDuplicate={duplicateQuestion}
                />
              ))}
            </div>
          </SortableContext>
        )}

        <DragOverlay>
          {activeQuestion && (
            <div className="p-4 rounded-lg border-2 border-indigo-500 bg-white dark:bg-slate-800 shadow-xl opacity-90">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getQuestionType(activeQuestion.type)?.icon}</span>
                <span className="text-sm">{activeQuestion.text || "Keine Frage"}</span>
              </div>
            </div>
          )}
          {activeType && (
            <div className="p-4 rounded-lg border-2 border-indigo-500 bg-white dark:bg-slate-800 shadow-xl opacity-90">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeType.icon}</span>
                <span className="text-sm font-medium">{activeType.label}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
