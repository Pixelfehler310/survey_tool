# Deployment

Production deployment guide.

## Production Checklist

- [ ] Set strong `JWT_SECRET_KEY`
- [ ] Configure production database (PostgreSQL)
- [ ] Set proper `CORS_ORIGINS`
- [ ] Enable HTTPS
- [ ] Configure OAuth redirect URIs
- [ ] Set up CAPTCHA (Turnstile)
- [ ] Configure backup strategy

---

## Docker Compose Production

### docker-compose.prod.yml

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    restart: always
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/surveys
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - CORS_ORIGINS=https://survey.example.com
      - TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always

  db:
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=surveys

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

---

## Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:5173;
    }

    server {
        listen 80;
        server_name survey.example.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name survey.example.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
        }
    }
}
```

---

## Database Migration

### Alembic

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### In Docker

```bash
docker compose exec backend alembic upgrade head
```

---

## Environment Hardening

### .env.production

```bash
# Strong secret (64 chars)
JWT_SECRET_KEY=generate-with-openssl-rand-hex-32

# Production database
DATABASE_URL=postgresql+asyncpg://user:strongpass@db:5432/surveys

# Your domain only
CORS_ORIGINS=https://survey.example.com
FRONTEND_URL=https://survey.example.com

# Real CAPTCHA
TURNSTILE_SECRET_KEY=0x...
TURNSTILE_SITE_KEY=0x...

# Production OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Privacy
COLLECT_IP=false
```

---

## SSL Certificates

### Let's Encrypt (Certbot)

```bash
certbot certonly --webroot -w /var/www/html -d survey.example.com
```

### Auto-renewal

```bash
# Crontab
0 0 * * * certbot renew --quiet
```

---

## Backups

### Database

```bash
# PostgreSQL dump
docker compose exec db pg_dump -U user surveys > backup.sql

# Restore
docker compose exec -i db psql -U user surveys < backup.sql
```

### Automated backup script

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
docker compose exec db pg_dump -U user surveys > backups/survey_$DATE.sql
# Upload to S3/GCS
```

---

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend
```

### Metrics

Consider adding:

- Prometheus for metrics
- Grafana for dashboards
- Sentry for error tracking

---

## Scaling

### Horizontal

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancer

Use nginx upstream with multiple backends.

---

## Security Headers

Add to nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

---

## Troubleshooting

### Container won't start

```bash
docker compose logs backend
```

### Database connection failed

- Check DATABASE_URL
- Ensure db service is healthy
- Verify network connectivity

### 502 Bad Gateway

- Backend not ready
- Check backend logs
- Verify upstream configuration
