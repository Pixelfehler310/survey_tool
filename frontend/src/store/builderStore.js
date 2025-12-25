/**
 * Builder Store - Zustand store for survey builder state
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Generate unique question ID
const generateQuestionId = () => `q_${uuidv4().slice(0, 8)}`;

const useBuilderStore = create((set, get) => ({
    // Survey definition
    survey: {
        id: '',
        title: 'Neue Umfrage',
        version: '1.0.0',
        settings: {
            allow_back: true,
            show_progress: true,
            captcha: false,
            duplicate_prevention: 'none',
        },
        branding: null,
        questions: [],
    },

    // UI state
    selectedQuestionId: null,
    isDirty: false,
    isSaving: false,
    error: null,

    // ============================================================
    // Survey Actions
    // ============================================================

    setSurvey: (survey) => set({
        survey: {
            ...survey,
            // Ensure questions array exists
            questions: survey.definition?.questions || survey.questions || [],
            settings: survey.definition?.settings || survey.settings || {},
            branding: survey.definition?.branding || survey.branding || null,
        },
        isDirty: false,
        selectedQuestionId: null,
    }),

    setTitle: (title) => set((state) => ({
        survey: { ...state.survey, title },
        isDirty: true,
    })),

    setSettings: (settings) => set((state) => ({
        survey: {
            ...state.survey,
            settings: { ...state.survey.settings, ...settings },
        },
        isDirty: true,
    })),

    setBranding: (branding) => set((state) => ({
        survey: {
            ...state.survey,
            branding: { ...state.survey.branding, ...branding },
        },
        isDirty: true,
    })),

    // ============================================================
    // Question Actions
    // ============================================================

    addQuestion: (type, index = -1) => {
        const { survey } = get();
        const newQuestion = {
            id: generateQuestionId(),
            type,
            text: '',
            required: false,
            options: ['radio', 'checkbox', 'dropdown'].includes(type)
                ? [{ value: 'option1', label: 'Option 1' }]
                : undefined,
            config: type === 'scale'
                ? { min: 1, max: 5, min_label: 'Niedrig', max_label: 'Hoch' }
                : undefined,
        };

        const questions = [...survey.questions];
        if (index === -1 || index >= questions.length) {
            questions.push(newQuestion);
        } else {
            questions.splice(index, 0, newQuestion);
        }

        set({
            survey: { ...survey, questions },
            selectedQuestionId: newQuestion.id,
            isDirty: true,
        });

        return newQuestion.id;
    },

    updateQuestion: (id, updates) => set((state) => {
        // If we're changing the ID, we need to update selectedQuestionId too
        const isIdChanging = updates.id && updates.id !== id;

        return {
            survey: {
                ...state.survey,
                questions: state.survey.questions.map((q) =>
                    q.id === id ? { ...q, ...updates } : q
                ),
            },
            // Update selection if the ID is being changed
            selectedQuestionId: isIdChanging && state.selectedQuestionId === id
                ? updates.id
                : state.selectedQuestionId,
            isDirty: true,
        };
    }),

    removeQuestion: (id) => set((state) => ({
        survey: {
            ...state.survey,
            questions: state.survey.questions.filter((q) => q.id !== id),
        },
        selectedQuestionId:
            state.selectedQuestionId === id ? null : state.selectedQuestionId,
        isDirty: true,
    })),

    duplicateQuestion: (id) => {
        const { survey } = get();
        const index = survey.questions.findIndex((q) => q.id === id);
        if (index === -1) return;

        const original = survey.questions[index];
        const duplicate = {
            ...JSON.parse(JSON.stringify(original)),
            id: generateQuestionId(),
            text: `${original.text} (Kopie)`,
        };

        const questions = [...survey.questions];
        questions.splice(index + 1, 0, duplicate);

        set({
            survey: { ...survey, questions },
            selectedQuestionId: duplicate.id,
            isDirty: true,
        });
    },

    reorderQuestions: (fromIndex, toIndex) => set((state) => {
        const questions = [...state.survey.questions];
        const [removed] = questions.splice(fromIndex, 1);
        questions.splice(toIndex, 0, removed);

        return {
            survey: { ...state.survey, questions },
            isDirty: true,
        };
    }),

    // ============================================================
    // Selection
    // ============================================================

    selectQuestion: (id) => set({ selectedQuestionId: id }),

    getSelectedQuestion: () => {
        const { survey, selectedQuestionId } = get();
        return survey.questions.find((q) => q.id === selectedQuestionId) || null;
    },

    // ============================================================
    // Persistence
    // ============================================================

    saveSurvey: async (authFetch) => {
        const { survey } = get();
        set({ isSaving: true, error: null });

        try {
            // Build the definition object
            const definition = {
                id: survey.id,
                title: survey.title,
                version: survey.version || '1.0.0',
                settings: survey.settings,
                branding: survey.branding,
                questions: survey.questions,
            };

            const response = await authFetch(`/api/v1/app/surveys/${survey.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(definition),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Speichern fehlgeschlagen');
            }

            set({ isDirty: false, isSaving: false });
            return true;
        } catch (error) {
            set({ error: error.message, isSaving: false });
            return false;
        }
    },

    // ============================================================
    // Reset
    // ============================================================

    reset: () => set({
        survey: {
            id: '',
            title: 'Neue Umfrage',
            version: '1.0.0',
            settings: { allow_back: true, show_progress: true },
            branding: null,
            questions: [],
        },
        selectedQuestionId: null,
        isDirty: false,
        isSaving: false,
        error: null,
    }),
}));

export default useBuilderStore;
