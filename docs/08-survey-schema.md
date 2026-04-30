# Survey Schema

JSON structure reference for survey definitions.

## Complete Example

```json
{
  "id": "feedback-2024",
  "title": "Customer Feedback",
  "version": "1.0.0",
  "settings": {
    "allow_back": true,
    "show_progress": true,
    "layout": "paged",
    "captcha": false,
    "duplicate_prevention": "client",
    "fun_mode": {
      "enabled": true,
      "participant_toggle": true,
      "typewriter": {
        "preset": "normal",
        "characters_per_second": 35,
        "skip_on_click": true,
        "answers_after_reveal": true
      },
      "character": {
        "preset": "default_host",
        "default_expression": "friendly",
        "answer_reaction": "happy_bounce",
        "completion_animation": "celebrate"
      }
    },
    "thank_you": {
      "title": "Vielen Dank!",
      "message": "Ihre Antworten wurden gespeichert.",
      "cta_text": "Zur Website",
      "cta_url": "https://example.com"
    }
  },
  "branding": {
    "logo_url": "https://example.com/logo.png",
    "primary_color": "#6366f1",
    "font_family": "Inter, sans-serif"
  },
  "questions": [
    {
      "id": "satisfaction",
      "type": "scale",
      "text": "Wie zufrieden sind Sie?",
      "required": true,
      "config": {
        "min": 1,
        "max": 5,
        "min_label": "Sehr unzufrieden",
        "max_label": "Sehr zufrieden"
      }
    }
  ]
}
```

---

## Top-Level Fields

| Field       | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `id`        | string | ✅       | Unique survey identifier          |
| `title`     | string | ✅       | Survey title                      |
| `version`   | string |          | Version string (default: "1.0.0") |
| `settings`  | object |          | Survey settings                   |
| `branding`  | object |          | Visual branding                   |
| `questions` | array  | ✅       | List of questions                 |

---

## Settings Object

| Field                  | Type    | Default   | Description                            |
| ---------------------- | ------- | --------- | -------------------------------------- |
| `allow_back`           | boolean | `true`    | Allow back navigation                  |
| `show_progress`        | boolean | `true`    | Show progress bar                      |
| `layout`               | string  | `"paged"` | `paged`, `scroll-reveal`, `scroll-all` |
| `captcha`              | boolean | `false`   | Enable Turnstile CAPTCHA               |
| `duplicate_prevention` | string  | `"none"`  | `none`, `client`, `server`             |
| `fun_mode`             | object  |           | Game-style dialogue presentation       |
| `thank_you`            | object  |           | Thank you page config                  |

### Fun Mode Object

Fun Mode is only active when `layout` is `paged`. It changes the survey presentation, not the answer data format.

| Field                | Type    | Default | Description                                      |
| -------------------- | ------- | ------- | ------------------------------------------------ |
| `enabled`            | boolean | `false` | Enable Fun Mode for paged surveys                |
| `participant_toggle` | boolean | `true`  | Allow participants to return to normal paged UI  |
| `typewriter`         | object  |         | Dialogue text reveal behavior                    |
| `character`          | object  |         | Character preset and animation names             |

### Fun Mode Typewriter Object

| Field                   | Type    | Default    | Description                                 |
| ----------------------- | ------- | ---------- | ------------------------------------------- |
| `preset`                | string  | `normal`   | `slow`, `normal`, or `fast`                 |
| `characters_per_second` | number  | `35`       | Static reveal speed                         |
| `skip_on_click`         | boolean | `true`     | Click/tap dialogue to reveal all text       |
| `answers_after_reveal`  | boolean | `true`     | Show answer controls after text is revealed |

### Fun Mode Character Object

| Field                  | Type   | Default        | Description                                |
| ---------------------- | ------ | -------------- | ------------------------------------------ |
| `preset`               | string | `default_host` | Character preset id                        |
| `default_expression`   | string | `friendly`     | Stored expression name                     |
| `answer_reaction`      | string | `happy_bounce` | Answer-change animation, or `none`         |
| `completion_animation` | string | `celebrate`    | Completion animation name for future flows |

### Thank You Object

| Field            | Type   | Description           |
| ---------------- | ------ | --------------------- |
| `title`          | string | Heading text          |
| `message`        | string | Body message          |
| `cta_text`       | string | Button text           |
| `cta_url`        | string | Button link           |
| `redirect_delay` | number | Auto-redirect seconds |

