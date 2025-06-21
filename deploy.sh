#!/bin/bash

echo "=== Skinforge Deployment Script ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the VPS
if [[ "$(hostname)" == "sf" ]] || [[ "$(hostname)" == *"ubuntu"* ]]; then
    print_status "Running on VPS: $(hostname)"
else
    print_error "This script should be run on the VPS, not locally!"
    exit 1
fi

print_status "Starting deployment..."

# Step 1: Set up file hosting directories
print_status "Setting up file hosting directories..."
chmod +x vps-setup.sh
./vps-setup.sh

# Step 2: Check if files exist
print_status "Checking for required files..."
if [ ! -f "/home/ubuntu/Skinforge/downloads/SkinforgeClient.exe" ]; then
    print_warning "SkinforgeClient.exe not found in downloads directory"
    print_warning "Please upload your files using the methods described in FILE_UPLOAD_GUIDE.md"
fi

if [ ! -f "/home/ubuntu/Skinforge/downloads/SkinforgeUpdate.exe" ]; then
    print_warning "SkinforgeUpdate.exe not found in downloads directory"
fi

if [ ! -f "/home/ubuntu/Skinforge/downloads/SkinforgeManual.pdf" ]; then
    print_warning "SkinforgeManual.pdf not found in downloads directory"
fi

# Step 3: Update nginx configuration
print_status "Updating nginx configuration..."
if [ -f "/etc/nginx/sites-available/skinforge.pro" ]; then
    sudo cp nginx-config.conf /etc/nginx/sites-available/skinforge.pro
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "Nginx configuration updated and reloaded"
    else
        print_error "Nginx configuration test failed!"
        exit 1
    fi
else
    print_warning "Nginx site configuration not found at /etc/nginx/sites-available/skinforge.pro"
    print_warning "Please manually copy nginx-config.conf to your nginx configuration"
fi

# Step 4: Restart Node.js server
print_status "Restarting Node.js server..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    print_status "PM2 processes restarted"
else
    print_warning "PM2 not found. Please restart your Node.js server manually:"
    print_warning "node index.js"
fi

# Step 5: Test endpoints
print_status "Testing download endpoints..."
echo "Testing direct download endpoint..."
curl -I https://skinforge.pro/download/test.txt 2>/dev/null | head -1

echo "Testing API download endpoint..."
curl -I https://skinforge.pro/api/download/client 2>/dev/null | head -1

print_status "Deployment complete!"
print_status ""
print_status "Next steps:"
print_status "1. Upload your files to /home/ubuntu/Skinforge/downloads/"
print_status "2. Test the immediate download by visiting https://skinforge.pro"
print_status "3. Check browser console for any errors"
print_status ""
print_status "For troubleshooting, see FILE_UPLOAD_GUIDE.md" 