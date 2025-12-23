import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Sortable Item Component
 */
function SortableItem({ id, label, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${
          isDragging
            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500 shadow-lg scale-[1.02] z-10"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
        }
      `}
      {...attributes}
      {...listeners}
    >
      {/* Rank Number */}
      <div
        className={`
        shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
        ${isDragging ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}
      `}
      >
        {index + 1}
      </div>

      {/* Drag Handle Icon */}
      <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>

      {/* Label */}
      <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium">{label}</span>

      {/* Drag Indicator */}
      <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );
}

/**
 * Ranking Question Component
 * Allows users to drag and drop items to rank them in order of preference.
 *
 * @param {object} question - Question definition with options
 * @param {array} value - Current ranking as array of option values
 * @param {function} onChange - Callback when ranking changes
 */
export default function RankingQuestion({ question, value, onChange }) {
  // Initialize with default order if no value
  const defaultOrder = question.options?.map((opt) => opt.value) || [];
  const [items, setItems] = useState(value || defaultOrder);

  // Sync with external value changes
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(items)) {
      setItems(value);
    }
  }, [value]);

  // Initialize value on first render if not set
  useEffect(() => {
    if (!value && defaultOrder.length > 0) {
      onChange(defaultOrder);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onChange(newItems);
    }
  };

  // Get label for an option value
  const getLabel = (optionValue) => {
    const option = question.options?.find((opt) => opt.value === optionValue);
    return option?.label || optionValue;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ziehe die Optionen in deine bevorzugte Reihenfolge (1 = am wichtigsten)</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={item} id={item} label={getLabel(item)} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
