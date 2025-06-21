#!/bin/bash

# Setup script for download functionality
echo "Setting up download functionality..."

# 1. Create downloads directory (if not exists)
echo "Creating downloads directory..."
mkdir -p downloads

# 2. Set proper permissions for downloads directory
echo "Setting permissions..."
chmod 755 downloads

# 3. Create sample files for testing
echo "Creating sample files..."

# Create a sample executable (empty file for testing)
touch downloads/SkinforgeClient.exe
echo "Sample client executable created"

# Create a sample update file
touch downloads/SkinforgeUpdate.exe
echo "Sample update executable created"

# Create a sample manual
touch downloads/SkinforgeManual.pdf
echo "Sample manual PDF created"

# 4. Set proper permissions for files
chmod 644 downloads/*

echo "Download setup complete!"
echo ""
echo "Available download endpoints:"
echo "- /api/download/client (SkinforgeClient.exe)"
echo "- /api/download/update (SkinforgeUpdate.exe)"
echo "- /api/download/manual (SkinforgeManual.pdf)"
echo "- /api/download/test.txt (Test file)"
echo "- /api/download/:filename (Generic file download)"
echo ""
echo "Mobile compatibility features:"
echo "- Automatic mobile detection"
echo "- Proper content-type headers"
echo "- Mobile-friendly download handling"
echo "- Progress tracking support"
echo "- Error handling and user feedback"
echo ""
echo "To test the download functionality:"
echo "1. Start your server: npm start"
echo "2. Visit: http://localhost:3002/api/download/test.txt"
echo "3. Test on mobile devices"
echo ""
echo "The system is now ready for file downloads!" 