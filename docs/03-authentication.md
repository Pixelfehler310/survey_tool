# Authentication

User authentication and authorization.

## Overview

The survey tool supports:

1. **Email/Password** - Traditional registration
2. **OAuth** - Google and GitHub social login
3. **JWT** - Stateless token authentication

---

## Email/Password

### Registration

1. Navigate to `/register`
2. Enter email and password
3. Submit form

**API:**

```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Login

1. Navigate to `/login`
2. Enter credentials
3. JWT token stored in localStorage

**API:**

```bash
POST /api/v1/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

---

## OAuth Setup

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   https://your-domain.com/auth/callback
   ```
5. Copy Client ID and Secret

**Environment:**

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:5173
```

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Authorization callback URL:
   ```
   http://localhost:5173/auth/callback
   ```
4. Copy Client ID and Secret

**Environment:**

```bash
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:5173
```

---

## OAuth Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │    │ Frontend │    │ Backend  │    │ Provider │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ Click Login   │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Redirect to   │               │
     │               │───────────────────────────────>
     │               │               │               │
     │               │               │  User grants  │
     │               │               │<──────────────│
     │               │               │               │
     │               │  Callback     │  Auth code    │
     │               │<───────────────────────────────
     │               │               │               │
     │               │  Exchange     │               │
     │               │  for token    │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │   JWT token   │               │
     │               │<──────────────│               │
     │               │               │               │
     │  Logged in    │               │               │
     │<──────────────│               │               │
```

---

## JWT Tokens

### Structure

```
header.payload.signature
```

**Payload contains:**

```json
{
  "sub": "1", // User ID
  "email": "user@...",
  "exp": 1704067200 // Expiration timestamp
}
```

### Usage

Include in request header:

```
Authorization: Bearer eyJ...
```

### Expiration

Default: 30 days

Configure via JWT settings in backend.

---

## Protected Routes

### Frontend

Routes under `/app/*` require authentication:

- `/app/dashboard`
- `/app/builder/:id`
- `/app/analytics/:id`

Unauthenticated users redirected to `/login`.

### Backend

Endpoints require `Authorization` header:

- `GET /api/v1/app/surveys`
- `PUT /api/v1/app/surveys/:id`
- `GET /api/v1/admin/*`

---

## User Model

| Field             | Type   | Description                      |
| ----------------- | ------ | -------------------------------- |
| `id`              | int    | Primary key                      |
| `email`           | string | Unique email                     |
| `hashed_password` | string | Bcrypt hash (nullable for OAuth) |
| `is_active`       | bool   | Account active                   |
| `oauth_provider`  | string | google, github, or null          |
| `oauth_id`        | string | Provider user ID                 |
| `avatar_url`      | string | Profile picture                  |

---

## Security Best Practices

### Password Storage

- Bcrypt hashing with salt
- Never stored in plain text

### JWT Secret

```bash
# Generate strong secret
openssl rand -hex 32
```

Set in production:

```bash
JWT_SECRET_KEY=your-64-character-random-string
```

### HTTPS

Always use HTTPS in production for:

- Login forms
- OAuth callbacks
- API requests with tokens

---

## Troubleshooting

### "Not authenticated"

- Check token in localStorage: `localStorage.getItem('token')`
- Verify token not expired
- Check Authorization header format

### OAuth callback fails

- Verify redirect URI matches exactly
- Check FRONTEND_URL environment variable
- Ensure provider credentials are correct

### Google "redirect_uri_mismatch"

- Add exact callback URL to Google Console
- Include port number if not 80/443
