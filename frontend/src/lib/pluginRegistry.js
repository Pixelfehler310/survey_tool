/**
 * Plugin Registry
 * 
 * Central registry for loading and managing plugins.
 * Plugins can register new question types, editors, and renderers.
 */

// Registered plugins
const plugins = new Map();

// Question type extensions from plugins
const pluginQuestionTypes = new Map();

// Custom renderers from plugins
const pluginRenderers = new Map();

// Custom editors from plugins
const pluginEditors = new Map();

/**
 * Register a plugin with the registry
 * 
 * @param {object} plugin - Plugin definition
 * @param {string} plugin.id - Unique plugin ID
 * @param {string} plugin.name - Display name
 * @param {string} plugin.version - Semantic version
 * @param {array} plugin.questionTypes - Question type definitions
 * @param {object} plugin.components - { renderer, editor } components
 */
export function registerPlugin(plugin) {
    if (!plugin?.id) {
        console.error('Plugin must have an id');
        return false;
    }

    if (plugins.has(plugin.id)) {
        console.warn(`Plugin ${plugin.id} already registered`);
        return false;
    }

    plugins.set(plugin.id, plugin);

    // Register question types
    if (plugin.questionTypes) {
        plugin.questionTypes.forEach(qt => {
            pluginQuestionTypes.set(qt.type, {
                ...qt,
                pluginId: plugin.id,
            });
        });
    }

    // Register custom renderer
    if (plugin.components?.renderer) {
        plugin.questionTypes?.forEach(qt => {
            pluginRenderers.set(qt.type, plugin.components.renderer);
        });
    }

    // Register custom editor
    if (plugin.components?.editor) {
        plugin.questionTypes?.forEach(qt => {
            pluginEditors.set(qt.type, plugin.components.editor);
        });
    }

    console.log(`Plugin registered: ${plugin.name} v${plugin.version}`);
    return true;
}

/**
 * Unregister a plugin
 */
export function unregisterPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return false;

    // Remove question types
    plugin.questionTypes?.forEach(qt => {
        pluginQuestionTypes.delete(qt.type);
        pluginRenderers.delete(qt.type);
        pluginEditors.delete(qt.type);
    });

    plugins.delete(pluginId);
    return true;
}

/**
 * Get a plugin by ID
 */
export function getPlugin(pluginId) {
    return plugins.get(pluginId) || null;
}

/**
 * Get all registered plugins
 */
export function getAllPlugins() {
    return Array.from(plugins.values());
}

/**
 * Get all question types from plugins
 */
export function getPluginQuestionTypes() {
    return Array.from(pluginQuestionTypes.values());
}

/**
 * Get plugin question type definition
 */
export function getPluginQuestionType(type) {
    return pluginQuestionTypes.get(type) || null;
}

/**
 * Check if a type is from a plugin
 */
export function isPluginType(type) {
    return pluginQuestionTypes.has(type);
}

/**
 * Get custom renderer for a question type
 */
export function getPluginRenderer(type) {
    return pluginRenderers.get(type) || null;
}

/**
 * Get custom editor for a question type
 */
export function getPluginEditor(type) {
    return pluginEditors.get(type) || null;
}

/**
 * Get default values for a plugin question type
 */
export function getPluginDefaults(type) {
    const qt = pluginQuestionTypes.get(type);
    return qt?.defaults || { type, text: '', required: false };
}

export default {
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    getAllPlugins,
    getPluginQuestionTypes,
    getPluginQuestionType,
    isPluginType,
    getPluginRenderer,
    getPluginEditor,
    getPluginDefaults,
};
