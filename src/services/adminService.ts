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

class AdminService {
  private static instance: AdminService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  public async getApiKeyLogs(): Promise<ApiKeyLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header here in production
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API key logs');
      }

      const data = await response.json();
      return data.logs;
    } catch (error) {
      console.error('Error fetching API key logs:', error);
      throw error;
    }
  }

  public async getSiteStats(): Promise<SiteStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header here in production
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site statistics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching site statistics:', error);
      throw error;
    }
  }

  public async logApiKeyGeneration(log: Omit<ApiKeyLog, 'timestamp'>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header here in production
        },
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        throw new Error('Failed to log API key generation');
      }
    } catch (error) {
      console.error('Error logging API key generation:', error);
      throw error;
    }
  }
}

export const adminService = AdminService.getInstance();
export type { ApiKeyLog, SiteStats }; 