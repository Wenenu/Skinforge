#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002'; // Change this to your server URL

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}...`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${contentType}`);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('Response (JSON):', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response (Text):', text.substring(0, 500));
    }
    
    return { success: response.ok, data, contentType };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting C2 API Tests...\n');
  
  // Test 1: Basic health check
  await testEndpoint('/');
  
  // Test 2: C2 test endpoint
  await testEndpoint('/api/c2/test');
  
  // Test 3: Agents endpoint
  await testEndpoint('/api/admin/c2/agents');
  
  // Test 4: Results endpoint
  await testEndpoint('/api/admin/c2/results');
  
  // Test 5: Create a test command
  await testEndpoint('/api/admin/c2/command', 'POST', {
    agent_id: 'test-agent-123',
    command_type: 'shell',
    command_data: 'whoami'
  });
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error); 