import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import C2Dashboard from './C2Dashboard';

interface User {
  id: number;
  steam_id: string;
  steam_api_key: string | null;
  trade_url: string | null;
  app_installed: boolean;
  username: string;
  created_at: string;
  last_login: string;
}

interface PageVisitSummary {
  totalVisits: number;
  todayVisits: number;
  topPages: Array<{
    page_path: string;
    count: number;
  }>;
}

interface ApiKeyLog {
  timestamp: string;
  steamId: string;
  success: boolean;
  error: string | null;
}

interface SiteStats {
  totalUsers: number;
  activeRentals: number;
  totalRevenue: number;
  averageDailyRentals: number;
  apiKeyGenerationSuccess: number;
  apiKeyGenerationFailed: number;
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <svg className="w-16 h-16 text-csfloat-gray/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="text-csfloat-light/60">{message}</p>
  </div>
);

const StatCard = ({ title, value, isPercentage = false, isError = false }: { title: string; value: number | string; isPercentage?: boolean; isError?: boolean }) => (
  <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 hover:border-csfloat-blue transition-colors duration-200">
    <h3 className="text-csfloat-light/70 text-sm mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${isError ? 'text-red-500' : 'text-white'}`}>
      {isPercentage ? `${value}%` : value}
    </p>
  </div>
);

const fetchUsers = async () => {
  const res = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'x-admin-token': 'supersecretadmintoken' },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const fetchPageStats = async () => {
  const res = await fetch('http://localhost:3000/api/admin/page-visits-summary', {
    headers: { 'x-admin-token': 'supersecretadmintoken' },
  });
  if (!res.ok) throw new Error('Failed to fetch page stats');
  return res.json();
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageStats, setPageStats] = useState<PageVisitSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'c2'>('dashboard');
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersData, statsData] = await Promise.all([
          fetchUsers(),
          fetchPageStats()
        ]);
        setUsers(usersData);
        setPageStats(statsData);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        // Optionally, set an error state here to show in the UI
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUsers = users.length;

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-csfloat-darker to-black pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'dashboard', label: 'Platform Dashboard' },
            { id: 'c2', label: 'C2 Command Center' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'c2')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-csfloat-blue text-white'
                  : 'text-csfloat-light/70 hover:text-white hover:bg-csfloat-gray/20'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue"></div>
              </div>
            ) : (
              <>
                {/* Page Visit Statistics */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-white">Page Visit Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total Visits" value={pageStats?.totalVisits ?? 0} />
                    <StatCard title="Today's Visits" value={pageStats?.todayVisits ?? 0} />
                    <StatCard title="Total Users" value={totalUsers} />
                  </div>
                  {pageStats && (
                    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                      <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Top Pages</h3>
                      <div className="space-y-2">
                        {pageStats.topPages.map((page) => (
                          <div key={page.page_path} className="flex justify-between items-center text-sm">
                            <span className="text-csfloat-light/80">{page.page_path}</span>
                            <span className="text-white font-medium">{page.count} visits</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Registered Users */}
                <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Registered Users</h2>
                  </div>
                  {users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-csfloat-gray/20">
                            <th className="pb-4 text-csfloat-light/70">Steam ID</th>
                            <th className="pb-4 text-csfloat-light/70">API Key</th>
                            <th className="pb-4 text-csfloat-light/70">Trade URL</th>
                            <th className="pb-4 text-csfloat-light/70">App Installed</th>
                            <th className="pb-4 text-csfloat-light/70">Last Login</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-csfloat-gray/10 hover:bg-csfloat-gray/5 transition-colors duration-200">
                              <td className="py-4 text-white">{user.steam_id}</td>
                              <td className="py-4 text-white">{user.steam_api_key ? 'Yes' : <span className="text-csfloat-light/50">No</span>}</td>
                              <td className="py-4 text-white">{user.trade_url ? 'Yes' : <span className="text-csfloat-light/50">No</span>}</td>
                              <td className="py-4 text-white">{user.app_installed ? 'Yes' : <span className="text-csfloat-light/50">No</span>}</td>
                              <td className="py-4 text-white">{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState message="No users found" />
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* C2 Tab */}
        {activeTab === 'c2' && <C2Dashboard />}
      </div>
    </div>
  );
};

export default AdminPanel; 