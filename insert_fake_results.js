const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_password_here', // Replace with your actual password
    database: 'skinforge_db'
};

async function insertFakeResults() {
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Insert fake agents
        const agents = [
            {
                agent_id: 'RUST_AGENT_V1',
                hostname: 'DESKTOP-ABC123',
                username: 'john.doe',
                os_info: 'Windows 10 x64 | CPU: 8 cores | RAM: 16GB',
                ip_address: '192.168.1.100'
            },
            {
                agent_id: 'PYTHON_AGENT_001',
                hostname: 'LAPTOP-XYZ789',
                username: 'jane.smith',
                os_info: 'Windows 11 x64 | CPU: 12 cores | RAM: 32GB',
                ip_address: '192.168.1.101'
            },
            {
                agent_id: 'CPP_AGENT_WIN',
                hostname: 'WORKSTATION-001',
                username: 'admin',
                os_info: 'Windows 10 x64 | CPU: 16 cores | RAM: 64GB',
                ip_address: '192.168.1.102'
            }
        ];

        for (const agent of agents) {
            await connection.execute(
                'INSERT IGNORE INTO c2_agents (agent_id, hostname, username, os_info, ip_address) VALUES (?, ?, ?, ?, ?)',
                [agent.agent_id, agent.hostname, agent.username, agent.os_info, agent.ip_address]
            );
        }
        console.log('Agents inserted');

        // Insert fake commands
        const commands = [
            {
                agent_id: 'RUST_AGENT_V1',
                command_type: 'collect_files',
                command_data: '*.txt|10',
                status: 'completed'
            },
            {
                agent_id: 'RUST_AGENT_V1',
                command_type: 'shell',
                command_data: 'whoami',
                status: 'completed'
            },
            {
                agent_id: 'PYTHON_AGENT_001',
                command_type: 'collect_data',
                command_data: 'system_info',
                status: 'completed'
            },
            {
                agent_id: 'PYTHON_AGENT_001',
                command_type: 'shell',
                command_data: 'ipconfig',
                status: 'completed'
            },
            {
                agent_id: 'CPP_AGENT_WIN',
                command_type: 'screenshot',
                command_data: 'capture_screen',
                status: 'completed'
            },
            {
                agent_id: 'CPP_AGENT_WIN',
                command_type: 'collect_files',
                command_data: '*.pdf|5',
                status: 'failed'
            }
        ];

        const commandIds = [];
        for (const cmd of commands) {
            const [result] = await connection.execute(
                'INSERT INTO c2_commands (agent_id, command_type, command_data, status, created_at, executed_at, completed_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())',
                [cmd.agent_id, cmd.command_type, cmd.command_data, cmd.status]
            );
            commandIds.push(result.insertId);
        }
        console.log('Commands inserted');

        // Insert fake results
        const results = [
            {
                command_id: commandIds[0],
                agent_id: 'RUST_AGENT_V1',
                result_data: JSON.stringify({
                    files_collected: [
                        { filename: 'document1.txt', size: 2048, path: 'C:/Users/john.doe/Documents/document1.txt' },
                        { filename: 'notes.txt', size: 1024, path: 'C:/Users/john.doe/Desktop/notes.txt' },
                        { filename: 'config.txt', size: 512, path: 'C:/Users/john.doe/AppData/config.txt' }
                    ],
                    total_files: 3,
                    total_size: 3584
                }),
                file_path: '/uploads/c2/RUST_AGENT_V1/collected_files.zip',
                file_size: 2048,
                success: true
            },
            {
                command_id: commandIds[1],
                agent_id: 'RUST_AGENT_V1',
                result_data: 'DESKTOP-ABC123\\john.doe',
                success: true
            },
            {
                command_id: commandIds[2],
                agent_id: 'PYTHON_AGENT_001',
                result_data: JSON.stringify({
                    platform: 'Windows-11-10.0.22000-SP0',
                    machine: 'AMD64',
                    processor: 'Intel64 Family 6 Model 142 Stepping 12, GenuineIntel',
                    python_version: '3.9.7',
                    hostname: 'LAPTOP-XYZ789',
                    username: 'jane.smith',
                    ip_address: '192.168.1.101'
                }),
                success: true
            },
            {
                command_id: commandIds[3],
                agent_id: 'PYTHON_AGENT_001',
                result_data: `Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : local
   IPv4 Address. . . . . . . . . . . : 192.168.1.101
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Wireless LAN adapter Wi-Fi:
   Media State . . . . . . . . . . . : Media disconnected`,
                success: true
            },
            {
                command_id: commandIds[4],
                agent_id: 'CPP_AGENT_WIN',
                result_data: 'Screenshot captured successfully',
                file_path: '/uploads/c2/CPP_AGENT_WIN/screenshot_2024-01-15_14-30-25.png',
                file_size: 245760,
                success: true
            },
            {
                command_id: commandIds[5],
                agent_id: 'CPP_AGENT_WIN',
                result_data: '',
                error_message: 'No PDF files found in specified directories',
                success: false
            }
        ];

        for (const result of results) {
            await connection.execute(
                'INSERT INTO c2_results (command_id, agent_id, result_data, file_path, file_size, success, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [result.command_id, result.agent_id, result.result_data, result.file_path, result.file_size, result.success, result.error_message]
            );
        }
        console.log('Results inserted');

        console.log('✅ Fake data inserted successfully!');
        console.log('\n📊 Summary:');
        console.log('- 3 agents registered');
        console.log('- 6 commands executed');
        console.log('- 6 results submitted');
        console.log('\n🌐 You can now view the data in your C2 dashboard at:');
        console.log('https://skinforge.pro/admin (with admin credentials)');

    } catch (error) {
        console.error('❌ Error inserting fake data:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
insertFakeResults(); 