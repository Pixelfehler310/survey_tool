/**
 * Survey Store - Zustand state management for surveys
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getVisibleQuestions, validateAnswer, serializeAnswers } from '../lib/surveyEngine';

const useSurveyStore = create(
    persist(
        (set, get) => ({
            // Survey definition
            survey: null,

            // Current state
            answers: {},
            currentIndex: 0,

            // UI state
            isLoading: false,
            isSubmitting: false,
            error: null,
            validationError: null,

            // Timing
            startedAt: null,

            // Computed: Get visible questions
            getVisibleQuestions: () => {
                const { survey, answers } = get();
                return getVisibleQuestions(survey, answers);
            },

            // Computed: Get current question
            getCurrentQuestion: () => {
                const visibleQuestions = get().getVisibleQuestions();
                const { currentIndex } = get();
                return visibleQuestions[currentIndex] || null;
            },

            // Computed: Get current answer
            getCurrentAnswer: () => {
                const question = get().getCurrentQuestion();
                if (!question) return undefined;
                return get().answers[question.id];
            },

            // Computed: Check if can go back
            canGoBack: () => {
                const { survey, currentIndex } = get();
                return survey?.settings?.allow_back !== false && currentIndex > 0;
            },

            // Computed: Check if on last question
            isLastQuestion: () => {
                const visibleQuestions = get().getVisibleQuestions();
                const { currentIndex } = get();
                return currentIndex >= visibleQuestions.length - 1;
            },

            // Computed: Get progress percentage
            getProgress: () => {
                const { survey, currentIndex } = get();
                if (!survey?.questions || survey.questions.length === 0) return 0;

                // Filter out hidden questions from the total count logic to avoid starting > 0%
                const visibleInDef = survey.questions.filter(q => q.type !== 'hidden');
                const totalQuestions = visibleInDef.length;

                if (totalQuestions === 0) return 100;

                // Get the currently displayed question
                const visibleQuestions = get().getVisibleQuestions();
                const currentQuestion = visibleQuestions[currentIndex];

                // If we are past the last question or completed
                if (!currentQuestion) return 100;

                // Find index of this question in the filtered definition list
                const absoluteIndex = visibleInDef.findIndex(q => q.id === currentQuestion.id);

                if (absoluteIndex === -1) return 0;

                // Calculate percentage
                return Math.round((absoluteIndex / totalQuestions) * 100);
            },

            // Actions
            setSurvey: (survey) => set({
                survey,
                startedAt: new Date().toISOString(),
                error: null,
            }),

            setAnswer: (questionId, value) => set((state) => ({
                answers: { ...state.answers, [questionId]: value },
                validationError: null,
            })),

            goToNext: () => {
                const { currentIndex } = get();
                const question = get().getCurrentQuestion();
                const answer = get().getCurrentAnswer();

                // Validate current answer
                if (question) {
                    const validation = validateAnswer(question, answer);
                    if (!validation.valid) {
                        set({ validationError: validation.error });
                        return false;
                    }
                }

                const visibleQuestions = get().getVisibleQuestions();
                if (currentIndex < visibleQuestions.length - 1) {
                    set({ currentIndex: currentIndex + 1, validationError: null });
                    return true;
                }

                return false;
            },

            goToPrevious: () => {
                const { currentIndex } = get();
                if (currentIndex > 0) {
                    set({ currentIndex: currentIndex - 1, validationError: null });
                    return true;
                }
                return false;
            },

            goToQuestion: (index) => {
                const visibleQuestions = get().getVisibleQuestions();
                if (index >= 0 && index < visibleQuestions.length) {
                    set({ currentIndex: index, validationError: null });
                }
            },

            setLoading: (isLoading) => set({ isLoading }),
            setSubmitting: (isSubmitting) => set({ isSubmitting }),
            setError: (error) => set({ error }),

            // Get serialized data for submission
            getSubmissionData: () => {
                const { survey, answers, startedAt } = get();

                return {
                    survey_id: survey?.id,
                    variant_id: survey?.variant_id || null,  // Include variant_id for A/B testing
                    answers: serializeAnswers(answers, survey),
                    meta: {},
                    started_at: startedAt,
                };
            },

            // Reset store
            reset: () => set({
                survey: null,
                answers: {},
                currentIndex: 0,
                isLoading: false,
                isSubmitting: false,
                error: null,
                validationError: null,
                startedAt: null,
            }),

            // Clear saved progress for a survey
            clearProgress: (surveyId) => {
                const { survey } = get();
                if (survey?.id === surveyId) {
                    set({
                        answers: {},
                        currentIndex: 0,
                        validationError: null,
                    });
                }
            },
        }),
        {
            name: 'survey-storage',
            storage: createJSONStorage(() => ({
                getItem: (name) => {
                    // Check session first, then local
                    const fromSession = sessionStorage.getItem(name);
                    if (fromSession) return JSON.parse(fromSession);

                    const fromLocal = localStorage.getItem(name);
                    return fromLocal ? JSON.parse(fromLocal) : null;
                },
                setItem: (name, value) => {
                    // Inspect the state to find the setting
                    // value structure is { state: { survey: { settings: { storage: '...' } } }, version: 0 }
                    const settings = value?.state?.survey?.settings;
                    const mode = settings?.storage || 'local';

                    if (mode === 'none') {
                        // Memory only: clear potential leftovers from other modes
                        sessionStorage.removeItem(name);
                        localStorage.removeItem(name);
                        return;
                    }

                    if (mode === 'session') {
                        sessionStorage.setItem(name, JSON.stringify(value));
                        // Cleanup local if it exists to prevent "ghost" data
                        localStorage.removeItem(name);
                    } else {
                        localStorage.setItem(name, JSON.stringify(value));
                        // Cleanup session if it exists
                        sessionStorage.removeItem(name);
                    }
                },
                removeItem: (name) => {
                    sessionStorage.removeItem(name);
                    localStorage.removeItem(name);
                },
            })),
            partialize: (state) => ({
                // Only persist answers and current index
                answers: state.answers,
                currentIndex: state.currentIndex,
                startedAt: state.startedAt,
                // Store survey ID for partial save matching
                surveyId: state.survey?.id,
                // We must persist the survey settings minimally (or get them) to know the storage mode on reload?
                // Actually, the whole survey object is needed in the state to check settings in setItem, 
                // but we only persist partial data. 
                // WAIT: If we only persist partial data, 'value.state.survey' in setItem will be undefined 
                // if we don't include it in partialize!

                // However, the survey definition is usually re-fetched on mount.
                // But `setItem` is called whenever state changes.
                // If we don't persist 'survey', `value.state.survey` will be missing in the object passed to setItem.

                // Fix: We need to include the settings in the persisted state OR ensure the store has them.
                // Let's include survey.settings in the persisted part so the adapter can read it.
                survey: {
                    id: state.survey?.id,
                    settings: state.survey?.settings
                }
            }),
        }
    )
);

export default useSurveyStore;
