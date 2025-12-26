# Plugin System

Extend the survey tool with custom question types through plugins.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Plugin Registry                    │
│   registerPlugin() → stores manifest & components   │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │   NPS   │    │ Matrix  │    │  File   │
    │  Plugin │    │ Plugin  │    │ Upload  │
    └─────────┘    └─────────┘    └─────────┘
```

---

## Creating a Plugin

### 1. Folder Structure

```
frontend/src/plugins/
└── my-plugin/
    ├── index.js          # Plugin manifest & exports
    ├── MyRenderer.jsx    # Survey-side component
    └── MyEditor.jsx      # Builder-side editor (optional)
```

### 2. Plugin Manifest (`index.js`)

```javascript
import MyRenderer from "./MyRenderer";
import MyEditor from "./MyEditor";

const myPlugin = {
  id: "my-plugin", // Unique ID
  name: "My Custom Question", // Display name
  version: "1.0.0",
  author: "Your Name",
  description: "Description of the plugin",

  questionTypes: [
    {
      type: "my-type", // Question type ID
      label: "My Question", // Label in QuestionLibrary
      icon: "🎯", // Emoji icon
      description: "Short description",
      category: "advanced", // basic, choice, rating, advanced
      defaults: {
        // Default question values
        text: "Default question text",
        required: false,
        config: {
          // Custom config fields
        },
      },
    },
  ],

  components: {
    renderer: MyRenderer, // Required: Survey renderer
    editor: MyEditor, // Optional: Builder editor
  },
};

export default myPlugin;
```

### 3. Renderer Component

The renderer displays the question in the survey:

```jsx
// MyRenderer.jsx
export default function MyRenderer({ question, value, onChange }) {
  const { config = {} } = question;

  return (
    <div className="space-y-4">
      {/* Your custom UI here */}
      <button onClick={() => onChange("selected")}>Select</button>

      {value && <p>Selected: {value}</p>}
    </div>
  );
}
```

**Props:**

| Prop       | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `question` | Object   | Full question definition |
| `value`    | any      | Current answer value     |
| `onChange` | Function | Call with new value      |

### 4. Editor Component (Optional)

The editor configures the question in the Builder:

```jsx
// MyEditor.jsx
export default function MyEditor({ question, onChange }) {
  const config = question.config || {};

  const handleConfigChange = (key, value) => {
    onChange({
      ...question,
      config: { ...config, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Custom Setting</label>
        <input type="text" value={config.customSetting || ""} onChange={(e) => handleConfigChange("customSetting", e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
      </div>
    </div>
  );
}
```

### 5. Register Plugin

Add to `frontend/src/plugins/index.js`:

```javascript
import { registerPlugin } from "../lib/pluginRegistry";
import myPlugin from "./my-plugin";

registerPlugin(myPlugin);
```

---

## Plugin API Reference

### `registerPlugin(manifest)`

Register a new plugin with the registry.

```javascript
import { registerPlugin } from "../lib/pluginRegistry";
registerPlugin(myPlugin);
```

### `getPluginRenderer(type)`

Get the renderer component for a question type.

```javascript
import { getPluginRenderer } from "../lib/pluginRegistry";
const Renderer = getPluginRenderer("nps");
```

### `getPluginEditor(type)`

Get the editor component for a question type.

```javascript
import { getPluginEditor } from "../lib/pluginRegistry";
const Editor = getPluginEditor("nps");
```

### `isPluginType(type)`

Check if a question type is from a plugin.

```javascript
import { isPluginType } from '../lib/pluginRegistry';
if (isPluginType('nps')) { ... }
```

### `getPluginQuestionTypes()`

Get all question types from plugins.

```javascript
import { getPluginQuestionTypes } from "../lib/pluginRegistry";
const types = getPluginQuestionTypes(); // Array of question type definitions
```

### `getAllPlugins()`

Get all registered plugins.

```javascript
import { getAllPlugins } from "../lib/pluginRegistry";
const plugins = getAllPlugins(); // Array of plugin manifests
```

---

## Built-in Plugin: NPS

The Net Promoter Score plugin demonstrates the pattern:

### Features

- 0-10 clickable scale
- Color coding: Red (0-6) → Yellow (7-8) → Green (9-10)
- Category labels: Kritiker / Passiv / Promoter
- Configurable endpoint labels

### Files

```
plugins/nps/
├── index.js         # Manifest
├── NPSRenderer.jsx  # 11-button scale
└── NPSEditor.jsx    # Label configuration
```

### Usage

Drag "NPS Score" from QuestionLibrary to canvas:

```json
{
  "type": "nps",
  "text": "Wie wahrscheinlich empfehlen Sie uns weiter?",
  "config": {
    "lowLabel": "Überhaupt nicht",
    "highLabel": "Sehr wahrscheinlich"
  }
}
```

---

## Best Practices

### Styling

- Use Tailwind CSS classes for consistency
- Support dark mode with `dark:` variants
- Keep UI responsive

### State

- Don't store state in the component
- Always call `onChange(newValue)` for updates
- Handle `undefined` value gracefully

### Config

- Put customizable options in `question.config`
- Provide sensible defaults
- Document config options in README

### Accessibility

- Use semantic HTML
- Add `aria-` attributes
- Support keyboard navigation

---

## Future: Plugin Marketplace

Planned features:

- Install plugins from npm
- Plugin management UI
- Plugin permissions
- Remote plugin loading
