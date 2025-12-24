/**
 * Survey Store - Zustand state management for surveys
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
            partialize: (state) => ({
                // Only persist answers and current index
                answers: state.answers,
                currentIndex: state.currentIndex,
                startedAt: state.startedAt,
                // Store survey ID for partial save matching
                surveyId: state.survey?.id,
            }),
        }
    )
);

export default useSurveyStore;
