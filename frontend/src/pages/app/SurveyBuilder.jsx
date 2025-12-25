/**
 * SurveyBuilder - Main survey builder page
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DndContext, DragOverlay, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

import useAdminStore from "../../store/adminStore";
import useBuilderStore from "../../store/builderStore";
import QuestionLibrary from "../../components/builder/QuestionLibrary";
import QuestionCard from "../../components/builder/QuestionCard";
import QuestionEditor from "../../components/builder/QuestionEditor";
import SettingsPanel from "../../components/builder/SettingsPanel";
import { getQuestionType } from "../../components/builder/questionTypes";
import ThemeToggle from "../../components/ThemeToggle";

// Droppable canvas wrapper
function CanvasDropZone({ children, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop-zone" });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 p-6 overflow-y-auto
        ${isEmpty ? "flex items-center justify-center" : ""}
      `}
    >
      {isEmpty ? (
        <div
          className={`
          w-full h-full flex items-center justify-center
          border-2 border-dashed rounded-xl transition-colors
          ${isOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-600"}
        `}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function SurveyBuilder() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authFetch, logout } = useAdminStore();
  const { survey, selectedQuestionId, isDirty, isSaving, error, setSurvey, addQuestion, removeQuestion, duplicateQuestion, reorderQuestions, selectQuestion, saveSurvey, reset } = useBuilderStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load survey
  useEffect(() => {
    async function loadSurvey() {
      if (!surveyId) return;

      try {
        const response = await authFetch(`/api/v1/app/surveys/${surveyId}`);
        if (!response.ok) throw new Error("Survey not found");

        const data = await response.json();
        setSurvey(data);
      } catch (err) {
        console.error("Failed to load survey:", err);
        navigate("/app/dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    loadSurvey();
    return () => reset();
  }, [surveyId]);

  // DnD handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // New question from library
    if (active.data.current?.isNew && active.data.current?.type) {
      addQuestion(active.data.current.type);
      return;
    }

    // Reorder
    if (active.id !== over.id) {
      const oldIndex = survey.questions.findIndex((q) => q.id === active.id);
      const newIndex = survey.questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

  const handleSave = async () => {
    const success = await saveSurvey(authFetch);
    if (success) {
      // Show success feedback
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Dragging preview
  const activeQuestion = activeId ? survey.questions.find((q) => q.id === activeId) : null;
  const activeType = activeId?.startsWith("library-") ? getQuestionType(activeId.replace("library-", "")) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Link to="/app/dashboard" className="text-indigo-600 hover:text-indigo-700">
            ← Zurück
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <h1 className="font-semibold truncate max-w-md">{survey.title}</h1>
          {isDirty && <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded">Ungespeichert</span>}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(true)} className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            ⚙️ Einstellungen
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Speichern..." : "Speichern"}
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
            Abmelden
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-600 text-sm">{error}</div>}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Left: Question Library */}
          <QuestionLibrary />

          {/* Center: Canvas */}
          <CanvasDropZone isEmpty={survey.questions.length === 0}>
            {survey.questions.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Starten Sie Ihre Umfrage</h3>
                <p className="text-sm text-slate-500">Ziehen Sie Fragetypen aus der linken Leiste hierher</p>
              </div>
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
          </CanvasDropZone>

          {/* Right: Question Editor */}
          <QuestionEditor />

          {/* Drag Overlay */}
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

      {/* Settings Modal */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
