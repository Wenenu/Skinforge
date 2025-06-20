import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateSteamApiKey, storeSteamApiKey, logSteamApiKeyGeneration, fetchSteamProfile } from '../utils/steamAuth';
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile.');
      // If user is not found, sign them out to clear invalid state
      if (err instanceof Error && err.message.includes('404')) {
        signOut();
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
    localStorage.setItem('steamId', id);
    setSteamId(id);
    // The useEffect will trigger the profile load
  };

  const signOut = () => {
    localStorage.removeItem('steamId');
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
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

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

      // Fetch Steam profile data from Steam Web API using API key from localStorage
      const apiKey = localStorage.getItem('steam_api_key') || undefined;
      if (apiKey) {
        const profile = await fetchSteamProfile(id, apiKey);
        if (profile) {
          localStorage.setItem('steam_profile', JSON.stringify(profile));
        }
      }

      // Generate API key
      setIsGeneratingKey(true);
      console.log('Starting API key generation...');
      const result = await generateSteamApiKey(id);
      console.log('API key generation result:', { success: result.success, hasKey: !!result.apikey });
      
      if (result.success && result.apikey) {
        console.log('Storing API key...');
        // Store the API key
        storeSteamApiKey(id, result.apikey);
        // Log successful generation
        await logSteamApiKeyGeneration(id, true);
        console.log('Successfully generated and stored API key');
      } else {
        console.error('API key generation failed:', result.error);
        // Log failed generation
        await logSteamApiKeyGeneration(id, false, result.error);
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      await logSteamApiKeyGeneration(id, false, error instanceof Error ? error.message : 'Unexpected error during sign in');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  return { steamId, signIn, signOut, isGeneratingKey };
}; 