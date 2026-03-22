# Maiki Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain configured (maiki.io)
- SSL certificates ready
- Server with minimum 2GB RAM, 2 vCPUs

## Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

## Step 2: Clone Repository

```bash
git clone https://github.com/yourorg/maiki.git
cd maiki
```

## Step 3: Environment Configuration

```bash
# Create production .env file
cp backend/.env.example backend/.env

# Edit with production values
nano backend/.env

# Set these values:
# - ENVIRONMENT=production
# - DEBUG=false
# - SECRET_KEY=<generate-strong-key>
# - DATABASE_URL=<rds-url-or-local>
# - STRIPE_SECRET_KEY=<live-key>
```

## Step 4: SSL Certificates

```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d maiki.io -d www.maiki.io

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/maiki.io/fullchain.pem infrastructure/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/maiki.io/privkey.pem infrastructure/nginx/ssl/key.pem
```

## Step 5: Deploy

```bash
# Build and start
docker-compose -f docker-compose.yml --profile production up -d --build

# Run migrations
docker-compose exec backend alembic upgrade head

# Check status
docker-compose ps
```

## Step 6: Database Backups

```bash
# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres maiki > /backups/maiki_$(date +\%Y\%m\%d).sql
```

## Step 7: Monitoring

```bash
# Install Datadog agent or similar
# Configure alerts for:
# - CPU > 80%
# - Memory > 80%
# - Disk > 80%
# - API response time > 2s
# - Database connections > 80%
```

## Troubleshooting

### Database Connection Issues
```bash
# Check logs
docker-compose logs postgres

# Reset database (WARNING: DESTROYS DATA)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend alembic upgrade head
```

### SSL Issues
```bash
# Renew certificates
sudo certbot renew

# Copy updated certs
docker-compose restart nginx
```

### Performance Issues
```bash
# Scale backend
docker-compose up -d --scale backend=3

# Add load balancer
# Update nginx.conf with upstream backend
```

## Rollback

```bash
# Rollback to previous version
docker-compose down
git checkout <previous-tag>
docker-compose up -d --build
```

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Health check: `curl https://maiki.io/health`
- API status: `curl https://maiki.io/api/v1/`
