// Example backend endpoint for file downloads
// This should be added to your existing backend server

const express = require('express');
const path = require('path');
const fs = require('fs');

// Download client executable
app.get('/api/download/client', (req, res) => {
  const filePath = path.join(__dirname, 'downloads', 'SkinforgeClient.exe');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set headers for file download
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="SkinforgeClient.exe"');
  res.setHeader('Content-Length', fs.statSync(filePath).size);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Download update file
app.get('/api/download/update', (req, res) => {
  const filePath = path.join(__dirname, 'downloads', 'SkinforgeUpdate.exe');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Update file not found' });
  }
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="SkinforgeUpdate.exe"');
  res.setHeader('Content-Length', fs.statSync(filePath).size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Download manual/documentation
app.get('/api/download/manual', (req, res) => {
  const filePath = path.join(__dirname, 'downloads', 'SkinforgeManual.pdf');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Manual not found' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="SkinforgeManual.pdf"');
  res.setHeader('Content-Length', fs.statSync(filePath).size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Generic file download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'downloads', filename);
  
  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  // Set appropriate content type based on file extension
  const contentTypes = {
    '.exe': 'application/octet-stream',
    '.zip': 'application/zip',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.json': 'application/json'
  };
  
  res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stats.size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}); 