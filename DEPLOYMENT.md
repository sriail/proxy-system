# Deployment Guide

This guide will help you deploy the Proxy System to various hosting platforms.

## Prerequisites

- Node.js 16.x or higher
- npm or pnpm package manager
- Git

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/sriail/proxy-system.git
cd proxy-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production          # Environment mode
```

## Production Deployment

### Heroku

1. Install the Heroku CLI and login:
```bash
heroku login
```

2. Create a new Heroku app:
```bash
heroku create your-proxy-system
```

3. Deploy:
```bash
git push heroku main
```

4. Set environment variables:
```bash
heroku config:set NODE_ENV=production
```

### Railway

1. Connect your GitHub repository to Railway
2. Select the repository
3. Railway will auto-detect the Node.js app
4. Set environment variables in the Railway dashboard
5. Deploy

### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Set environment variables
5. Deploy

### DigitalOcean App Platform

1. Create a new App on DigitalOcean
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Run Command: `npm start`
4. Deploy

### Docker

Build the Docker image:

```bash
docker build -t proxy-system .
```

Run the container:

```bash
docker run -p 3000:3000 proxy-system
```

### Docker Compose

Use the provided `docker-compose.yml`:

```yaml
version: '3.8'

services:
  proxy-system:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Nginx Configuration

For production deployments, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /wisp/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## SSL/TLS Certificate

Use Let's Encrypt for free SSL certificates:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Process Management with PM2

Install PM2:

```bash
npm install -g pm2
```

Start the application:

```bash
pm2 start index.js --name proxy-system
pm2 save
pm2 startup
```

Monitor the application:

```bash
pm2 status
pm2 logs proxy-system
pm2 monit
```

## Performance Optimization

1. **Enable compression** in Express:
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Use caching** for static assets in Nginx:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Enable HTTP/2** in Nginx (already shown in SSL config above)

4. **Use a CDN** for static assets

## Monitoring

### Health Check

The application includes a health check endpoint:

```bash
curl https://yourdomain.com/health
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### Logging

View logs with PM2:

```bash
pm2 logs proxy-system --lines 100
```

Or with Docker:

```bash
docker logs -f container_name
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Implement rate limiting** to prevent abuse
3. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```
4. **Use environment variables** for sensitive data
5. **Enable CORS** only for trusted domains
6. **Implement authentication** for private deployments
7. **Monitor logs** for suspicious activity

## Scaling

### Horizontal Scaling

Use load balancers to distribute traffic across multiple instances:

```nginx
upstream proxy_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://proxy_backend;
    }
}
```

### Vertical Scaling

Increase server resources (CPU, RAM) based on traffic.

## Troubleshooting

### Server won't start

1. Check if port is available:
   ```bash
   lsof -i :3000
   ```

2. Check logs:
   ```bash
   pm2 logs proxy-system
   ```

### Proxy not working

1. Check Bare server is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check browser console for errors

3. Verify WebSocket connections are allowed

### High memory usage

1. Monitor with PM2:
   ```bash
   pm2 monit
   ```

2. Restart the application:
   ```bash
   pm2 restart proxy-system
   ```

## Backup and Recovery

1. **Database backups** (if you add a database)
2. **Configuration backups**
3. **Regular snapshots** of the server

## Updates

To update the application:

```bash
git pull origin main
npm install
pm2 restart proxy-system
```

## Support

For issues and questions:
- Check the README.md
- Review this deployment guide
- Open an issue on GitHub
- Check server logs

---

**Note:** This is a proxy system for educational purposes. Ensure compliance with local laws and website terms of service.
