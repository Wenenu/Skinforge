import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchSteamProfile } from '../utils/steamAuth';
import { fetchUserData, updateUserData } from '../services/userService';

interface AuthContextType {
  steamId: string | null;
  setSteamId: (id: string | null) => void;
  userProfile: any; // Consider defining a specific type for the user profile
  signIn: (id: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steamId, setSteamId] = useState<string | null>(() => localStorage.getItem('steamId'));
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserData(id);
      setUserProfile(data);
      
      // Also fetch Steam profile data if not already stored
      const storedProfile = localStorage.getItem('steam_profile');
      if (!storedProfile) {
        try {
          const steamProfile = await fetchSteamProfile(id);
          if (steamProfile) {
            localStorage.setItem('steam_profile', JSON.stringify(steamProfile));
          }
        } catch (error) {
          console.error('Failed to fetch Steam profile:', error);
        }
      }
    } catch (err) {
      // Don't sign out on 404 - user might not exist in DB yet
      if (err instanceof Error && err.message.includes('404')) {
        console.log('User not found in database yet, but Steam authentication is valid');
        setUserProfile(null);
        setError(null); // Don't show error for new users
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load user profile.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (steamId) {
      loadUserProfile(steamId);
    } else {
      setLoading(false);
    }
  }, [steamId, loadUserProfile]);

  const signIn = async (id: string) => {
    try {
      localStorage.setItem('steamId', id);
      setSteamId(id);
      
      // Automatically fetch Steam profile data
      try {
        const profile = await fetchSteamProfile(id);
        if (profile) {
          localStorage.setItem('steam_profile', JSON.stringify(profile));
        }
      } catch (error) {
        console.error('Failed to fetch Steam profile:', error);
      }
      
      // The useEffect will trigger the profile load
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error; // Re-throw to let the calling component handle it
    }
  };

  const signOut = () => {
    localStorage.removeItem('steamId');
    localStorage.removeItem('steam_profile');
    setSteamId(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ steamId, setSteamId, userProfile, signIn, signOut, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const useAuthWithoutContext = () => {
  const [steamId, setSteamId] = useState<string | null>(null);

  useEffect(() => {
    // Check for Steam ID in local storage
    const storedSteamId = localStorage.getItem('steamId');
    if (storedSteamId) {
      setSteamId(storedSteamId);
      // Fetch profile data if we have a stored Steam ID
      fetchSteamProfile(storedSteamId).catch(console.error);
    }
  }, []);

  const signIn = async (id: string) => {
    try {
      console.log('Starting sign in process for Steam ID:', id);
      setSteamId(id);
      localStorage.setItem('steamId', id);

      // Fetch Steam profile data
      const profile = await fetchSteamProfile(id);
      if (profile) {
        localStorage.setItem('steam_profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  const signOut = () => {
    localStorage.removeItem('steamId');
    localStorage.removeItem('steam_profile');
    setSteamId(null);
  };

  return { steamId, signIn, signOut };
}; 