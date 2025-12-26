# Configuration

All configuration is done via environment variables.

## Quick Setup

```bash
cp .env.example .env
# Edit .env with your values
```

---

## Required Variables

| Variable         | Description             | Example                              |
| ---------------- | ----------------------- | ------------------------------------ |
| `JWT_SECRET_KEY` | Secret for signing JWTs | Generate with `openssl rand -hex 32` |

---

## Optional Variables

### Database

| Variable       | Default                                | Description                |
| -------------- | -------------------------------------- | -------------------------- |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/survey.db` | Database connection string |

**PostgreSQL example:**

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/surveys
```

### CORS

| Variable       | Default                                       | Description                     |
| -------------- | --------------------------------------------- | ------------------------------- |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins |

### Surveys

| Variable       | Default     | Description                   |
| -------------- | ----------- | ----------------------------- |
| `SURVEYS_PATH` | `./surveys` | Path to JSON survey templates |

---

## CAPTCHA (Cloudflare Turnstile)

| Variable               | Description            |
| ---------------------- | ---------------------- |
| `TURNSTILE_SECRET_KEY` | Server-side secret key |
| `TURNSTILE_SITE_KEY`   | Client-side site key   |

Get keys at: https://dash.cloudflare.com/turnstile

---

## OAuth Providers

### Google

| Variable               | Description         |
| ---------------------- | ------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth client ID     |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |

Setup: https://console.cloud.google.com/apis/credentials

### GitHub

| Variable               | Description         |
| ---------------------- | ------------------- |
| `GITHUB_CLIENT_ID`     | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app secret    |

Setup: https://github.com/settings/developers

### Redirect URI

| Variable       | Default                 | Description                  |
| -------------- | ----------------------- | ---------------------------- |
| `FRONTEND_URL` | `http://localhost:5173` | Base URL for OAuth redirects |

---

## Email / SMTP

| Variable             | Description             |
| -------------------- | ----------------------- |
| `SMTP_HOST`          | SMTP server hostname    |
| `SMTP_PORT`          | SMTP port (usually 587) |
| `SMTP_USER`          | SMTP username           |
| `SMTP_PASSWORD`      | SMTP password           |
| `NOTIFICATION_EMAIL` | Email for notifications |

---

## Privacy / GDPR

| Variable     | Default | Description                   |
| ------------ | ------- | ----------------------------- |
| `COLLECT_IP` | `false` | Store respondent IP addresses |

---

## Production Recommendations

```bash
# .env for production

# Strong random key
JWT_SECRET_KEY=your-64-char-random-string

# PostgreSQL for production
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/surveys

# Your domain
CORS_ORIGINS=https://survey.example.com
FRONTEND_URL=https://survey.example.com

# Real CAPTCHA keys
TURNSTILE_SECRET_KEY=0x...
TURNSTILE_SITE_KEY=0x...

# OAuth for login
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GDPR
COLLECT_IP=false
```

---

## Docker Compose Variables

In `docker-compose.yml`, variables are passed to containers:

```yaml
services:
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL:-sqlite+aiosqlite:///./data/survey.db}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
```

---

## Validation

The backend validates configuration at startup:

- Missing `JWT_SECRET_KEY` → Warning (uses insecure default)
- Invalid `DATABASE_URL` → Connection error

Check logs for configuration issues:

```bash
docker compose logs backend
```
