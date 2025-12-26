# Analytics

Survey analytics and reporting features.

## Dashboard Overview

The Dashboard (`/app/dashboard`) shows:

- List of your surveys
- Response count per survey
- Quick actions (Edit, Analytics, Share)

---

## Survey Analytics

Access via **📊 Analyse** button on dashboard.

### Response Statistics

| Metric          | Description                     |
| --------------- | ------------------------------- |
| Total Responses | Number of completed submissions |
| Completion Rate | Submissions / Started           |
| Average Time    | Mean completion time            |

### Question Breakdown

For each question:

- Response distribution
- Most common answers
- Skip rate

---

## Drop-off Analysis

Track where users abandon surveys.

### Events

| Event               | Description        |
| ------------------- | ------------------ |
| `started`           | Survey loaded      |
| `question_viewed`   | Question displayed |
| `question_answered` | Answer submitted   |
| `completed`         | Survey finished    |

### Funnel View

```
Started:     100 ───────────────────────────── 100%
Question 1:   95 ─────────────────────────────  95%
Question 2:   87 ───────────────────────────    87%
Question 3:   82 ──────────────────────         82%
Completed:    75 ─────────────────              75%
```

---

## A/B Testing

Compare survey variants.

### Setup

1. Create survey variations
2. Use different survey IDs
3. Compare completion rates

### Metrics to Compare

- Completion rate
- Drop-off points
- Time to complete
- Answer distributions

---

## Export Data

### JSON Export

```bash
GET /api/v1/admin/responses/export?survey_id=xxx&format=json
```

Returns array of response objects.

### CSV Export

```bash
GET /api/v1/admin/responses/export?survey_id=xxx&format=csv
```

Flat format with one row per response.

### Export via Dashboard

1. Go to survey analytics
2. Click **📥 Export**
3. Choose format

---

## Response Table

View individual responses:

| Column    | Content             |
| --------- | ------------------- |
| ID        | Response identifier |
| Submitted | Timestamp           |
| Answers   | Key-value pairs     |
| Metadata  | Device, referrer    |

### Filtering

- By date range
- By specific answers
- By completion status

---

## API Access

### Get Statistics

```bash
GET /api/v1/admin/stats/{survey_id}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "total_responses": 150,
  "completion_rate": 0.85,
  "responses_by_day": [
    { "date": "2024-01-15", "count": 25 },
    { "date": "2024-01-16", "count": 30 }
  ]
}
```

### Track Event

```bash
POST /api/v1/analytics/events
{
  "survey_id": "xxx",
  "session_id": "sess_123",
  "event_type": "question_answered",
  "question_index": 2,
  "question_id": "satisfaction"
}
```

---

## Privacy Considerations

### GDPR Compliance

- `COLLECT_IP=false` by default
- No cookies for tracking
- Anonymous session IDs

### Data Retention

- Responses stored indefinitely
- Manual deletion available
- Export before deletion

---

## Future Features

- Real-time response streaming
- Custom dashboards
- Scheduled reports
- Webhook notifications
