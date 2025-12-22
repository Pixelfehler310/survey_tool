# Survey Engine – Anforderungsdokument

> Ein schlankes, JSON-gesteuertes Open-Source Umfrage-Tool mit Expression Language für Logik-Branching.

## Projektziele

1. **Effizienz:** 40+ Fragen in Minuten statt Stunden einpflegen
2. **Wiederverwendbarkeit:** Ein Tool für alle zukünftigen Surveys
3. **Open Source:** Unabhängig, self-hostable, keine Vendor-Lock-ins
4. **Wissenschaftlich:** Unterstützt Validation- und Marketing-Phasen (Hybrid Survey Methodik)

---

## Tech Stack

### Frontend

| Komponente | Technologie                    | Begründung                       |
| ---------- | ------------------------------ | -------------------------------- |
| Framework  | **React + Vite**               | Schnelle Entwicklung, Hot Reload |
| Styling    | **Vanilla CSS** oder Tailwind  | Flexibel, keine Abhängigkeiten   |
| State      | **React Context** oder Zustand | Einfaches State Management       |
| Build      | **Vite**                       | Schnell, modernes Bundling       |

### Backend

| Komponente      | Technologie           | Begründung                       |
| --------------- | --------------------- | -------------------------------- |
| Framework       | **FastAPI** (Python)  | Async, automatische OpenAPI Docs |
| ORM             | **SQLAlchemy 2.0**    | Moderne async Unterstützung      |
| Validation      | **Pydantic**          | Typ-Sicherheit, JSON Schema      |
| Auth (optional) | **JWT** oder API Keys | Für Admin-Zugriff                |

### Datenbank

| Umgebung    | Technologie    | Begründung                   |
| ----------- | -------------- | ---------------------------- |
| Development | **SQLite**     | Zero-Config, in-memory Tests |
| Production  | **PostgreSQL** | JSONB-Support, skalierbar    |

### Deployment

| Komponente        | Technologie                          |
| ----------------- | ------------------------------------ |
| Containerisierung | **Docker + Docker Compose**          |
| Hosting-Optionen  | Self-hosted, Railway, Fly.io, Render |

---

## Kernfunktionen

### Phase 1: MVP

#### 1. Survey Renderer (Frontend)

- [ ] JSON-basierte Survey-Definition laden
- [ ] Frage-Typen: `text`, `textarea`, `radio`, `checkbox`, `scale`, `dropdown`
- [ ] Progress-Anzeige
- [ ] Responsive Design
- [ ] LocalStorage für Partial Saves

#### 2. Expression Language (Frontend)

- [ ] Simple Condition Syntax: `{"show_if": "answers.q1 == 'yes'"}`
- [ ] Skip-Logic: `{"skip_to": "q5", "if": "answers.q3 > 3"}`
- [ ] Vergleichsoperatoren: `==`, `!=`, `>`, `<`, `>=`, `<=`, `in`
- [ ] Logische Operatoren: `and`, `or`, `not`

#### 3. Response Collection (Backend)

- [ ] `POST /api/v1/responses` – Speichert Antworten
- [ ] `GET /api/v1/surveys/{survey_id}` – Lädt Survey-Definition
- [ ] Hidden Fields Support (URL-Parameter: `?source=instagram`)
- [ ] Duplicate-Prevention (Cookie/Fingerprint-basiert)
- [ ] CORS-Konfiguration

#### 4. Data Export

- [ ] JSON-Export aller Responses
- [ ] CSV-Export für Spreadsheet-Analyse
- [ ] Filtermöglichkeit nach Datum, Survey, Source

### Phase 2: Nice-to-Have

- [ ] Admin Dashboard mit Visualisierungen
- [ ] Webhook-Support (n8n, Zapier Integration)
- [ ] reCAPTCHA / Cloudflare Turnstile
- [ ] Email-Benachrichtigungen bei neuen Responses
- [ ] Multi-Language Support
- [ ] Custom Thank-You Pages
- [ ] A/B Test Varianten

---

## JSON Schema: Survey Definition

```json
{
  "id": "civic_validation_2024",
  "title": "Civic OS Master Validation Survey",
  "version": "1.0.0",
  "settings": {
    "allow_back": true,
    "show_progress": true,
    "submit_redirect": "/thank-you"
  },
  "questions": [
    {
      "id": "screening_student",
      "type": "radio",
      "phase": "screening",
      "text": "Bist du aktuell Student:in?",
      "options": [
        { "value": "yes", "label": "Ja" },
        { "value": "no", "label": "Nein" }
      ],
      "required": true
    },
    {
      "id": "loneliness_freq",
      "type": "scale",
      "phase": "validation",
      "text": "Wie oft hast du letzte Woche alleine gegessen?",
      "config": {
        "min": 0,
        "max": 7,
        "min_label": "Nie",
        "max_label": "Täglich"
      },
      "show_if": "answers.screening_student == 'yes'"
    },
    {
      "id": "pay_intent",
      "type": "radio",
      "phase": "marketing",
      "text": "Würdest du 5€/Monat zahlen, um nie wieder alleine zu essen?",
      "options": [
        { "value": "yes", "label": "Ja, definitiv" },
        { "value": "maybe", "label": "Vielleicht" },
        { "value": "no", "label": "Nein" }
      ],
      "show_if": "answers.loneliness_freq >= 3"
    }
  ]
}
```

