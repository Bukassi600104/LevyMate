# LevyMate Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All tests passing (29/29)
- [x] TypeScript compilation successful (backend)
- [x] TypeScript compilation successful (frontend)
- [x] ESLint checks passing
- [x] No critical security vulnerabilities

### ✅ Backend Implementation
- [x] All API endpoints implemented
- [x] Authentication system complete
- [x] Database entities created
- [x] Migration system configured
- [x] Error handling implemented
- [x] Security middleware configured
- [x] File upload handling
- [x] Webhook verification

### ✅ Testing
- [x] WhatsApp parser tests (13 tests)
- [x] Tax engine tests (15 tests)
- [x] OCR handler tests (7 tests)
- [x] All test suites passing

### ✅ Documentation
- [x] Backend API documentation
- [x] Setup guide
- [x] Quick start guide
- [x] Implementation summary
- [x] Integration guide

## Deployment Steps

### 1. Environment Setup

#### Production Server
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 14+
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2
```

#### Database Setup
```bash
# Create database user
sudo -u postgres createuser levymate_prod --pwprompt

# Create database
sudo -u postgres createdb levymate_prod -O levymate_prod

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE levymate_prod TO levymate_prod;"
```

### 2. Application Deployment

#### Clone and Install
```bash
git clone <repository-url>
cd levymate
npm install --production
```

#### Configure Environment
```bash
cp .env.example .env.production

# Edit .env.production with production values
nano .env.production
```

Required production environment variables:
```env
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=levymate_prod
DB_PASSWORD=<secure-password>
DB_NAME=levymate_prod

# Backend
BACKEND_PORT=4000
FRONTEND_URL=https://yourdomain.com

# JWT (generate secure secrets)
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Webhooks
WEBHOOK_SECRET=<32-char-random-string>

# OCR Service (if using)
OCR_SERVICE_URL=http://localhost:8000/ocr

# Optional: Monitoring
SENTRY_DSN=https://...
```

#### Run Database Migrations
```bash
npm run migration:run
```

#### Build Application
```bash
npm run build
```

### 3. Process Management

#### Start with PM2
```bash
# Start backend
pm2 start npm --name "levymate-backend" -- run start:server

# Start frontend
pm2 start npm --name "levymate-frontend" -- start

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

#### Monitor Processes
```bash
pm2 status
pm2 logs levymate-backend
pm2 logs levymate-frontend
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/levymate

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/levymate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 6. Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 7. PostgreSQL Security

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add line for local connections only
local   levymate_prod   levymate_prod   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 8. Monitoring & Logging

#### Set up log rotation
```bash
# /etc/logrotate.d/levymate
/var/log/levymate/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload all
    endscript
}
```

#### Configure PM2 monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
```

### 9. Backup Strategy

#### Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-levymate-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/levymate"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U levymate_prod levymate_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-levymate-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-levymate-db.sh") | crontab -
```

### 10. Health Checks

```bash
# Test backend
curl https://api.yourdomain.com/health

# Test frontend
curl https://yourdomain.com

# Test database connection
psql -U levymate_prod -d levymate_prod -c "SELECT COUNT(*) FROM users;"
```

## Post-Deployment Verification

### API Testing
```bash
# Register test user
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get tax rules
curl https://api.yourdomain.com/tax/rules
```

### Performance Testing
- [ ] Load test API endpoints
- [ ] Check response times (<200ms)
- [ ] Verify database query performance
- [ ] Test concurrent user connections

### Security Audit
- [ ] Run security scan (npm audit)
- [ ] Verify SSL certificate
- [ ] Test authentication flows
- [ ] Check CORS configuration
- [ ] Verify rate limiting (if implemented)
- [ ] Test file upload restrictions

### Monitoring Setup
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up log aggregation
- [ ] Configure alerts

## Rollback Plan

If deployment fails:

```bash
# Stop services
pm2 stop all

# Restore previous version
git checkout <previous-tag>
npm install
npm run build

# Revert database migrations
npm run migration:revert

# Restart services
pm2 restart all
```

## Optional: OCR Service Deployment

### Install Python OCR Service
```bash
# Install Python and dependencies
sudo apt-get install -y python3 python3-pip tesseract-ocr

# Install Python packages
cd services/ocr
pip3 install -r requirements.txt

# Start OCR service with PM2
pm2 start python3 --name "levymate-ocr" -- ocr_service.py
pm2 save
```

## Maintenance Tasks

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor disk space

### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Review security alerts

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize database
- [ ] Backup verification
- [ ] Security audit

## Support Contacts

- Infrastructure: [email]
- Database: [email]
- Application: [email]
- Security: [email]

## Success Criteria

✅ All services running
✅ Health checks passing
✅ API endpoints responding
✅ Database accessible
✅ SSL certificates valid
✅ Backups configured
✅ Monitoring active
✅ Documentation updated

## Notes

- Keep environment variables secure
- Never commit secrets to version control
- Regularly update dependencies
- Monitor logs for suspicious activity
- Test backup restoration regularly
- Document any configuration changes
