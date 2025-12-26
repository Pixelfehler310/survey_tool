# Survey Tool Documentation

Open-source survey platform with no-code builder and plugin system.

## Quick Links

| Getting Started                             |                            |
| ------------------------------------------- | -------------------------- |
| [🚀 Quick Start](./01-quickstart.md)        | Install & run in 5 minutes |
| [⚙️ Configuration](./02-configuration.md)   | Environment variables      |
| [🔐 Authentication](./03-authentication.md) | OAuth & login setup        |

| Using the Tool                                        |                          |
| ----------------------------------------------------- | ------------------------ |
| [🎨 Survey Builder](./04-survey-builder.md)           | No-code editor guide     |
| [📜 Expression Language](./05-expression-language.md) | Conditional logic syntax |
| [🔌 Plugin System](./06-plugin-system.md)             | Custom question types    |

| Reference                                 |                     |
| ----------------------------------------- | ------------------- |
| [📡 API Reference](./07-api-reference.md) | REST endpoints      |
| [📋 Survey Schema](./08-survey-schema.md) | JSON structure      |
| [📊 Analytics](./09-analytics.md)         | Dashboard & exports |

| Operations                          |                  |
| ----------------------------------- | ---------------- |
| [🚢 Deployment](./10-deployment.md) | Production setup |

---

## Features

- **No-Code Builder** - Drag & drop interface
- **Conditional Logic** - Show/skip based on answers
- **Plugin System** - Extend with custom question types
- **OAuth Login** - Google & GitHub
- **A/B Testing** - Compare survey variants
- **Analytics** - Response tracking & export
- **White-Label** - Custom branding

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Survey  │  │ Builder │  │Dashboard│             │
│  │ Render  │  │  Editor │  │Analytics│             │
│  └─────────┘  └─────────┘  └─────────┘             │
└─────────────────────────────────────────────────────┘
                        │ API
┌─────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Surveys │  │Responses│  │  Auth   │             │
│  │   API   │  │   API   │  │  OAuth  │             │
│  └─────────┘  └─────────┘  └─────────┘             │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                 Database (SQLite/PG)                │
└─────────────────────────────────────────────────────┘
```

---

## Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS, Zustand    |
| Backend    | Python, FastAPI, SQLAlchemy, Pydantic |
| Database   | SQLite (dev), PostgreSQL (prod)       |
| Auth       | JWT, OAuth 2.0 (Google, GitHub)       |
| Deployment | Docker, Docker Compose                |

---

## Directory Structure

```
survey_tool/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routes/           # API endpoints
│   │   └── schemas/          # Pydantic schemas
│   └── alembic/              # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Route pages
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # Utilities
│   │   └── plugins/          # Question type plugins
│   └── public/
├── docs/                     # Documentation
├── surveys/                  # Survey templates
└── docker-compose.yml
```

---

## License

MIT