---

## JSON Schema: Response

```json
{
  "id": "resp_abc123",
  "survey_id": "civic_validation_2024",
  "answers": {
    "screening_student": "yes",
    "loneliness_freq": 5,
    "pay_intent": "yes"
  },
  "meta": {
    "source": "instagram",
    "user_agent": "Mozilla/5.0...",
    "ip_hash": "a1b2c3...",
    "duration_seconds": 142
  },
  "started_at": "2024-12-22T10:00:00Z",
  "completed_at": "2024-12-22T10:02:22Z"
}
```

---

## Expression Language Spec

### Syntax

```
condition := comparison | logical_expr
comparison := "answers." identifier operator value
logical_expr := condition ("and" | "or") condition
              | "not" condition

operator := "==" | "!=" | ">" | "<" | ">=" | "<=" | "in"
value := string | number | boolean | array
```

### Beispiele

```json
// Einfacher Vergleich
{"show_if": "answers.age >= 18"}

// String-Vergleich
{"show_if": "answers.status == 'student'"}

// In-Array Check
{"show_if": "answers.interests in ['dating', 'friends']"}

// Logische Kombination
{"show_if": "answers.lonely == true and answers.age >= 18"}

// Skip-to mit Bedingung
{"skip_to": "section_marketing", "if": "answers.screening == 'no'"}
```

---

## API Endpoints

### Public

| Method | Endpoint                         | Beschreibung            |
| ------ | -------------------------------- | ----------------------- |
| `GET`  | `/api/v1/surveys/{id}`           | Survey-Definition laden |
| `POST` | `/api/v1/responses`              | Antworten speichern     |
| `POST` | `/api/v1/responses/{id}/partial` | Partial Save            |

### Admin (Auth required)

| Method   | Endpoint                          | Beschreibung            |
| -------- | --------------------------------- | ----------------------- |
| `GET`    | `/api/v1/admin/responses`         | Alle Responses abrufen  |
| `GET`    | `/api/v1/admin/responses/export`  | CSV/JSON Export         |
| `DELETE` | `/api/v1/admin/responses/{id}`    | Response löschen (GDPR) |
| `GET`    | `/api/v1/admin/stats/{survey_id}` | Aggregierte Statistiken |

---

## Datenbank Schema

```sql
-- Surveys (optional, kann auch statisch aus JSON geladen werden)
CREATE TABLE surveys (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    definition JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id TEXT NOT NULL,
    answers JSONB NOT NULL,
    meta JSONB DEFAULT '{}',
    fingerprint_hash TEXT,  -- Für Duplicate-Prevention
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);
CREATE INDEX idx_responses_fingerprint ON responses(fingerprint_hash);
```

---

## Projektstruktur

```
survey-engine/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Survey.jsx
│   │   │   ├── Question.jsx
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── TextInput.jsx
│   │   │   │   ├── RadioGroup.jsx
│   │   │   │   ├── Scale.jsx
│   │   │   │   └── ...
│   │   │   └── ProgressBar.jsx
│   │   ├── lib/
│   │   │   ├── expressionParser.js
│   │   │   └── surveyEngine.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── surveys/          # Statische Survey JSONs
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── response.py
│   │   ├── routes/
│   │   │   ├── surveys.py
│   │   │   ├── responses.py
│   │   │   └── admin.py
│   │   └── schemas/
│   │       └── response.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── LICENSE                   # MIT oder Apache 2.0
```

---

## Nächste Schritte

1. **Repo erstellen:** `survey-engine` oder alternativer Name
2. **Frontend MVP:** Survey Renderer + Expression Language
3. **Backend MVP:** FastAPI + Response Collection
4. **Docker Setup:** docker-compose für lokale Entwicklung
5. **Erste Survey:** Civic Validation Survey als JSON konvertieren
6. **Deploy:** Self-hosted oder Cloud-Provider

---

## Offene Entscheidungen

| Frage              | Optionen                               | Status   |
| ------------------ | -------------------------------------- | -------- |
| Repo-Name          | `survey-engine`, `formflow`, `askflow` | ⏳ Offen |
| Frontend Framework | React vs. Vanilla JS                   | ⏳ Offen |
| Admin Dashboard    | Eingebaut vs. Externer Export          | ⏳ Offen |
| Auth für Admin     | JWT vs. API Key vs. Basic Auth         | ⏳ Offen |
