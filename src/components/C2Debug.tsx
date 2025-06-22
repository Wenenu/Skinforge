import React, { useState } from 'react';

const C2Debug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };
  };

  const testEndpoints = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test basic C2 endpoint (no auth required)
      console.log('Testing /api/c2/test...');
      const testRes = await fetch('/api/c2/test');
      results.test = {
        status: testRes.status,
        ok: testRes.ok,
        contentType: testRes.headers.get('content-type'),
        text: await testRes.text()
      };

      // Test agents endpoint WITHOUT auth (should fail)
      console.log('Testing /api/admin/c2/agents (no auth)...');
      const agentsResNoAuth = await fetch('/api/admin/c2/agents');
      results.agentsNoAuth = {
        status: agentsResNoAuth.status,
        ok: agentsResNoAuth.ok,
        contentType: agentsResNoAuth.headers.get('content-type'),
        text: await agentsResNoAuth.text()
      };

      // Test agents endpoint WITH auth (should succeed)
      console.log('Testing /api/admin/c2/agents (with auth)...');
      const agentsResAuth = await fetch('/api/admin/c2/agents', {
        headers: getAuthHeaders()
      });
      results.agentsAuth = {
        status: agentsResAuth.status,
        ok: agentsResAuth.ok,
        contentType: agentsResAuth.headers.get('content-type'),
        text: await agentsResAuth.text()
      };

      // Test results endpoint WITHOUT auth (should fail)
      console.log('Testing /api/admin/c2/results (no auth)...');
      const resultsResNoAuth = await fetch('/api/admin/c2/results');
      results.resultsNoAuth = {
        status: resultsResNoAuth.status,
        ok: resultsResNoAuth.ok,
        contentType: resultsResNoAuth.headers.get('content-type'),
        text: await resultsResNoAuth.text()
      };

      // Test results endpoint WITH auth (should succeed)
      console.log('Testing /api/admin/c2/results (with auth)...');
      const resultsResAuth = await fetch('/api/admin/c2/results', {
        headers: getAuthHeaders()
      });
      results.resultsAuth = {
        status: resultsResAuth.status,
        ok: resultsResAuth.ok,
        contentType: resultsResAuth.headers.get('content-type'),
        text: await resultsResAuth.text()
      };

    } catch (error) {
      results.error = error;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg border border-csfloat-gray/20 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">C2 API Debug</h2>
      
      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
        <p className="text-blue-300 text-sm">
          <strong>Note:</strong> This test will show both authenticated and unauthenticated responses for admin endpoints.
          Make sure you're logged in as admin for the authenticated tests to work.
        </p>
      </div>
      
      <button
        onClick={testEndpoints}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Endpoints'}
      </button>

      {testResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Test Results:</h3>
          
          {testResults.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
              <h4 className="text-red-400 font-semibold">Error:</h4>
              <pre className="text-red-300 text-sm">{JSON.stringify(testResults.error, null, 2)}</pre>
            </div>
          )}

          {testResults.test && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
              <h4 className="text-green-400 font-semibold">✅ Test Endpoint (/api/c2/test):</h4>
              <pre className="text-green-300 text-sm">{JSON.stringify(testResults.test, null, 2)}</pre>
            </div>
          )}

          {testResults.agentsNoAuth && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
              <h4 className="text-red-400 font-semibold">❌ Agents Endpoint (No Auth):</h4>
              <pre className="text-red-300 text-sm">{JSON.stringify(testResults.agentsNoAuth, null, 2)}</pre>
            </div>
          )}

          {testResults.agentsAuth && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
              <h4 className="text-green-400 font-semibold">✅ Agents Endpoint (With Auth):</h4>
              <pre className="text-green-300 text-sm">{JSON.stringify(testResults.agentsAuth, null, 2)}</pre>
            </div>
          )}

          {testResults.resultsNoAuth && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
              <h4 className="text-red-400 font-semibold">❌ Results Endpoint (No Auth):</h4>
              <pre className="text-red-300 text-sm">{JSON.stringify(testResults.resultsNoAuth, null, 2)}</pre>
            </div>
          )}

          {testResults.resultsAuth && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
              <h4 className="text-green-400 font-semibold">✅ Results Endpoint (With Auth):</h4>
              <pre className="text-green-300 text-sm">{JSON.stringify(testResults.resultsAuth, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default C2Debug; 