---

## Branding Object

| Field           | Type   | Description                 |
| --------------- | ------ | --------------------------- |
| `logo_url`      | string | URL to logo image           |
| `primary_color` | string | Hex color (e.g., `#6366f1`) |
| `font_family`   | string | CSS font-family             |

---

## Question Object

| Field         | Type    | Required | Description            |
| ------------- | ------- | -------- | ---------------------- |
| `id`          | string  | ✅       | Unique question ID     |
| `type`        | string  | ✅       | Question type          |
| `text`        | string  | ✅       | Question text          |
| `required`    | boolean |          | Must be answered       |
| `description` | string  |          | Helper text            |
| `show_if`     | string  |          | Conditional expression |
| `skip_to`     | string  |          | Skip to question ID    |
| `options`     | array   |          | For choice questions   |
| `config`      | object  |          | Type-specific config   |

---

## Question Types

### text

Single-line text input.

```json
{
  "id": "name",
  "type": "text",
  "text": "Wie heißen Sie?"
}
```

### textarea

Multi-line text input.

```json
{
  "id": "comments",
  "type": "textarea",
  "text": "Weitere Kommentare?"
}
```

### radio

Single selection from options.

```json
{
  "id": "gender",
  "type": "radio",
  "text": "Geschlecht",
  "options": [
    { "value": "male", "label": "Männlich" },
    { "value": "female", "label": "Weiblich" },
    { "value": "other", "label": "Divers" }
  ]
}
```

### checkbox

Multiple selection from options.

```json
{
  "id": "interests",
  "type": "checkbox",
  "text": "Interessen (Mehrfachauswahl)",
  "options": [
    { "value": "sports", "label": "Sport" },
    { "value": "music", "label": "Musik" },
    { "value": "travel", "label": "Reisen" }
  ]
}
```

### dropdown

Select from dropdown list.

```json
{
  "id": "country",
  "type": "dropdown",
  "text": "Land",
  "options": [
    { "value": "DE", "label": "Deutschland" },
    { "value": "AT", "label": "Österreich" },
    { "value": "CH", "label": "Schweiz" }
  ]
}
```

### scale

Numeric scale with labels.

```json
{
  "id": "rating",
  "type": "scale",
  "text": "Bewerten Sie uns",
  "config": {
    "min": 1,
    "max": 10,
    "min_label": "Schlecht",
    "max_label": "Ausgezeichnet"
  }
}
```

### ranking

Drag to reorder options.

```json
{
  "id": "priorities",
  "type": "ranking",
  "text": "Sortieren Sie nach Wichtigkeit",
  "options": [
    { "value": "price", "label": "Preis" },
    { "value": "quality", "label": "Qualität" },
    { "value": "service", "label": "Service" }
  ]
}
```

### hidden

Auto-filled from URL parameters.

```json
{
  "id": "utm_source",
  "type": "hidden",
  "text": "utm_source"
}
```

**URL**: `?utm_source=google` → value is `"google"`

### nps (Plugin)

Net Promoter Score 0-10.

```json
{
  "id": "nps",
  "type": "nps",
  "text": "Würden Sie uns weiterempfehlen?",
  "config": {
    "lowLabel": "Überhaupt nicht",
    "highLabel": "Sehr wahrscheinlich"
  }
}
```

---

## Option Object

For radio, checkbox, dropdown:

| Field   | Type   | Description             |
| ------- | ------ | ----------------------- |
| `value` | string | Internal value (stored) |
| `label` | string | Display text            |

---

## Config Objects

### Scale Config

| Field       | Type   | Default | Description     |
| ----------- | ------ | ------- | --------------- |
| `min`       | number | 1       | Minimum value   |
| `max`       | number | 5       | Maximum value   |
| `min_label` | string |         | Label under min |
| `max_label` | string |         | Label under max |

### NPS Config

| Field       | Type   | Description  |
| ----------- | ------ | ------------ |
| `lowLabel`  | string | Label for 0  |
| `highLabel` | string | Label for 10 |

---

## Validation

The backend validates surveys using Pydantic schemas:

- `backend/app/schemas/survey.py`

Invalid surveys return 422 Unprocessable Entity.
