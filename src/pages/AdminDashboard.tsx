import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  steam_id: string;
  api_key: string | null;
  trade_url: string | null;
  app_installed: boolean;
  created_at: string;
  last_login: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://150.136.130.59:3002/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 text-white bg-csfloat-darker min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-csfloat-dark border border-csfloat-gray/20">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-csfloat-gray/20 text-left">Steam ID</th>
                <th className="py-2 px-4 border-b border-csfloat-gray/20 text-left">API Key</th>
                <th className="py-2 px-4 border-b border-csfloat-gray/20 text-left">Trade URL</th>
                <th className="py-2 px-4 border-b border-csfloat-gray/20 text-left">App Installed</th>
                <th className="py-2 px-4 border-b border-csfloat-gray/20 text-left">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b border-csfloat-gray/20">{user.steam_id}</td>
                  <td className="py-2 px-4 border-b border-csfloat-gray/20">{user.api_key ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b border-csfloat-gray/20">{user.trade_url ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b border-csfloat-gray/20">{user.app_installed ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b border-csfloat-gray/20">{new Date(user.last_login).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 