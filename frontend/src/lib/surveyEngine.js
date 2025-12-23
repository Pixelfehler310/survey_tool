/**
 * Survey Engine - Core logic for survey state management
 */

import { evaluateExpression } from './expressionParser';

/**
 * Get list of visible questions based on current answers
 * 
 * @param {object} survey - The survey definition
 * @param {object} answers - Current answer values
 * @returns {array} - Array of visible questions
 */
export function getVisibleQuestions(survey, answers = {}) {
    if (!survey?.questions) return [];

    const context = { answers };

    return survey.questions.filter(question => {
        // Hidden fields are never shown (they're auto-filled from URL params)
        if (question.type === "hidden") return false;

        // If no show_if condition, always show
        if (!question.show_if) return true;

        // Evaluate the show_if condition
        return evaluateExpression(question.show_if, context);
    });
}

/**
 * Find the index to skip to based on skip_to conditions
 * 
 * @param {object} question - Current question
 * @param {object} answers - Current answer values
 * @param {array} allQuestions - All questions in the survey
 * @returns {number|null} - Index to skip to, or null if no skip
 */
export function getSkipToIndex(question, answers, allQuestions) {
    if (!question.skip_to || !question.if) return null;

    const context = { answers };

    if (evaluateExpression(question.if, context)) {
        const skipToIndex = allQuestions.findIndex(q => q.id === question.skip_to);
        if (skipToIndex !== -1) {
            return skipToIndex;
        }
    }

    return null;
}

/**
 * Validate an answer against question requirements
 * 
 * @param {object} question - The question definition
 * @param {any} value - The answer value
 * @returns {object} - { valid: boolean, error?: string }
 */
export function validateAnswer(question, value) {
    // Check required
    if (question.required) {
        if (value === undefined || value === null || value === '') {
            return { valid: false, error: 'Diese Frage muss beantwortet werden.' };
        }

        // Check for empty arrays (checkbox)
        if (Array.isArray(value) && value.length === 0) {
            return { valid: false, error: 'Bitte wähle mindestens eine Option.' };
        }
    }

    // Type-specific validation
    switch (question.type) {
        case 'scale': {
            const config = question.config || {};
            const numValue = Number(value);

            if (value !== undefined && value !== null && value !== '') {
                if (config.min !== undefined && numValue < config.min) {
                    return { valid: false, error: `Wert muss mindestens ${config.min} sein.` };
                }
                if (config.max !== undefined && numValue > config.max) {
                    return { valid: false, error: `Wert darf maximal ${config.max} sein.` };
                }
            }
            break;
        }

        case 'checkbox': {
            const config = question.config || {};

            if (Array.isArray(value)) {
                if (config.minSelections && value.length < config.minSelections) {
                    return { valid: false, error: `Bitte wähle mindestens ${config.minSelections} Optionen.` };
                }
                if (config.maxSelections && value.length > config.maxSelections) {
                    return { valid: false, error: `Bitte wähle maximal ${config.maxSelections} Optionen.` };
                }
            }
            break;
        }

        case 'text':
        case 'textarea': {
            const config = question.config || {};
            const strValue = String(value || '');

            if (config.minLength && strValue.length < config.minLength) {
                return { valid: false, error: `Mindestens ${config.minLength} Zeichen erforderlich.` };
            }
            if (config.maxLength && strValue.length > config.maxLength) {
                return { valid: false, error: `Maximal ${config.maxLength} Zeichen erlaubt.` };
            }
            break;
        }
    }

    return { valid: true };
}

/**
 * Calculate progress percentage
 * 
 * @param {number} currentIndex - Current question index
 * @param {number} totalQuestions - Total number of visible questions
 * @returns {number} - Progress percentage (0-100)
 */
export function calculateProgress(currentIndex, totalQuestions) {
    if (totalQuestions === 0) return 0;
    return Math.round((currentIndex / totalQuestions) * 100);
}

/**
 * Serialize answers for API submission
 * 
 * @param {object} answers - Raw answer values
 * @param {object} survey - The survey definition
 * @returns {object} - Cleaned answers ready for submission
 */
export function serializeAnswers(answers, survey) {
    const serialized = {};

    // Only include answers for questions that exist in the survey
    const questionIds = new Set(survey.questions.map(q => q.id));

    for (const [key, value] of Object.entries(answers)) {
        if (questionIds.has(key) && value !== undefined && value !== null && value !== '') {
            serialized[key] = value;
        }
    }

    return serialized;
}

/**
 * Load survey from API or static file
 * 
 * @param {string} surveyId - The survey ID
 * @returns {Promise<object>} - The survey definition
 */
export async function loadSurvey(surveyId) {
    try {
        const response = await fetch(`/api/v1/surveys/${surveyId}`);

        if (!response.ok) {
            throw new Error(`Survey not found: ${surveyId}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to load survey:', error);
        throw error;
    }
}

/**
 * Submit survey response to API
 * 
 * @param {object} data - The response data
 * @returns {Promise<object>} - The created response
 */
export async function submitResponse(data) {
    const response = await fetch('/api/v1/responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to submit response');
    }

    return await response.json();
}

/**
 * Generate a simple fingerprint for duplicate prevention
 * 
 * @returns {string} - A fingerprint string
 */
export function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('survey-fingerprint', 2, 2);

    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
    ];

    // Simple hash
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
}
