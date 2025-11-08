# 🌐 External Access to Autolytiq

## ✅ Configuration Complete!

Your application is now configured for external access.

## 🌍 Access URLs

### Your Server IP: **134.122.7.75**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://134.122.7.75:5173 | Main application UI |
| **Backend API** | http://134.122.7.75:3000 | REST API endpoints |
| **Health Check** | http://134.122.7.75:3000/health | Server health status |
| **Login API** | http://134.122.7.75:3000/api/auth/login | Authentication endpoint |

## 🚀 Starting the Application

### Option 1: Start Script (Recommended)
```bash
cd /root/autolytiq
./START_SERVERS.sh
```

### Option 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd /root/autolytiq
pnpm --filter @repo/backend dev
```

**Terminal 2 - Frontend:**
```bash
cd /root/autolytiq
pnpm --filter @repo/frontend dev
```

## 🔐 Login Credentials

Visit: **http://134.122.7.75:5173**

| Role | Store ID | Username | Password |
|------|----------|----------|----------|
| Admin | demo | admin | demo123 |
| Manager | demo | manager | demo123 |
| Sales | demo | sales | demo123 |

## ✅ What Was Changed

### 1. Backend (`apps/backend/src/index.ts`)
- ✅ Changed to listen on `0.0.0.0` (all interfaces)
- ✅ CORS configured to allow all origins in development
- ✅ Now accessible from external IPs

### 2. Frontend (`apps/frontend/vite.config.ts`)
- ✅ Vite configured to listen on `0.0.0.0`
- ✅ Port set to 5173
- ✅ API proxy configured for localhost backend

### 3. Environment Variables
- ✅ Frontend `.env` updated with server IP
- ✅ Backend `.env` configured for external access

## 🧪 Testing External Access

### 1. Test Backend Health
```bash
curl http://134.122.7.75:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-08T12:00:00.000Z",
  "uptime": 123.45
}
```

### 2. Test Login API
```bash
curl -X POST http://134.122.7.75:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "demo",
    "username": "admin",
    "password": "demo123"
  }'
```

### 3. Access Frontend
Open in your browser:
```
http://134.122.7.75:5173
```

## 🔒 Port Requirements

Make sure these ports are open on your server:
- **Port 3000** - Backend API
- **Port 5173** - Frontend (Vite dev server)

Current firewall status: **Inactive** ✅

## 🌐 For Domain Name Access

If you want to use a domain name instead of IP:

### 1. Point DNS to Server
Add an A record:
```
autolytiq.yourdomain.com  →  134.122.7.75
```

### 2. Install Nginx (Optional - For Production)
```bash
sudo apt install nginx -y
```

### 3. Configure Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/autolytiq
server {
    listen 80;
    server_name autolytiq.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/autolytiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Add SSL (Optional)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d autolytiq.yourdomain.com
```

## 📱 Mobile/Remote Access

The application is now accessible from:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablets
- ✅ Any device with internet access

Simply navigate to: **http://134.122.7.75:5173**

## 🛠️ Troubleshooting

### Can't Connect to Frontend
1. Check if frontend is running:
   ```bash
   curl http://localhost:5173
   ```

2. Check if port 5173 is open:
   ```bash
   netstat -tuln | grep 5173
   ```

3. Check firewall (if enabled):
   ```bash
   sudo ufw allow 5173
   sudo ufw allow 3000
   ```

### Can't Connect to Backend
1. Check if backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check if port 3000 is open:
   ```bash
   netstat -tuln | grep 3000
   ```

### Login Not Working
1. Check backend logs for errors
2. Verify backend is accessible:
   ```bash
   curl http://134.122.7.75:3000/health
   ```
3. Check browser console for CORS errors

## 📋 Network Configuration Summary

| Component | Listen Address | Port | External Access |
|-----------|---------------|------|-----------------|
| Backend | 0.0.0.0 | 3000 | ✅ http://134.122.7.75:3000 |
| Frontend | 0.0.0.0 | 5173 | ✅ http://134.122.7.75:5173 |
| CORS | Enabled | - | ✅ All origins (dev mode) |
| Firewall | Inactive | - | ✅ All ports open |

## ✨ You're All Set!

Your application is now accessible from anywhere on the internet via:

**http://134.122.7.75:5173**

Start the servers and test it out! 🚀
