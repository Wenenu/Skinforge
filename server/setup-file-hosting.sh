#!/bin/bash

# Setup script for file hosting on VPS
echo "Setting up file hosting for Skinforge..."

# Create downloads directory
sudo mkdir -p /home/ubuntu/public/downloads
sudo mkdir -p /home/ubuntu/Skinforge/downloads

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/public/downloads
sudo chmod -R 755 /home/ubuntu/public/downloads
sudo chown -R ubuntu:ubuntu /home/ubuntu/Skinforge/downloads
sudo chmod -R 755 /home/ubuntu/Skinforge/downloads

# Create symbolic link for easier access
sudo ln -sf /home/ubuntu/Skinforge/downloads/* /home/ubuntu/public/downloads/

echo "File hosting directories created!"
echo "Upload your files to: /home/ubuntu/Skinforge/downloads/"
echo "Files will be accessible at: https://skinforge.pro/downloads/" 