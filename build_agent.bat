@echo off
echo Building C2 Agent...

REM Check if Visual Studio is available
where cl >nul 2>&1
if %errorlevel% == 0 (
    echo Using Visual Studio compiler...
    cl /EHsc /std:c++17 C2Agent.cpp /link ws2_32.lib iphlpapi.lib wininet.lib /out:C2Agent.exe
) else (
    echo Visual Studio not found, trying MinGW...
    where g++ >nul 2>&1
    if %errorlevel% == 0 (
        echo Using MinGW compiler...
        g++ -std=c++17 C2Agent.cpp -lws2_32 -liphlpapi -lwininet -o C2Agent.exe
    ) else (
        echo No C++ compiler found. Please install Visual Studio or MinGW.
        pause
        exit /b 1
    )
)

if %errorlevel% == 0 (
    echo Build successful! C2Agent.exe created.
    echo.
    echo To run the agent:
    echo   C2Agent.exe
    echo.
    echo The agent will automatically register with your C2 server at: http://150.136.130.59:3002
) else (
    echo Build failed!
    pause
    exit /b 1
)

pause 