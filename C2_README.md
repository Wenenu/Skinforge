# C2 Command & Control System

This document describes the C2 (Command & Control) functionality that has been integrated into the admin panel.

## ⚠️ IMPORTANT SECURITY NOTICE

**This C2 system is for educational purposes and authorized penetration testing only.**
- Only use in controlled, authorized environments
- Ensure you have proper authorization before testing
- Do not use against systems you don't own or have explicit permission to test
- This system is not designed for production use

## Overview

The C2 system allows you to:
- Register and manage agents (target systems)
- Send commands to agents remotely
- Collect and view command results
- **Upload and download files**
- **Collect system data and information**
- **Bulk data collection and file uploads**
- Monitor agent status and activity

## Features

### Agent Management
- **Agent Registration**: Agents automatically register with system information
- **Status Tracking**: Monitor agent status (active, inactive, compromised)
- **System Information**: View hostname, username, OS, and IP address

### Command Types
- **Shell Commands**: Execute system commands
- **File Downloads**: Download files from URLs
- **File Uploads**: Upload files from agents to C2 server
- **Screenshots**: Capture screen images (placeholder implementation)
- **Keylogging**: Capture keystrokes (placeholder implementation)
- **Persistence**: Maintain access (placeholder implementation)
- **Data Collection**: Collect system information and data
- **File Collection**: Collect files matching patterns

### File & Data Management
- **File Upload**: Agents can upload files to the C2 server
- **File Download**: Download uploaded files from the admin interface
- **Data Collection**: Collect system information, environment variables, network data
- **Bulk Operations**: Upload multiple files and data in single requests
- **File Storage**: Organized file storage by agent ID

### Real-time Monitoring
- Live agent status updates
- Command execution tracking
- Result collection and display
- Success/failure rate monitoring
- File upload/download tracking

## Setup Instructions

### 1. Server Setup
The C2 functionality is already integrated into your existing server. The database tables will be created automatically when the server starts.

### 2. Access the C2 Dashboard
1. Navigate to your admin panel: `/admin`
2. Login with admin credentials
3. Click on the "C2 Command Center" tab

### 3. Testing with the Example Agent

#### Prerequisites
```bash
pip install requests
```

#### Running the Agent
1. Update the server URL in `agent_example.py`:
   ```python
   SERVER_URL = "http://your-server-ip:3002"  # Change this
   ```

2. Run the agent:
   ```bash
   python agent_example.py
   ```

3. The agent will:
   - Generate a unique agent ID
   - Register with the C2 server
   - Start polling for commands every 5 seconds
   - Execute received commands and submit results
   - Support file uploads and data collection

## Usage Guide

### 1. Viewing Agents
- Navigate to the "Agents" tab in the C2 dashboard
- View all registered agents and their status
- Monitor last seen timestamps

### 2. Sending Commands
1. Go to the "Commands" tab
2. Select an active agent from the dropdown
3. Choose a command type
4. Enter the command data:
   - **Shell**: Enter shell command (e.g., `dir`, `ls`, `whoami`)
   - **Download**: Enter `url|local_path` (e.g., `https://example.com/file.txt|/tmp/file.txt`)
   - **Upload**: Enter local file path (e.g., `/etc/passwd`, `C:\Windows\System32\drivers\etc\hosts`)
   - **Collect Data**: No input needed - collects system information
   - **Collect Files**: Enter `pattern|max_files` (e.g., `*.txt|5`, `*.log|10`)
   - **Screenshot**: Leave empty or enter any text
5. Click "Send Command"

### 3. Viewing Results
- Go to the "Results" tab
- View all command execution results
- See success/failure status
- View command output and error messages
- **Download uploaded files** using the Download button
- **View collected data** using the View Data button

### 4. File Management
- **Uploaded files** are stored in `uploads/c2/{agent_id}/` directory
- **Download files** directly from the results interface
- **File size limits**: 1MB per file for collection operations
- **Supported formats**: Any file type (binary/text)

### 5. Data Collection
- **System Information**: Platform, machine, processor, Python version
- **Network Information**: Hostname, IP address, FQDN
- **Environment Variables**: All system environment variables
- **File Collections**: Multiple files matching patterns
- **Timestamps**: All data includes collection timestamps

## API Endpoints

### Agent Endpoints
- `POST /api/c2/register` - Register a new agent
- `GET /api/c2/commands/:agent_id` - Get pending commands for an agent
- `POST /api/c2/result` - Submit command result
- `POST /api/c2/upload/:agent_id` - Upload a file
- `POST /api/c2/data/:agent_id` - Submit collected data
- `POST /api/c2/bulk-upload/:agent_id` - Bulk upload files and data

