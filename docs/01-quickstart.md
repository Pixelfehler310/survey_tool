# Quick Start

Get the survey tool running in 5 minutes.

## Prerequisites

- **Docker & Docker Compose** (recommended)
- Or: Node.js 20+, Python 3.11+

---

## Option 1: Docker (Recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/survey_tool.git
cd survey_tool
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and set required values:

```bash
# Generate a secure key:
# openssl rand -hex 32
JWT_SECRET_KEY=your-secure-key-here
```

### 3. Start with Docker Compose

```bash
docker compose up --build
```

### 4. Access the app

| Service     | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:5173      |
| Backend API | http://localhost:8000      |
| API Docs    | http://localhost:8000/docs |

---

## Option 2: Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create data directory
mkdir -p data

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## First Login

### Register an account

1. Go to http://localhost:5173/register
2. Enter email and password
3. Click "Registrieren"

### Or use OAuth

1. Go to http://localhost:5173/login
2. Click "Mit Google anmelden" or "Mit GitHub anmelden"
3. (Requires OAuth configuration, see [Authentication](./03-authentication.md))

---

## Create Your First Survey

### 1. Open Dashboard

After login, you're on the Dashboard at `/app/dashboard`.

### 2. Create new survey

Click **"+ Neue Umfrage"** or import a template.

### 3. Add questions

1. You're now in the Survey Builder
2. Drag questions from left panel to canvas
3. Click to edit each question
4. Configure settings with ⚙️ button

### 4. Preview

Click 👁️ **Vorschau** to test your survey.

### 5. Share

Copy the survey URL from the Dashboard.

---

## Sample Survey

The `surveys/` folder contains example JSON files:

```
surveys/
├── civic_validation.json     # Complex multi-phase survey
├── examples/
│   ├── feedback_survey.json  # Simple feedback form
│   └── nps_survey.json       # NPS example
```

Import via Dashboard → **📥 Importieren**.

---

## Next Steps

- [Configuration](./02-configuration.md) - Environment variables
- [Survey Builder](./04-survey-builder.md) - Editor guide
- [Expression Language](./05-expression-language.md) - Conditional logic
- [Deployment](./10-deployment.md) - Production setup
