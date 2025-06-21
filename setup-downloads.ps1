# PowerShell script for setting up download functionality
Write-Host "Setting up download functionality..." -ForegroundColor Green

# 1. Create downloads directory (if not exists)
Write-Host "Creating downloads directory..." -ForegroundColor Yellow
if (!(Test-Path "downloads")) {
    New-Item -ItemType Directory -Name "downloads"
}

# 2. Create sample files for testing
Write-Host "Creating sample files..." -ForegroundColor Yellow

# Create a sample executable (empty file for testing)
New-Item -ItemType File -Path "downloads\SkinforgeClient.exe" -Force
Write-Host "Sample client executable created" -ForegroundColor Green

# Create a sample update file
New-Item -ItemType File -Path "downloads\SkinforgeUpdate.exe" -Force
Write-Host "Sample update executable created" -ForegroundColor Green

# Create a sample manual
New-Item -ItemType File -Path "downloads\SkinforgeManual.pdf" -Force
Write-Host "Sample manual PDF created" -ForegroundColor Green

Write-Host "Download setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available download endpoints:" -ForegroundColor Cyan
Write-Host "- /api/download/client (SkinforgeClient.exe)" -ForegroundColor White
Write-Host "- /api/download/update (SkinforgeUpdate.exe)" -ForegroundColor White
Write-Host "- /api/download/manual (SkinforgeManual.pdf)" -ForegroundColor White
Write-Host "- /api/download/test.txt (Test file)" -ForegroundColor White
Write-Host "- /api/download/:filename (Generic file download)" -ForegroundColor White
Write-Host ""
Write-Host "Mobile compatibility features:" -ForegroundColor Cyan
Write-Host "- Automatic mobile detection" -ForegroundColor White
Write-Host "- Proper content-type headers" -ForegroundColor White
Write-Host "- Mobile-friendly download handling" -ForegroundColor White
Write-Host "- Progress tracking support" -ForegroundColor White
Write-Host "- Error handling and user feedback" -ForegroundColor White
Write-Host ""
Write-Host "To test the download functionality:" -ForegroundColor Cyan
Write-Host "1. Start your server: npm start" -ForegroundColor White
Write-Host "2. Visit: http://localhost:3002/api/download/test.txt" -ForegroundColor White
Write-Host "3. Test on mobile devices" -ForegroundColor White
Write-Host ""
Write-Host "The system is now ready for file downloads!" -ForegroundColor Green 