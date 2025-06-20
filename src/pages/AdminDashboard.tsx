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

interface PageVisitSummary {
  totalVisits: number;
  todayVisits: number;
  topPages: Array<{
    page_path: string;
    count: number;
  }>;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageStats, setPageStats] = useState<PageVisitSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users and page stats in parallel
        const [usersResponse, statsResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/page-visits-summary')
        ]);

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch page stats');
        }

        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();

        setUsers(usersData);
        setPageStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 text-white bg-csfloat-darker min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading && <p>Loading data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && (
        <>
          {/* Page Visit Statistics */}
          {pageStats && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Page Visit Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-csfloat-dark p-4 rounded-lg border border-csfloat-gray/20">
                  <h3 className="text-lg font-medium text-gray-300">Total Visits</h3>
                  <p className="text-3xl font-bold text-csfloat-blue">{pageStats.totalVisits}</p>
                </div>
                <div className="bg-csfloat-dark p-4 rounded-lg border border-csfloat-gray/20">
                  <h3 className="text-lg font-medium text-gray-300">Today's Visits</h3>
                  <p className="text-3xl font-bold text-green-500">{pageStats.todayVisits}</p>
                </div>
                <div className="bg-csfloat-dark p-4 rounded-lg border border-csfloat-gray/20">
                  <h3 className="text-lg font-medium text-gray-300">Total Users</h3>
                  <p className="text-3xl font-bold text-purple-500">{users.length}</p>
                </div>
              </div>
              
              <div className="bg-csfloat-dark p-4 rounded-lg border border-csfloat-gray/20">
                <h3 className="text-lg font-medium text-gray-300 mb-3">Top Pages</h3>
                <div className="space-y-2">
                  {pageStats.topPages.map((page, index) => (
                    <div key={page.page_path} className="flex justify-between items-center">
                      <span className="text-gray-300">{page.page_path}</span>
                      <span className="text-csfloat-blue font-medium">{page.count} visits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
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
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 