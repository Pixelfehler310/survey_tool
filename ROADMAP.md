# Survey Platform Roadmap

Self-hosted survey platform with OAuth, visual builder, and plugin extensibility.

---

## Phase Overview

| Phase | Feature                              | Est. Hours | Status     |
| ----- | ------------------------------------ | ---------- | ---------- |
| **1** | OAuth Authentication (Google/GitHub) | 15-20h     | 🔜 Next    |
| **2** | Database Migrations (Alembic)        | 5-8h       | ⏳ Pending |
| **3** | No-Code Survey Builder               | 40-50h     | ⏳ Pending |
| **4** | Plugin System                        | 30-40h     | ⏳ Pending |

**Total Estimate:** ~90-120 hours

---

## Phase 1: OAuth Authentication

Add Google & GitHub login alongside existing email/password auth.

**Key Deliverables:**

- OAuth providers service (Google, GitHub)
- OAuth callback routes
- Extended User model (oauth_provider, oauth_id, avatar)
- Updated Login.jsx with OAuth buttons
- OAuthCallback.jsx page

---

## Phase 2: Database Migrations

Enable safe schema updates between versions using Alembic.

**Key Deliverables:**

- Alembic setup and configuration
- Initial migration (baseline current schema)
- OAuth fields migration
- Remove `create_all()` from startup

---

## Phase 3: No-Code Survey Builder

Visual drag-and-drop editor to create surveys without editing JSON.

**Key Deliverables:**

- SurveyBuilder component with DnD Kit
- QuestionLibrary, BuilderCanvas, QuestionEditor
- Visual LogicEditor for show_if
- Survey CRUD API endpoints

---

## Phase 4: Plugin System

Extensibility through custom question types, integrations, and themes.

**Key Deliverables:**

- Plugin model and manifest schema
- Plugin routes (install, configure, enable/disable)
- PluginManager UI
- PluginRegistry for dynamic component loading

---

_Last updated: 2025-12-25_
