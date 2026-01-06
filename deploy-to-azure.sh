#!/bin/bash

# Open X - Automated Azure VM Deployment Script
# Target: azureuser@57.158.26.52

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VM_IP="57.158.26.52"
VM_USER="azureuser"
VM_HOST="${VM_USER}@${VM_IP}"
REMOTE_DIR="~/open-x"

echo -e "${GREEN}🚀 Open X - Azure VM Deployment${NC}"
echo "Target: ${VM_HOST}"
echo ""

# Check if SSH connection works
echo -e "${YELLOW}📡 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${VM_HOST} exit 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to ${VM_HOST}${NC}"
    echo "Please ensure:"
    echo "  1. VM is running"
    echo "  2. SSH key is configured"
    echo "  3. Network allows SSH (port 22)"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Update .env with Azure VM IP
    sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=http://${VM_IP}:3000|" .env
    sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://${VM_IP}:4000/graphql|" .env
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please review .env file before deploying${NC}"
    echo ""
fi

# Confirm deployment
read -p "Deploy to ${VM_HOST}? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo -e "${YELLOW}📦 Step 1/6: Preparing project files...${NC}"
# Create temporary directory for clean files
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

# Copy necessary files
cp -r backend frontend docker-compose.yml .env.example .env "${TEMP_DIR}/"

# Remove node_modules and build artifacts
find "${TEMP_DIR}" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find "${TEMP_DIR}" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find "${TEMP_DIR}" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true

echo -e "${GREEN}✅ Files prepared${NC}"
echo ""

echo -e "${YELLOW}📤 Step 2/6: Uploading files to server...${NC}"
# Create remote directory
ssh ${VM_HOST} "mkdir -p ${REMOTE_DIR}"

# Upload files using rsync
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.git' \
    "${TEMP_DIR}/" ${VM_HOST}:${REMOTE_DIR}/

echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

echo -e "${YELLOW}🐳 Step 3/6: Installing Docker...${NC}"
ssh ${VM_HOST} 'bash -s' << 'ENDSSH'
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    else
        echo "Docker already installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        sudo apt update
        sudo apt install -y docker-compose
    else
        echo "Docker Compose already installed"
    fi
    
    docker --version
    docker-compose --version
ENDSSH

echo -e "${GREEN}✅ Docker installed${NC}"
echo ""

echo -e "${YELLOW}🔥 Step 4/6: Configuring firewall...${NC}"
ssh ${VM_HOST} 'bash -s' << 'ENDSSH'
    # Configure UFW if available
    if command -v ufw &> /dev/null; then
        sudo ufw --force enable
        sudo ufw allow 22/tcp   # SSH
        sudo ufw allow 80/tcp   # HTTP
        sudo ufw allow 443/tcp  # HTTPS
        sudo ufw allow 3000/tcp # Frontend
        sudo ufw allow 4000/tcp # Backend
        echo "Firewall configured"
    else
        echo "UFW not available, skipping firewall configuration"
    fi
ENDSSH

echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

echo -e "${YELLOW}🚀 Step 5/6: Building and starting services...${NC}"
ssh ${VM_HOST} "cd ${REMOTE_DIR} && docker-compose down 2>/dev/null || true && docker-compose up -d --build"

echo -e "${GREEN}✅ Services started${NC}"
echo ""

echo -e "${YELLOW}🔍 Step 6/6: Verifying deployment...${NC}"
sleep 10  # Wait for services to start

# Check service status
echo "Checking service status..."
ssh ${VM_HOST} "cd ${REMOTE_DIR} && docker-compose ps"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Open X is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your application:"
echo "  Frontend:  http://${VM_IP}:3000"
echo "  Backend:   http://${VM_IP}:4000/graphql"
echo "  Health:    http://${VM_IP}:4000/health"
echo ""
echo "Useful commands:"
echo "  View logs:     ssh ${VM_HOST} 'cd ${REMOTE_DIR} && docker-compose logs -f'"
echo "  Restart:       ssh ${VM_HOST} 'cd ${REMOTE_DIR} && docker-compose restart'"
echo "  Stop:          ssh ${VM_HOST} 'cd ${REMOTE_DIR} && docker-compose down'"
echo "  Create admin:  ssh ${VM_HOST} 'cd ${REMOTE_DIR} && docker-compose exec backend npm run create-admin'"
echo ""
echo "Next steps:"
echo "  1. Create admin user (see command above)"
echo "  2. Configure domain name (optional)"
echo "  3. Set up SSL/HTTPS"
echo "  4. Configure backups"
echo ""
