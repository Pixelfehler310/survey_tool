# API Reference

REST API endpoints for the survey tool.

**Base URL**: `http://localhost:8000/api/v1`

---

## Authentication

### POST `/auth/token`

Get JWT token with email/password.

**Request:**

```json
{
  "username": "user@example.com",
  "password": "secret"
}
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### POST `/auth/register`

Register new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true
}
```

---

## OAuth

### GET `/oauth/providers`

List available OAuth providers.

**Response:**

```json
{
  "providers": ["google", "github"]
}
```

### GET `/oauth/{provider}/login`

Redirect to OAuth provider.

### GET `/oauth/{provider}/callback`

OAuth callback (returns JWT).

---

## Surveys (Public)

### GET `/surveys`

List all surveys.

**Response:**

```json
[
  {
    "id": "feedback-2024",
    "title": "Customer Feedback",
    "is_active": true
  }
]
```

### GET `/surveys/{survey_id}`

Get survey definition.

**Response:**

```json
{
  "id": "feedback-2024",
  "title": "Customer Feedback",
  "settings": { ... },
  "questions": [ ... ]
}
```

---

## Surveys (Authenticated)

Requires `Authorization: Bearer <token>` header.

### GET `/app/surveys`

List user's surveys.

### GET `/app/surveys/{id}`

Get user's survey by ID.

### PUT `/app/surveys/{id}`

Update survey.

**Request:**

```json
{
  "definition": {
    "id": "...",
    "title": "...",
    "questions": [...]
  }
}
```

### POST `/app/surveys/import`

Import survey from JSON.

**Request:**

```json
{
  "definition": { ... }
}
```

### POST `/app/surveys/template/{template_id}`

Create survey from template.

---

## Responses

### POST `/responses`

Submit survey response.

**Request:**

```json
{
  "survey_id": "feedback-2024",
  "answers": {
    "satisfaction": 4,
    "comments": "Great service!"
  }
}
```

**Response:**

```json
{
  "id": "resp_abc123",
  "survey_id": "feedback-2024",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### POST `/responses/{id}/partial`

Update partial response (save progress).

**Request:**

```json
{
  "answers": {
    "q1": "value"
  }
}
```

### GET `/responses/{id}`

Get response by ID.

---

## Admin Endpoints

Requires admin JWT.

### GET `/admin/responses`

List all responses.

**Query params:**

- `survey_id` - Filter by survey
- `skip` - Pagination offset
- `limit` - Page size

### GET `/admin/responses/export`

Export responses.

**Query params:**

- `survey_id` - Required
- `format` - `json` or `csv`

### GET `/admin/stats/{survey_id}`

Get survey statistics.

**Response:**

```json
{
  "total_responses": 150,
  "completion_rate": 0.85,
  "average_time": 180
}
```

### DELETE `/admin/responses/{id}`

Delete a response.

---

## Analytics

### POST `/analytics/events`

Track survey event.

**Request:**

```json
{
  "survey_id": "feedback-2024",
  "session_id": "sess_123",
  "event_type": "started",
  "question_index": 0
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid request body"
}
```

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found

```json
{
  "detail": "Survey not found"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error"
    }
  ]
}
```

---

## Rate Limiting

No rate limiting in development. Production should use reverse proxy.

---

## CORS

Configured via `CORS_ORIGINS` environment variable.

---

## Interactive Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
