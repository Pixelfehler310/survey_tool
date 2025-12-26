/**
 * Question Types Registry
 * 
 * Central registry for all question types.
 * Extended by plugins via pluginRegistry.
 */

import { getPluginQuestionTypes, getPluginQuestionType, isPluginType, getPluginDefaults } from '../../lib/pluginRegistry';

// Core question type definitions
export const coreQuestionTypes = {
    text: {
        type: 'text',
        label: 'Kurztext',
        icon: '✏️',
        description: 'Einzeilige Texteingabe',
        category: 'basic',
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
        category: 'basic',
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
        category: 'choice',
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
        category: 'choice',
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
        category: 'choice',
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
        category: 'rating',
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
        category: 'advanced',
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
        category: 'advanced',
        defaults: {
            text: 'hidden_field',
            required: false,
        },
    },
};

// Get all question types (core + plugins)
export const getQuestionTypeList = () => {
    const core = Object.values(coreQuestionTypes);
    const plugins = getPluginQuestionTypes();
    return [...core, ...plugins];
};

// Get a specific question type (core or plugin)
export const getQuestionType = (type) => {
    return coreQuestionTypes[type] || getPluginQuestionType(type) || null;
};

// Check if a type exists
export const hasQuestionType = (type) => {
    return type in coreQuestionTypes || isPluginType(type);
};

// Get default props for a question type
export const getQuestionDefaults = (type) => {
    const qt = coreQuestionTypes[type];
    if (qt) return { ...qt.defaults, type };

    if (isPluginType(type)) {
        return getPluginDefaults(type);
    }

    return { type, text: '', required: false };
};

// Legacy export for compatibility
export const questionTypes = coreQuestionTypes;

export default questionTypes;

