#!/bin/bash

echo "=== Skinforge VPS File Hosting Setup ==="

# Create necessary directories
echo "Creating download directories..."
sudo mkdir -p /home/ubuntu/Skinforge/downloads
sudo mkdir -p /home/ubuntu/public/downloads

# Set proper ownership
echo "Setting ownership..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/Skinforge/downloads
sudo chown -R ubuntu:ubuntu /home/ubuntu/public/downloads

# Set proper permissions
echo "Setting permissions..."
sudo chmod -R 755 /home/ubuntu/Skinforge/downloads
sudo chmod -R 755 /home/ubuntu/public/downloads

# Create symbolic link for nginx access
echo "Creating symbolic link..."
sudo ln -sf /home/ubuntu/Skinforge/downloads/* /home/ubuntu/public/downloads/ 2>/dev/null || true

# Create a sample file for testing
echo "Creating sample file for testing..."
echo "This is a test file for Skinforge downloads" > /home/ubuntu/Skinforge/downloads/test.txt

echo ""
echo "=== Setup Complete ==="
echo ""
echo "File hosting directories created:"
echo "- /home/ubuntu/Skinforge/downloads/ (main directory)"
echo "- /home/ubuntu/public/downloads/ (nginx accessible)"
echo ""
echo "To upload your files:"
echo "1. Upload SkinforgeClient.exe to /home/ubuntu/Skinforge/downloads/"
echo "2. Upload SkinforgeUpdate.exe to /home/ubuntu/Skinforge/downloads/"
echo "3. Upload SkinforgeManual.pdf to /home/ubuntu/Skinforge/downloads/"
echo ""
echo "Files will be accessible at:"
echo "- https://skinforge.pro/download/SkinforgeClient.exe"
echo "- https://skinforge.pro/download/SkinforgeUpdate.exe"
echo "- https://skinforge.pro/download/SkinforgeManual.pdf"
echo ""
echo "Test the setup by visiting:"
echo "https://skinforge.pro/download/test.txt" 