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

interface DetailedAnalytics {
  hourlyVisits: Array<{ hour: number; count: number }>;
  dailyVisits: Array<{ date: string; count: number }>;
  uniqueVisitorsToday: number;
  uniqueVisitorsTotal: number;
  activeHours: Array<{ hour: number; count: number }>;
  referrerStats: Array<{ source: string; count: number }>;
  deviceStats: Array<{ device_type: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  growthTrend: Array<{ date: string; visits: number; unique_visitors: number }>;
}

interface UserEngagement {
  userStats: {
    total_users: number;
    users_with_api_key: number;
    users_with_trade_url: number;
    users_with_app: number;
    active_users_7d: number;
    active_users_30d: number;
    new_users_7d: number;
    new_users_30d: number;
  };
  registrationTrend: Array<{ date: string; count: number }>;
  loginTrend: Array<{ date: string; count: number }>;
}

interface PagePerformance {
  pagePerformance: Array<{
    page_path: string;
    total_visits: number;
    unique_visitors: number;
    days_visited: number;
    first_visit: string;
    last_visit: string;
    avg_daily_visits: number;
  }>;
  bounceRate: Array<{
    page_path: string;
    total_visits: number;
    single_page_visits: number;
    bounce_rate: number;
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

interface RealTimeAnalytics {
  activeUsers: number;
  recentVisits: Array<{
    page_path: string;
    ip_address: string;
    visited_at: string;
    user_agent: string;
  }>;
  hourlyTrend: Array<{
    hour: number;
    visits: number;
    unique_visitors: number;
  }>;
  topPagesToday: Array<{
    page_path: string;
    visits: number;
    unique_visitors: number;
  }>;
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <svg className="w-16 h-16 text-csfloat-gray/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="text-csfloat-light/60">{message}</p>
  </div>
);

const StatCard = ({ title, value, subtitle, isPercentage = false, isError = false, trend = null }: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  isPercentage?: boolean; 
  isError?: boolean;
  trend?: { value: number; isPositive: boolean } | null;
}) => (
  <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 hover:border-csfloat-blue transition-colors duration-200">
    <h3 className="text-csfloat-light/70 text-sm mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${isError ? 'text-red-500' : 'text-white'}`}>
      {isPercentage ? `${value}%` : value}
    </p>
    {subtitle && <p className="text-csfloat-light/50 text-sm mt-1">{subtitle}</p>}
    {trend && (
      <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <svg className={`w-4 h-4 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        {trend.value}%
      </div>
    )}
  </div>
);

const SimpleChart = ({ data, title, height = 200 }: { data: Array<{ [key: string]: any }>; title: string; height?: number }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">{title}</h3>
        <EmptyState message="No data available" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count || 0));
  
  return (
    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
      <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">{title}</h3>
      <div className="flex items-end justify-between h-32 space-x-1">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-csfloat-blue rounded-t w-full transition-all duration-300 hover:bg-blue-400"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-csfloat-light/60 mt-2 text-center">
                {item.hour !== undefined ? `${item.hour}:00` : 
                 item.date ? new Date(item.date).toLocaleDateString() : 
                 item.source || item.page_path}
              </span>
              <span className="text-xs text-csfloat-light/80 mt-1">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const fetchUsers = async (adminToken: string) => {
  const res = await fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const fetchPageStats = async (adminToken: string) => {
  const res = await fetch('/api/admin/page-visits-summary', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch page stats');
  return res.json();
};

const fetchDetailedAnalytics = async (adminToken: string) => {
  const res = await fetch('/api/admin/analytics/detailed', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch detailed analytics');
  return res.json();
};

const fetchUserEngagement = async (adminToken: string) => {
  const res = await fetch('/api/admin/analytics/user-engagement', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user engagement');
  return res.json();
};

const fetchPagePerformance = async (adminToken: string) => {
  const res = await fetch('/api/admin/analytics/page-performance', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch page performance');
  return res.json();
};

const fetchRealTimeAnalytics = async (adminToken: string) => {
  const res = await fetch('/api/admin/analytics/realtime', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch real-time analytics');
  return res.json();
};

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageStats, setPageStats] = useState<PageVisitSummary | null>(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState<DetailedAnalytics | null>(null);
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(null);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance | null>(null);
  const [realTimeAnalytics, setRealTimeAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'c2'>('dashboard');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'overview' | 'users' | 'pages' | 'enhanced'>('overview');
  const { adminLogout, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const fetchData = async (isRefresh = false) => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('No admin token found');
      }

      const [usersData, statsData, detailedData, engagementData, performanceData, realTimeData] = await Promise.all([
        fetchUsers(adminToken),
        fetchPageStats(adminToken),
        fetchDetailedAnalytics(adminToken),
        fetchUserEngagement(adminToken),
        fetchPagePerformance(adminToken),
        fetchRealTimeAnalytics(adminToken)
      ]);
      setUsers(usersData);
      setPageStats(statsData);
      setDetailedAnalytics(detailedData);
      setUserEngagement(engagementData);
      setPagePerformance(performanceData);
      setRealTimeAnalytics(realTimeData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      // Set empty data to show the UI even if API fails
      setUsers([]);
      setPageStats({
        totalVisits: 0,
        todayVisits: 0,
        topPages: []
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdminAuthenticated]);

  const totalUsers = users.length;

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementRate = () => {
    if (!userEngagement?.userStats) return 0;
    const { active_users_7d, total_users } = userEngagement.userStats;
    return total_users > 0 ? Math.round((active_users_7d / total_users) * 100) : 0;
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Redirect to login if not authenticated
  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-csfloat-darker to-black pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-csfloat-light/70 text-sm mt-1">
              Last updated: {formatLastUpdated()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-csfloat-blue hover:bg-blue-600 disabled:bg-csfloat-gray/50 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
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
                {/* Analytics Tabs */}
                <div className="flex space-x-1 mb-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'users', label: 'User Analytics' },
                    { id: 'pages', label: 'Page Analytics' },
                    { id: 'enhanced', label: 'Enhanced Analytics' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAnalyticsTab(tab.id as 'overview' | 'users' | 'pages' | 'enhanced')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeAnalyticsTab === tab.id
                          ? 'bg-csfloat-blue text-white'
                          : 'text-csfloat-light/70 hover:text-white hover:bg-csfloat-gray/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeAnalyticsTab === 'overview' && (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatCard 
                        title="Total Visits" 
                        value={pageStats?.totalVisits ?? 0}
                        subtitle="All time"
                      />
                      <StatCard 
                        title="Today's Visits" 
                        value={pageStats?.todayVisits ?? 0}
                        subtitle="Unique visitors"
                      />
                      <StatCard 
                        title="Total Users" 
                        value={totalUsers}
                        subtitle="Registered users"
                      />
                      <StatCard 
                        title="Unique Visitors" 
                        value={detailedAnalytics?.uniqueVisitorsTotal ?? 0}
                        subtitle="All time"
                      />
                    </div>

                    {/* User Engagement Metrics */}
                    {userEngagement && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                          title="Active Users (7d)" 
                          value={userEngagement.userStats.active_users_7d}
                          subtitle={`${getEngagementRate()}% engagement`}
                        />
                        <StatCard 
                          title="New Users (7d)" 
                          value={userEngagement.userStats.new_users_7d}
                          subtitle="This week"
                        />
                        <StatCard 
                          title="API Key Users" 
                          value={userEngagement.userStats.users_with_api_key}
                          subtitle={`${Math.round((userEngagement.userStats.users_with_api_key / userEngagement.userStats.total_users) * 100)}% of total`}
                        />
                        <StatCard 
                          title="App Users" 
                          value={userEngagement.userStats.users_with_app}
                          subtitle={`${Math.round((userEngagement.userStats.users_with_app / userEngagement.userStats.total_users) * 100)}% of total`}
                        />
                      </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {detailedAnalytics && (
                        <>
                          <SimpleChart 
                            data={detailedAnalytics.hourlyVisits} 
                            title="Today's Hourly Visits" 
                          />
                          <SimpleChart 
                            data={detailedAnalytics.dailyVisits} 
                            title="Last 7 Days Visits" 
                          />
                        </>
                      )}
                    </div>

                    {/* Top Pages */}
                    {pageStats && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Top Pages</h3>
                        <div className="space-y-2">
                          {pageStats.topPages.map((page, index) => (
                            <div key={page.page_path} className="flex justify-between items-center text-sm">
                              <div className="flex items-center">
                                <span className="text-csfloat-light/50 w-6">{index + 1}.</span>
                                <span className="text-csfloat-light/80">{page.page_path}</span>
                              </div>
                              <span className="text-white font-medium">{page.count} visits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traffic Sources */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Traffic Sources</h3>
                        <div className="space-y-2">
                          {detailedAnalytics.referrerStats.map((source) => (
                            <div key={source.source} className="flex justify-between items-center text-sm">
                              <span className="text-csfloat-light/80">{source.source}</span>
                              <span className="text-white font-medium">{source.count} visits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Device Analytics */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Device Types</h3>
                        <div className="space-y-2">
                          {detailedAnalytics.deviceStats.map((device) => (
                            <div key={device.device_type} className="flex justify-between items-center text-sm">
                              <span className="text-csfloat-light/80">{device.device_type}</span>
                              <span className="text-white font-medium">{device.count} visits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Browser Analytics */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Browser Usage</h3>
                        <div className="space-y-2">
                          {detailedAnalytics.browserStats.map((browser) => (
                            <div key={browser.browser} className="flex justify-between items-center text-sm">
                              <span className="text-csfloat-light/80">{browser.browser}</span>
                              <span className="text-white font-medium">{browser.count} visits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growth Trend */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Growth Trend (30 Days)</h3>
                        <div className="space-y-2">
                          {detailedAnalytics.growthTrend.slice(-7).map((day) => (
                            <div key={day.date} className="flex justify-between items-center text-sm">
                              <span className="text-csfloat-light/80">{new Date(day.date).toLocaleDateString()}</span>
                              <div className="flex space-x-4">
                                <span className="text-white">{day.visits} visits</span>
                                <span className="text-csfloat-light/60">({day.unique_visitors} unique)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real-Time Analytics */}
                    {realTimeAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-csfloat-light/90">Real-Time Activity</h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-500 text-sm font-medium">Live</span>
                          </div>
                        </div>
                        
                        {/* Active Users */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-csfloat-gray/10 rounded-lg p-4">
                            <h4 className="text-csfloat-light/70 text-sm mb-2">Currently Active Users</h4>
                            <p className="text-2xl font-bold text-green-500">{realTimeAnalytics.activeUsers}</p>
                            <p className="text-csfloat-light/60 text-xs">Last 5 minutes</p>
                          </div>
                          <div className="bg-csfloat-gray/10 rounded-lg p-4">
                            <h4 className="text-csfloat-light/70 text-sm mb-2">Recent Visits</h4>
                            <p className="text-2xl font-bold text-blue-500">{realTimeAnalytics.recentVisits.length}</p>
                            <p className="text-csfloat-light/60 text-xs">Last 10 minutes</p>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-2">
                          <h4 className="text-csfloat-light/70 text-sm mb-3">Recent Page Visits</h4>
                          {realTimeAnalytics.recentVisits.slice(0, 5).map((visit, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-csfloat-gray/10 pb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-csfloat-light/80">{visit.page_path}</span>
                                <span className="text-csfloat-light/60 text-xs">{visit.ip_address}</span>
                              </div>
                              <span className="text-csfloat-light/60 text-xs">
                                {new Date(visit.visited_at).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* User Analytics Tab */}
                {activeAnalyticsTab === 'users' && (
                  <>
                    {/* User Engagement Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {userEngagement && (
                        <>
                          <SimpleChart 
                            data={userEngagement.registrationTrend} 
                            title="User Registration Trend (30 days)" 
                          />
                          <SimpleChart 
                            data={userEngagement.loginTrend} 
                            title="User Login Trend (30 days)" 
                          />
                        </>
                      )}
                    </div>

                    {/* User Statistics */}
                    {userEngagement && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                          title="Total Users" 
                          value={userEngagement.userStats.total_users}
                        />
                        <StatCard 
                          title="Active (7d)" 
                          value={userEngagement.userStats.active_users_7d}
                          subtitle={`${Math.round((userEngagement.userStats.active_users_7d / userEngagement.userStats.total_users) * 100)}%`}
                        />
                        <StatCard 
                          title="Active (30d)" 
                          value={userEngagement.userStats.active_users_30d}
                          subtitle={`${Math.round((userEngagement.userStats.active_users_30d / userEngagement.userStats.total_users) * 100)}%`}
                        />
                        <StatCard 
                          title="New (30d)" 
                          value={userEngagement.userStats.new_users_30d}
                          subtitle="This month"
                        />
                      </div>
                    )}

                    {/* Registered Users Table */}
                    <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Registered Users</h2>
                        <span className="text-csfloat-light/70 text-sm">Total: {users.length}</span>
                      </div>
                      {users.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left border-b border-csfloat-gray/20">
                                <th className="pb-4 text-csfloat-light/70">Steam ID</th>
                                <th className="pb-4 text-csfloat-light/70">Username</th>
                                <th className="pb-4 text-csfloat-light/70">API Key</th>
                                <th className="pb-4 text-csfloat-light/70">Trade URL</th>
                                <th className="pb-4 text-csfloat-light/70">App Installed</th>
                                <th className="pb-4 text-csfloat-light/70">Created</th>
                                <th className="pb-4 text-csfloat-light/70">Last Login</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map((user) => (
                                <tr key={user.id} className="border-b border-csfloat-gray/10 hover:bg-csfloat-gray/5 transition-colors duration-200">
                                  <td className="py-4 text-white">{user.steam_id}</td>
                                  <td className="py-4 text-white">{user.username || '-'}</td>
                                  <td className="py-4 text-white">
                                    {user.steam_api_key ? (
                                      <span className="text-green-500">✓</span>
                                    ) : (
                                      <span className="text-csfloat-light/50">✗</span>
                                    )}
                                  </td>
                                  <td className="py-4 text-white">
                                    {user.trade_url ? (
                                      <span className="text-green-500">✓</span>
                                    ) : (
                                      <span className="text-csfloat-light/50">✗</span>
                                    )}
                                  </td>
                                  <td className="py-4 text-white">
                                    {user.app_installed ? (
                                      <span className="text-green-500">✓</span>
                                    ) : (
                                      <span className="text-csfloat-light/50">✗</span>
                                    )}
                                  </td>
                                  <td className="py-4 text-csfloat-light/80 text-sm">{formatDate(user.created_at)}</td>
                                  <td className="py-4 text-csfloat-light/80 text-sm">
                                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                                  </td>
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

                {/* Page Analytics Tab */}
                {activeAnalyticsTab === 'pages' && (
                  <>
                    {/* Page Performance Metrics */}
                    {pagePerformance && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                          title="Total Pages" 
                          value={pagePerformance.pagePerformance.length}
                        />
                        <StatCard 
                          title="Avg Daily Visits" 
                          value={Math.round(pagePerformance.pagePerformance.reduce((acc, page) => acc + page.avg_daily_visits, 0) / pagePerformance.pagePerformance.length)}
                        />
                        <StatCard 
                          title="Avg Bounce Rate" 
                          value={Math.round(pagePerformance.bounceRate.reduce((acc, page) => acc + page.bounce_rate, 0) / pagePerformance.bounceRate.length)}
                          isPercentage={true}
                        />
                        <StatCard 
                          title="Most Visited" 
                          value={pagePerformance.pagePerformance[0]?.page_path || 'N/A'}
                          subtitle={`${pagePerformance.pagePerformance[0]?.total_visits || 0} visits`}
                        />
                      </div>
                    )}

                    {/* Page Performance Table */}
                    {pagePerformance && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Page Performance</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left border-b border-csfloat-gray/20">
                                <th className="pb-4 text-csfloat-light/70">Page</th>
                                <th className="pb-4 text-csfloat-light/70">Total Visits</th>
                                <th className="pb-4 text-csfloat-light/70">Unique Visitors</th>
                                <th className="pb-4 text-csfloat-light/70">Avg Daily</th>
                                <th className="pb-4 text-csfloat-light/70">Days Active</th>
                                <th className="pb-4 text-csfloat-light/70">Last Visit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pagePerformance.pagePerformance.map((page) => (
                                <tr key={page.page_path} className="border-b border-csfloat-gray/10 hover:bg-csfloat-gray/5 transition-colors duration-200">
                                  <td className="py-4 text-white">{page.page_path}</td>
                                  <td className="py-4 text-white">{page.total_visits}</td>
                                  <td className="py-4 text-white">{page.unique_visitors}</td>
                                  <td className="py-4 text-white">{page.avg_daily_visits}</td>
                                  <td className="py-4 text-white">{page.days_visited}</td>
                                  <td className="py-4 text-csfloat-light/80 text-sm">{formatDate(page.last_visit)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Bounce Rate Analysis */}
                    {pagePerformance && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Bounce Rate Analysis</h3>
                        <div className="space-y-2">
                          {pagePerformance.bounceRate.map((page) => (
                            <div key={page.page_path} className="flex justify-between items-center text-sm">
                              <span className="text-csfloat-light/80">{page.page_path}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-white">{page.total_visits} visits</span>
                                <span className={`font-medium ${page.bounce_rate > 70 ? 'text-red-500' : page.bounce_rate > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                  {page.bounce_rate}% bounce
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Enhanced Analytics Tab */}
                {activeAnalyticsTab === 'enhanced' && (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatCard 
                        title="Total Unique Visitors" 
                        value={detailedAnalytics?.uniqueVisitorsTotal ?? 0}
                        subtitle="All time"
                      />
                      <StatCard 
                        title="Today's Unique Visitors" 
                        value={detailedAnalytics?.uniqueVisitorsToday ?? 0}
                        subtitle="Unique IPs"
                      />
                      <StatCard 
                        title="Most Active Hour" 
                        value={detailedAnalytics?.activeHours[0]?.hour ?? 0}
                        subtitle={`${detailedAnalytics?.activeHours[0]?.count ?? 0} visits`}
                      />
                      <StatCard 
                        title="Top Traffic Source" 
                        value={detailedAnalytics?.referrerStats[0]?.source ?? 'N/A'}
                        subtitle={`${detailedAnalytics?.referrerStats[0]?.count ?? 0} visits`}
                      />
                    </div>

                    {/* Device and Browser Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Device Types */}
                      {detailedAnalytics && (
                        <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                          <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Device Types</h3>
                          <div className="space-y-3">
                            {detailedAnalytics.deviceStats.map((device) => {
                              const percentage = Math.round((device.count / detailedAnalytics.deviceStats.reduce((acc, d) => acc + d.count, 0)) * 100);
                              return (
                                <div key={device.device_type} className="flex items-center justify-between">
                                  <span className="text-csfloat-light/80">{device.device_type}</span>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-csfloat-gray/20 rounded-full h-2">
                                      <div 
                                        className="bg-csfloat-blue h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-white font-medium text-sm">{percentage}%</span>
                                    <span className="text-csfloat-light/60 text-sm">({device.count})</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Browser Usage */}
                      {detailedAnalytics && (
                        <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                          <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Browser Usage</h3>
                          <div className="space-y-3">
                            {detailedAnalytics.browserStats.map((browser) => {
                              const percentage = Math.round((browser.count / detailedAnalytics.browserStats.reduce((acc, b) => acc + b.count, 0)) * 100);
                              return (
                                <div key={browser.browser} className="flex items-center justify-between">
                                  <span className="text-csfloat-light/80">{browser.browser}</span>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-csfloat-gray/20 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-white font-medium text-sm">{percentage}%</span>
                                    <span className="text-csfloat-light/60 text-sm">({browser.count})</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Growth Trend Chart */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 mb-8">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Growth Trend (Last 30 Days)</h3>
                        <div className="space-y-2">
                          {detailedAnalytics.growthTrend.map((day) => (
                            <div key={day.date} className="flex justify-between items-center text-sm border-b border-csfloat-gray/10 pb-2">
                              <span className="text-csfloat-light/80">{new Date(day.date).toLocaleDateString()}</span>
                              <div className="flex space-x-6">
                                <span className="text-white">{day.visits} total visits</span>
                                <span className="text-csfloat-light/60">{day.unique_visitors} unique visitors</span>
                                <span className="text-csfloat-blue">
                                  {day.visits > 0 ? Math.round((day.unique_visitors / day.visits) * 100) : 0}% unique rate
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traffic Sources */}
                    {detailedAnalytics && (
                      <div className="bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
                        <h3 className="text-lg font-medium text-csfloat-light/90 mb-4">Traffic Sources</h3>
                        <div className="space-y-3">
                          {detailedAnalytics.referrerStats.map((source) => {
                            const percentage = Math.round((source.count / detailedAnalytics.referrerStats.reduce((acc, s) => acc + s.count, 0)) * 100);
                            return (
                              <div key={source.source} className="flex items-center justify-between">
                                <span className="text-csfloat-light/80">{source.source}</span>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-csfloat-gray/20 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-white font-medium text-sm">{percentage}%</span>
                                  <span className="text-csfloat-light/60 text-sm">({source.count})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
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