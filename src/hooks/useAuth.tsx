import React, { useState, useEffect, createContext, useContext } from 'react';
import { generateSteamApiKey, storeSteamApiKey, logSteamApiKeyGeneration, fetchSteamProfile } from '../utils/steamAuth';

interface AuthContextType {
  steamId: string | null;
  isGeneratingKey: boolean;
  signIn: (id: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  steamId: null,
  isGeneratingKey: false,
  signIn: async () => {},
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    // Check for Steam ID in localStorage on mount
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

  const signOut = () => {
    setSteamId(null);
    localStorage.removeItem('steamId');
    localStorage.removeItem('steam_profile');
    console.log('User signed out, cleared Steam ID and profile');
  };

  return (
    <AuthContext.Provider value={{ steamId, isGeneratingKey, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
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