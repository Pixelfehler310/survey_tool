# Survey Builder

The no-code visual editor for creating surveys.

## Overview

The Builder has three main panels:

```
┌──────────────┬────────────────────────┬──────────────┐
│   Question   │                        │   Question   │
│   Library    │       Canvas           │    Editor    │
│              │                        │              │
│  (Drag from  │   (Drop & arrange)     │  (Configure) │
│   here)      │                        │              │
└──────────────┴────────────────────────┴──────────────┘
```

---

## Question Library (Left Panel)

Drag question types onto the canvas.

### Basic

| Type        | Description            |
| ----------- | ---------------------- |
| ✏️ Kurztext | Single-line text input |
| 📝 Langtext | Multi-line textarea    |

### Choice

| Type               | Description                     |
| ------------------ | ------------------------------- |
| ⭕ Einzelauswahl   | Radio buttons, one selection    |
| ☑️ Mehrfachauswahl | Checkboxes, multiple selections |
| 📋 Dropdown        | Select from list                |

### Rating

| Type     | Description               |
| -------- | ------------------------- |
| ⭐ Skala | Numeric scale (e.g., 1-5) |

### Advanced

| Type         | Description               |
| ------------ | ------------------------- |
| 🔢 Ranking   | Drag to reorder options   |
| 👁️‍🗨️ Versteckt | Hidden field (URL params) |
| 📊 NPS Score | Net Promoter Score (0-10) |

---

## Canvas (Center)

### Adding Questions

1. **Drag** a question type from the library
2. **Drop** onto the canvas
3. Question appears with default text

### Reordering

- Drag questions by the handle (≡) on the left
- Drop at desired position
- Order determines survey flow

### Empty State

If no questions exist:

- "Ziehen Sie Fragen hierher" message
- Drop zone is highlighted on drag

---

## Question Editor (Right Panel)

Click a question to configure it.

### Common Settings

| Field           | Description                                |
| --------------- | ------------------------------------------ |
| **Fragetext**   | The question text displayed to respondents |
| **Pflichtfeld** | Toggle: must be answered to continue       |
| **Frage-ID**    | Unique identifier (used in expressions)    |

### Type-Specific Settings

#### Radio / Checkbox / Dropdown

- **Optionen**: Add, edit, remove choices
- Each option has a **value** (internal) and **label** (displayed)
- Click "➕ Option hinzufügen" to add more

#### Scale

| Setting   | Description                            |
| --------- | -------------------------------------- |
| Min       | Starting value (default: 1)            |
| Max       | Ending value (default: 5)              |
| Min Label | Text under min (e.g., "Sehr schlecht") |
| Max Label | Text under max (e.g., "Sehr gut")      |

#### NPS (Plugin)

| Setting    | Description                      |
| ---------- | -------------------------------- |
| Low Label  | "Überhaupt nicht wahrscheinlich" |
| High Label | "Sehr wahrscheinlich"            |

---

## Conditional Logic

Show questions based on previous answers.

### Adding Logic

1. Click question to select
2. Scroll to **Bedingte Logik** section
3. Click "+ Bedingte Logik hinzufügen"
4. Build condition with dropdowns

### Visual Builder

```
┌─────────────────────────────────────────────────────┐
│ Diese Frage anzeigen, wenn:                         │
│                                                     │
│ [Frage auswählen ▼] [== ▼] [Wert eingeben    ]  ✕  │
│                                                     │
│                      UND                            │
│                                                     │
│ [Frage auswählen ▼] [>= ▼] [18              ]  ✕  │
│                                                     │
│        + UND Bedingung hinzufügen                   │
└─────────────────────────────────────────────────────┘
```

### Code Mode

Switch to **Code** tab for manual expressions:

```
answers.satisfaction <= 2 and answers.category == 'support'
```

See [Expression Language](./05-expression-language.md) for syntax.

---

## Survey Settings

Click ⚙️ **Einstellungen** in the header.

### General Tab

| Setting             | Description                            |
| ------------------- | -------------------------------------- |
| Titel               | Survey title                           |
| Zurück-Navigation   | Allow going back to previous questions |
| Fortschrittsanzeige | Show progress bar                      |
| CAPTCHA             | Enable Cloudflare Turnstile            |
| Duplikat-Prävention | none / client / server                 |
| Layout-Modus        | paged / scroll-reveal / scroll-all     |

### Fun Mode Tab

Fun Mode is an alternate game-style presentation for paged surveys. It uses the same questions, validation, and submission flow as the normal paged layout.

| Setting                       | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| Fun Mode aktivieren           | Enables the dialogue scene when layout is paged  |
| Teilnehmer können ausschalten | Adds a participant control to return to paged UI |
| Texttempo                     | slow / normal / fast typewriter preset           |
| Zeichen pro Sekunde           | Numeric typewriter speed stored in JSON          |
| Klick zeigt ganzen Text       | Click/tap dialogue box to reveal full text       |
| Antworten erst nach Text      | Shows answer controls after text reveal          |
| Charakter                     | Character preset id                              |
| Standardausdruck              | Stored expression name for the character         |
| Antwortreaktion               | Animation after answers change                   |
| Endanimation                  | Stored completion animation name                 |

Fun Mode is only active when **Layout-Modus** is `paged`. If the layout is `scroll-reveal` or `scroll-all`, the survey uses the selected scroll layout instead.

### Branding Tab

| Setting     | Description          |
| ----------- | -------------------- |
| Logo URL    | Image URL for header |
| Primärfarbe | Brand color (hex)    |
| Schriftart  | Custom font family   |

### Dankeseite Tab

| Setting   | Description       |
| --------- | ----------------- |
| Titel     | "Vielen Dank!"    |
| Nachricht | Thank you message |
| CTA Text  | Button text       |
| CTA URL   | Redirect URL      |

---

## Preview

Click 👁️ **Vorschau** in the header.

### Features

- Live preview of current survey
- Device toggle: Desktop / Tablet / Mobile
- Answers not submitted (preview mode)
- Shows "Vorschau-Modus" badge
- Expands the desktop/tablet frame when Fun Mode is enabled

### Device Widths

| Device  | Width |
| ------- | ----- |
| Desktop | 100%  |
| Tablet  | 768px |
| Mobile  | 375px |

---

## Layout Modes

### Paged (Default)

- One question per screen
- Next/Back buttons
- Classic survey experience
- Supports optional Fun Mode presentation

### Scroll Reveal

- All questions in scroll view
- Next question reveals after answering
- Smooth scroll to next
- Great for shorter surveys

### Scroll All

- All questions visible from start
- Free scroll navigation
- Submit at bottom

---

## Saving

Surveys auto-save on changes. Manual save:

1. Click header area
2. Changes are sent to backend
3. Confirmation in console

---

## Keyboard Shortcuts

| Shortcut | Action                   |
| -------- | ------------------------ |
| Delete   | Remove selected question |
| Escape   | Deselect question        |

---

## Troubleshooting

### Question won't drop

- Ensure you're dropping on the canvas area
- Check if drop zone highlights on hover

### Logic not working

- Verify question IDs match
- Check expression syntax in Code mode
- Test in Preview

### Preview shows wrong content

- Save the survey
- Refresh Preview panel