### Admin Endpoints
- `GET /api/admin/c2/agents` - Get all agents
- `POST /api/admin/c2/command` - Create a new command
- `GET /api/admin/c2/results` - Get all command results
- `GET /api/admin/c2/agent/:agent_id` - Get agent details
- `GET /api/admin/c2/download/:agent_id/:filename` - Download uploaded file
- `GET /api/admin/c2/data/:agent_id/:data_type` - Get collected data by type

## Database Schema

### c2_agents
- `id`: Primary key
- `agent_id`: Unique agent identifier
- `hostname`: System hostname
- `username`: Current user
- `os_info`: Operating system information
- `ip_address`: Agent IP address
- `last_seen`: Last communication timestamp
- `status`: Agent status (active/inactive/compromised)

### c2_commands
- `id`: Primary key
- `agent_id`: Target agent
- `command_type`: Type of command
- `command_data`: Command payload
- `status`: Execution status
- `result`: Command result
- `created_at`: Command creation time
- `executed_at`: Execution start time
- `completed_at`: Completion time

### c2_results
- `id`: Primary key
- `command_id`: Associated command
- `agent_id`: Agent that executed the command
- `result_data`: Command output or collected data (JSON)
- `file_path`: Path to uploaded/downloaded file
- `file_size`: File size in bytes
- `success`: Execution success status
- `error_message`: Error details if failed

## Enhanced Agent Features

### File Operations
```python
# Upload a file
agent.upload_file('/path/to/file.txt')

# Download a file
agent.download_file('https://example.com/file.txt', '/local/path/file.txt')

# Collect files by pattern
agent.collect_files_by_pattern('*.txt', max_files=10)
```

### Data Collection
```python
# Collect system data
system_data = agent.collect_system_data()

# Submit custom data
agent.submit_data_collection('custom_type', {'key': 'value'})

# Bulk upload
agent.bulk_upload(
    files=[{'filename': 'file1.txt', 'data': 'base64_data'}],
    data_collection=[{'type': 'custom', 'content': {'key': 'value'}}]
)
```

### Command Examples
```bash
# Shell commands
whoami
dir
ls -la
ipconfig
ifconfig

# File operations
/etc/passwd
C:\Windows\System32\drivers\etc\hosts
*.txt|5
*.log|10

# Data collection
(no input needed for collect_data)
```

## Security Considerations

### Network Security
- Use HTTPS in production
- Implement proper authentication
- Use firewalls to restrict access
- Monitor network traffic

### Agent Security
- Agents should use secure communication
- Implement command validation
- Add rate limiting
- Use encryption for sensitive data
- **File size limits** prevent abuse
- **File type validation** for uploads

### Server Security
- Secure the admin interface
- Implement proper access controls
- Regular security updates
- Monitor for unauthorized access
- **File storage security** - restrict access to uploads directory
- **Data sanitization** for collected information

## Customization

### Adding New Command Types
1. Update the database schema to include new command types
2. Modify the agent to handle new commands
3. Update the admin interface to support new types

### Enhanced Agent Features
- Add encryption for command/result data
- Implement stealth techniques
- Add persistence mechanisms
- Include anti-detection features
- **Custom data collectors** for specific information
- **File encryption** for sensitive uploads
- **Compression** for large file collections

### File Handling Extensions
- **File compression** for large uploads
- **Incremental uploads** for very large files
- **File integrity checks** (MD5/SHA256)
- **Encrypted file storage**
- **File metadata collection**

## Troubleshooting

### Common Issues

**Agent won't register:**
- Check server URL and port
- Verify network connectivity
- Check server logs for errors

**Commands not executing:**
- Verify agent is running and connected
- Check command format
- Review agent logs

**Results not appearing:**
- Check agent is submitting results correctly
- Verify database connectivity
- Check admin interface refresh

**File uploads failing:**
- Check file permissions on agent
- Verify file exists and is readable
- Check server storage space
- Review file size limits

**Data collection issues:**
- Verify agent has necessary permissions
- Check for encoding issues in collected data
- Review JSON formatting

### Debug Mode
Enable debug logging in the agent by adding:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### File Storage
- Files are stored in `uploads/c2/{agent_id}/` directory
- Each agent has its own subdirectory
- Files are named as uploaded
- Check disk space regularly

## Legal and Ethical Use

Remember:
- Only use on systems you own or have explicit permission to test
- Follow all applicable laws and regulations
- Respect privacy and data protection requirements
- Use responsibly and ethically
- **Be careful with collected data** - it may contain sensitive information
- **Secure file storage** - uploaded files may contain sensitive data

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server and agent logs
3. Verify network connectivity
4. Ensure proper authorization
5. Check file permissions and storage space

---

**This system is for educational purposes. Use responsibly and legally.** 