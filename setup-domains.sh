#!/bin/bash

# Domain Setup Script for Open X
# This script configures Nginx reverse proxy for custom domains

set -e

echo "🚀 Setting up domains for Open X..."
echo ""

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Create frontend config
echo "⚙️  Configuring frontend (aiechohub.com)..."
sudo tee /etc/nginx/sites-available/aiechohub.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name aiechohub.com www.aiechohub.com;
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
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
EOF

# Create backend config
echo "⚙️  Configuring backend (api.aiechohub.com)..."
sudo tee /etc/nginx/sites-available/api.aiechohub.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.aiechohub.com;
    client_max_body_size 10M;
    
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
EOF

# Enable sites
echo "🔗 Enabling sites..."
sudo ln -sf /etc/nginx/sites-available/aiechohub.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.aiechohub.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Allow Nginx through firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your DNS records point to this server (57.158.26.52)"
echo "2. Run SSL setup: sudo certbot --nginx -d aiechohub.com -d www.aiechohub.com -d api.aiechohub.com"
echo "3. Update environment variables in ~/open-x/.env"
echo "4. Restart Docker containers: cd ~/open-x && docker compose restart"
echo ""
echo "🌐 Your domains:"
echo "   Frontend: http://aiechohub.com (will be https after SSL)"
echo "   Backend:  http://api.aiechohub.com (will be https after SSL)"
echo ""
