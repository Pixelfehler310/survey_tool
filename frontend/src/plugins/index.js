/**
 * Plugin Loader
 * 
 * Auto-loads and registers all built-in plugins.
 * Import this file early in app initialization.
 */

import { registerPlugin } from '../lib/pluginRegistry';

// Built-in plugins
import npsPlugin from './nps';

// Register all built-in plugins
export function loadBuiltinPlugins() {
    registerPlugin(npsPlugin);
}

// Auto-load on import
loadBuiltinPlugins();

export { registerPlugin };
