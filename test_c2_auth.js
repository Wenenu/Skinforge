const fetch = require('node-fetch');

const C2_SERVER = 'http://localhost:3002';

// Admin credentials (base64 encoded)
const ADMIN_USERNAME = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASS;
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

async function testEndpoint(endpoint, method = 'GET', body = null, useAuth = false) {
  const url = `${C2_SERVER}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (useAuth) {
    options.headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}${useAuth ? ' (with auth)' : ' (no auth)'}...`);
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const result = {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      data: responseData
    };

    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      console.log(`   Response:`, responseData);
    } else {
      console.log(`❌ ${method} ${endpoint} - Status: ${response.status}`);
      console.log(`   Error:`, responseData);
    }

    return result;
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Network Error:`, error.message);
    return { error: error.message };
  }
}

async function runAuthTests() {
  console.log('🚀 Starting C2 API Authentication Tests...\n');
  console.log(`📡 Server: ${C2_SERVER}`);
  console.log(`🔑 Admin Token: ${ADMIN_TOKEN.substring(0, 20)}...`);
  
  const results = {};

  // Test 1: Basic health check (no auth required)
  results.test = await testEndpoint('/api/c2/test');

  // Test 2: Agents endpoint without auth (should fail)
  results.agentsNoAuth = await testEndpoint('/api/admin/c2/agents');

  // Test 3: Agents endpoint with auth (should succeed)
  results.agentsAuth = await testEndpoint('/api/admin/c2/agents', 'GET', null, true);

  // Test 4: Results endpoint without auth (should fail)
  results.resultsNoAuth = await testEndpoint('/api/admin/c2/results');

  // Test 5: Results endpoint with auth (should succeed)
  results.resultsAuth = await testEndpoint('/api/admin/c2/results', 'GET', null, true);

  // Test 6: Create a test command (with auth)
  results.createCommand = await testEndpoint('/api/admin/c2/command', 'POST', {
    agent_id: 'test-agent-123',
    command_type: 'shell',
    command_data: 'whoami'
  }, true);

  console.log('\n📊 Test Summary:');
  console.log('================');
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${result.status || 'ERROR'}`);
  });

  console.log('\n🎉 Authentication tests completed!');
  
  // Summary of expected behavior
  console.log('\n📋 Expected Behavior:');
  console.log('- /api/c2/test: Should work without auth (200)');
  console.log('- /api/admin/c2/agents (no auth): Should fail (401)');
  console.log('- /api/admin/c2/agents (with auth): Should work (200)');
  console.log('- /api/admin/c2/results (no auth): Should fail (401)');
  console.log('- /api/admin/c2/results (with auth): Should work (200)');
  console.log('- /api/admin/c2/command (with auth): Should work (200)');

  return results;
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runAuthTests().catch(console.error);
}

module.exports = { runAuthTests, testEndpoint }; 