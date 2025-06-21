import React, { useState } from 'react';

const C2Debug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoints = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test basic C2 endpoint
      console.log('Testing /api/c2/test...');
      const testRes = await fetch('/api/c2/test');
      results.test = {
        status: testRes.status,
        ok: testRes.ok,
        contentType: testRes.headers.get('content-type'),
        text: await testRes.text()
      };

      // Test agents endpoint
      console.log('Testing /api/admin/c2/agents...');
      const agentsRes = await fetch('/api/admin/c2/agents');
      results.agents = {
        status: agentsRes.status,
        ok: agentsRes.ok,
        contentType: agentsRes.headers.get('content-type'),
        text: await agentsRes.text()
      };

      // Test results endpoint
      console.log('Testing /api/admin/c2/results...');
      const resultsRes = await fetch('/api/admin/c2/results');
      results.results = {
        status: resultsRes.status,
        ok: resultsRes.ok,
        contentType: resultsRes.headers.get('content-type'),
        text: await resultsRes.text()
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
            <div className="bg-gray-500/10 border border-gray-500/20 rounded p-4">
              <h4 className="text-gray-300 font-semibold">Test Endpoint (/api/c2/test):</h4>
              <pre className="text-gray-300 text-sm">{JSON.stringify(testResults.test, null, 2)}</pre>
            </div>
          )}

          {testResults.agents && (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded p-4">
              <h4 className="text-gray-300 font-semibold">Agents Endpoint (/api/admin/c2/agents):</h4>
              <pre className="text-gray-300 text-sm">{JSON.stringify(testResults.agents, null, 2)}</pre>
            </div>
          )}

          {testResults.results && (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded p-4">
              <h4 className="text-gray-300 font-semibold">Results Endpoint (/api/admin/c2/results):</h4>
              <pre className="text-gray-300 text-sm">{JSON.stringify(testResults.results, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default C2Debug; 