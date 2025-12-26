/**
 * NPS (Net Promoter Score) Plugin
 * 
 * Adds NPS question type with 0-10 scale and color coding.
 */

import NPSRenderer from './NPSRenderer';
import NPSEditor from './NPSEditor';

const npsPlugin = {
    id: 'nps',
    name: 'Net Promoter Score',
    version: '1.0.0',
    author: 'Survey Tool',
    description: 'NPS question type with 0-10 scale and promoter classification',

    questionTypes: [
        {
            type: 'nps',
            label: 'NPS Score',
            icon: '📊',
            description: 'Net Promoter Score (0-10)',
            category: 'advanced',
            defaults: {
                text: 'Wie wahrscheinlich ist es, dass Sie uns einem Freund oder Kollegen weiterempfehlen?',
                required: true,
                config: {
                    lowLabel: 'Überhaupt nicht wahrscheinlich',
                    highLabel: 'Sehr wahrscheinlich',
                },
            },
        },
    ],

    components: {
        renderer: NPSRenderer,
        editor: NPSEditor,
    },
};

export default npsPlugin;
export { NPSRenderer, NPSEditor };
