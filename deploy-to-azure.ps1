# Open X - Automated Azure VM Deployment Script (PowerShell)
# Target: azureuser@57.158.26.52

param(
    [switch]$SkipConfirmation
)

$ErrorActionPreference = "Stop"

# Configuration
$VM_IP = "57.158.26.52"
$VM_USER = "azureuser"
$VM_HOST = "${VM_USER}@${VM_IP}"
$REMOTE_DIR = "~/open-x"

Write-Host "🚀 Open X - Azure VM Deployment" -ForegroundColor Green
Write-Host "Target: $VM_HOST"
Write-Host ""

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH not found. Please install OpenSSH client." -ForegroundColor Red
    Write-Host "Install via: Settings > Apps > Optional Features > OpenSSH Client"
    exit 1
}

# Test SSH connection
Write-Host "📡 Testing SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes $VM_HOST "exit" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to $VM_HOST" -ForegroundColor Red
    Write-Host "Please ensure:"
    Write-Host "  1. VM is running"
    Write-Host "  2. SSH key is configured"
    Write-Host "  3. Network allows SSH (port 22)"
    exit 1
}
Write-Host "✅ SSH connection successful" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    
    # Generate JWT secret (Windows compatible)
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $JWT_SECRET = [Convert]::ToBase64String($bytes)
    
    # Update .env file
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'FRONTEND_URL=.*', "FRONTEND_URL=http://${VM_IP}:3000"
    $envContent = $envContent -replace 'NEXT_PUBLIC_API_URL=.*', "NEXT_PUBLIC_API_URL=http://${VM_IP}:4000/graphql"
    $envContent = $envContent -replace 'JWT_SECRET=.*', "JWT_SECRET=$JWT_SECRET"
    $envContent | Set-Content .env
    
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please review .env file before deploying" -ForegroundColor Yellow
    Write-Host ""
}

# Confirm deployment
if (-not $SkipConfirmation) {
    $confirmation = Read-Host "Deploy to $VM_HOST? (y/n)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "Deployment cancelled"
        exit 0
    }
}

Write-Host ""
Write-Host "📤 Step 1/5: Uploading files to server..." -ForegroundColor Yellow

# Create remote directory
ssh $VM_HOST "mkdir -p $REMOTE_DIR"

# Upload files using SCP
Write-Host "Uploading docker-compose.yml..."
scp docker-compose.yml "${VM_HOST}:${REMOTE_DIR}/"

Write-Host "Uploading .env files..."
scp .env.example "${VM_HOST}:${REMOTE_DIR}/"
scp .env "${VM_HOST}:${REMOTE_DIR}/"

Write-Host "Uploading backend..."
scp -r backend "${VM_HOST}:${REMOTE_DIR}/"

Write-Host "Uploading frontend..."
scp -r frontend "${VM_HOST}:${REMOTE_DIR}/"

Write-Host "✅ Files uploaded" -ForegroundColor Green
Write-Host ""

Write-Host "🐳 Step 2/5: Installing Docker..." -ForegroundColor Yellow
ssh $VM_HOST @"
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo 'Installing Docker...'
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker `$USER
        rm get-docker.sh
    else
        echo 'Docker already installed'
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo 'Installing Docker Compose...'
        sudo apt update
        sudo apt install -y docker-compose
    else
        echo 'Docker Compose already installed'
    fi
    
    docker --version
    docker-compose --version
"@

Write-Host "✅ Docker installed" -ForegroundColor Green
Write-Host ""

Write-Host "🔥 Step 3/5: Configuring firewall..." -ForegroundColor Yellow
ssh $VM_HOST @"
    # Configure UFW if available
    if command -v ufw &> /dev/null; then
        sudo ufw --force enable
        sudo ufw allow 22/tcp   # SSH
        sudo ufw allow 80/tcp   # HTTP
        sudo ufw allow 443/tcp  # HTTPS
        sudo ufw allow 3000/tcp # Frontend
        sudo ufw allow 4000/tcp # Backend
        echo 'Firewall configured'
    else
        echo 'UFW not available, skipping firewall configuration'
    fi
"@

Write-Host "✅ Firewall configured" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Step 4/5: Building and starting services..." -ForegroundColor Yellow
ssh $VM_HOST "cd $REMOTE_DIR && docker-compose down 2>/dev/null || true && docker-compose up -d --build"

Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 5/5: Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 10  # Wait for services to start

# Check service status
Write-Host "Checking service status..."
ssh $VM_HOST "cd $REMOTE_DIR && docker-compose ps"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🎉 Open X is now running!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "Access your application:"
Write-Host "  Frontend:  http://${VM_IP}:3000"
Write-Host "  Backend:   http://${VM_IP}:4000/graphql"
Write-Host "  Health:    http://${VM_IP}:4000/health"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  View logs:     ssh $VM_HOST 'cd $REMOTE_DIR && docker-compose logs -f'"
Write-Host "  Restart:       ssh $VM_HOST 'cd $REMOTE_DIR && docker-compose restart'"
Write-Host "  Stop:          ssh $VM_HOST 'cd $REMOTE_DIR && docker-compose down'"
Write-Host "  Create admin:  ssh $VM_HOST 'cd $REMOTE_DIR && docker-compose exec backend npm run create-admin'"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Create admin user (see command above)"
Write-Host "  2. Configure domain name (optional)"
Write-Host "  3. Set up SSL/HTTPS"
Write-Host "  4. Configure backups"
Write-Host ""
