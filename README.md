# Survey Engine

A lean, JSON-driven open-source survey tool with expression language for logic branching.

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional)

### Local Development (without Docker)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create data directory
mkdir -p data

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### With Docker

```bash
docker-compose up --build
```

### Running Tests

```bash
cd backend
pytest -v
```

## API Endpoints

### Public

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| `GET`  | `/api/v1/surveys/{id}`           | Get survey definition   |
| `GET`  | `/api/v1/surveys`                | List all surveys        |
| `POST` | `/api/v1/responses`              | Submit response         |
| `POST` | `/api/v1/responses/{id}/partial` | Update partial response |
| `GET`  | `/api/v1/responses/{id}`         | Get response by ID      |

### Admin (JWT required)

| Method   | Endpoint                          | Description     |
| -------- | --------------------------------- | --------------- |
| `POST`   | `/api/v1/admin/token`             | Get admin token |
| `GET`    | `/api/v1/admin/responses`         | List responses  |
| `GET`    | `/api/v1/admin/responses/export`  | Export JSON/CSV |
| `GET`    | `/api/v1/admin/stats/{survey_id}` | Get statistics  |
| `DELETE` | `/api/v1/admin/responses/{id}`    | Delete response |

## Environment Variables

| Variable         | Default                                       | Description                 |
| ---------------- | --------------------------------------------- | --------------------------- |
| `DATABASE_URL`   | `sqlite+aiosqlite:///./data/survey.db`        | Database connection         |
| `JWT_SECRET_KEY` | `dev-secret-change-in-production`             | JWT signing key             |
| `CORS_ORIGINS`   | `http://localhost:3000,http://localhost:5173` | Allowed origins             |
| `SURVEYS_PATH`   | `./surveys`                                   | Survey JSON files directory |

## License

MIT
