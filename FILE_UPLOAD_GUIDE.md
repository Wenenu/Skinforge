# File Upload Guide for Skinforge VPS

## Step 1: Set up the VPS directories

Run the setup script on your VPS:

```bash
# Make the script executable
chmod +x vps-setup.sh

# Run the setup script
./vps-setup.sh
```

## Step 2: Upload your files

You can upload files using any of these methods:

### Method 1: Using SCP (from your local machine)
```bash
# Upload the client executable
scp SkinforgeClient.exe ubuntu@150.136.130.59:/home/ubuntu/Skinforge/downloads/

# Upload the update file
scp SkinforgeUpdate.exe ubuntu@150.136.130.59:/home/ubuntu/Skinforge/downloads/

# Upload the manual
scp SkinforgeManual.pdf ubuntu@150.136.130.59:/home/ubuntu/Skinforge/downloads/
```

### Method 2: Using SFTP
```bash
# Connect to your VPS
sftp ubuntu@150.136.130.59

# Navigate to the downloads directory
cd /home/ubuntu/Skinforge/downloads

# Upload files
put SkinforgeClient.exe
put SkinforgeUpdate.exe
put SkinforgeManual.pdf

# Exit SFTP
exit
```

### Method 3: Using FileZilla or similar FTP client
- Host: 150.136.130.59
- Username: ubuntu
- Password: Your VPS password
- Navigate to: `/home/ubuntu/Skinforge/downloads/`
- Upload your files

## Step 3: Verify file permissions

After uploading, ensure the files have correct permissions:

```bash
# SSH into your VPS
ssh ubuntu@150.136.130.59

# Check file permissions
ls -la /home/ubuntu/Skinforge/downloads/

# Set correct permissions if needed
sudo chmod 644 /home/ubuntu/Skinforge/downloads/*.exe
sudo chmod 644 /home/ubuntu/Skinforge/downloads/*.pdf
```

## Step 4: Test the download endpoints

Test each endpoint to ensure they work:

### Test the direct download endpoint:
```bash
# Test client download
curl -I https://skinforge.pro/download/SkinforgeClient.exe

# Test update download
curl -I https://skinforge.pro/download/SkinforgeUpdate.exe

# Test manual download
curl -I https://skinforge.pro/download/SkinforgeManual.pdf
```

### Test the API endpoints:
```bash
# Test client API endpoint
curl -I https://skinforge.pro/api/download/client

# Test update API endpoint
curl -I https://skinforge.pro/api/download/update

# Test manual API endpoint
curl -I https://skinforge.pro/api/download/manual
```

## Step 5: Restart your Node.js server

After making changes to the server code:

```bash
# If using PM2
pm2 restart all

# If running directly
# Stop the current server (Ctrl+C) and restart:
node index.js
```

## Step 6: Test the immediate download functionality

1. Clear your browser's localStorage for skinforge.pro
2. Visit https://skinforge.pro
3. The download should start automatically after 2 seconds
4. Check that the `skinforge_app_installed` flag is set in localStorage

## Troubleshooting

### If downloads don't work:
1. Check file permissions: `ls -la /home/ubuntu/Skinforge/downloads/`
2. Check if files exist: `ls /home/ubuntu/Skinforge/downloads/`
3. Check server logs: `pm2 logs` or check your terminal
4. Test direct file access: `curl https://skinforge.pro/download/test.txt`

### If immediate download doesn't trigger:
1. Check browser console for errors
2. Verify the immediateDownload utility is imported correctly
3. Check if localStorage is being cleared properly
4. Test the download manually by visiting `/download/SkinforgeClient.exe`

### Common issues:
- **404 errors**: Files not uploaded or wrong path
- **403 errors**: Permission issues, run the setup script again
- **CORS errors**: Check that the API_BASE_URL is correct in immediateDownload.ts
- **Download doesn't start**: Check browser's download settings and popup blockers

## File Structure

Your VPS should have this structure:
```
/home/ubuntu/
├── Skinforge/
│   ├── downloads/
│   │   ├── SkinforgeClient.exe
│   │   ├── SkinforgeUpdate.exe
│   │   └── SkinforgeManual.pdf
│   └── index.js
└── public/
    └── downloads/ (symbolic link to Skinforge/downloads)
``` 