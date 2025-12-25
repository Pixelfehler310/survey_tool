/**
 * Question Types Registry
 * 
 * Central registry for all question types.
 * Designed to be extended by plugins in the future.
 */

// Question type definitions
export const questionTypes = {
    text: {
        type: 'text',
        label: 'Kurztext',
        icon: '✏️',
        description: 'Einzeilige Texteingabe',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
        },
    },
    textarea: {
        type: 'textarea',
        label: 'Langtext',
        icon: '📝',
        description: 'Mehrzeilige Texteingabe',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
        },
    },
    radio: {
        type: 'radio',
        label: 'Einzelauswahl',
        icon: '⭕',
        description: 'Eine Option auswählen',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
            ],
        },
    },
    checkbox: {
        type: 'checkbox',
        label: 'Mehrfachauswahl',
        icon: '☑️',
        description: 'Mehrere Optionen auswählen',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
            ],
        },
    },
    dropdown: {
        type: 'dropdown',
        label: 'Dropdown',
        icon: '📋',
        description: 'Auswahl aus Liste',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
            ],
        },
    },
    scale: {
        type: 'scale',
        label: 'Skala',
        icon: '⭐',
        description: 'Bewertungsskala',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
            config: {
                min: 1,
                max: 5,
                min_label: 'Niedrig',
                max_label: 'Hoch',
            },
        },
    },
    ranking: {
        type: 'ranking',
        label: 'Ranking',
        icon: '🔢',
        description: 'Optionen sortieren',
        defaults: {
            text: 'Ihre Frage hier...',
            required: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
            ],
        },
    },
    hidden: {
        type: 'hidden',
        label: 'Versteckt',
        icon: '👁️‍🗨️',
        description: 'Verstecktes Feld',
        defaults: {
            text: 'hidden_field',
            required: false,
        },
    },
};

// Get all question types as array (for iteration)
export const getQuestionTypeList = () => Object.values(questionTypes);

// Get a specific question type
export const getQuestionType = (type) => questionTypes[type] || null;

// Check if a type exists
export const hasQuestionType = (type) => type in questionTypes;

// Get default props for a question type
export const getQuestionDefaults = (type) => {
    const qt = questionTypes[type];
    return qt ? { ...qt.defaults, type } : { type, text: '', required: false };
};

/**
 * Future Plugin API:
 * 
 * registerQuestionType(definition) - Add a new question type
 * unregisterQuestionType(type) - Remove a question type
 * 
 * Plugins would call:
 * import { registerQuestionType } from './questionTypes';
 * registerQuestionType({
 *   type: 'nps',
 *   label: 'Net Promoter Score',
 *   icon: '📊',
 *   editor: NPSEditor,
 *   renderer: NPSRenderer,
 *   defaults: {...}
 * });
 */

export default questionTypes;
