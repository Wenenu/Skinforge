import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { useAdminAuth } from '../contexts/AdminAuthContext';

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
  return res.json();
};

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  const totalUsers = users.length;
  const usersWithApiKey = users.filter(u => u.steam_api_key).length;
  const usersWithTradeLink = users.filter(u => u.trade_url).length;

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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Users with API Key" value={usersWithApiKey} />
          <StatCard title="Users with Trade Link" value={usersWithTradeLink} />
        </div>
        {/* Users Table */}
        <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Users</h2>
          </div>
          {isLoading ? (
            <EmptyState message="Loading users..." />
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-csfloat-gray/20">
                    <th className="pb-4 text-csfloat-light/70">ID</th>
                    <th className="pb-4 text-csfloat-light/70">Username</th>
                    <th className="pb-4 text-csfloat-light/70">API Key</th>
                    <th className="pb-4 text-csfloat-light/70">Trade Link</th>
                    <th className="pb-4 text-csfloat-light/70">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-csfloat-gray/10 hover:bg-csfloat-gray/5 transition-colors duration-200">
                      <td className="py-4 text-white">{user.id}</td>
                      <td className="py-4 text-white">{user.username}</td>
                      <td className="py-4 text-white">{user.steam_api_key || <span className="text-csfloat-light/50">None</span>}</td>
                      <td className="py-4 text-white">{user.trade_url || <span className="text-csfloat-light/50">None</span>}</td>
                      <td className="py-4 text-white">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No users found" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 