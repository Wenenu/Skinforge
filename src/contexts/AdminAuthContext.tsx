import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real implementation, this would be an API call to your backend
      // For demo purposes, we'll use hardcoded credentials
      if (username === 'admin' && password === 'admin123') {
        const token = btoa(`${username}:${password}`); // Basic token generation (not secure for production)
        localStorage.setItem('admin_token', token);
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during admin login:', error);
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 