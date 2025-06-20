import { SteamProfile } from '../types/steam';

// Public Steam API key for client-side fetching (for demonstration purposes)
// NOTE: Exposing an API key on the client is not recommended for production.
const STEAM_API_KEY = '93459A6D77ECE8EF61F5F3DB203316D8';

export const fetchSteamProfile = async (steamId: string): Promise<SteamProfile | null> => {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile from Steam API');
    }

    const data = await response.json();
    const player = data.response.players[0];

    if (!player) {
      console.warn(`No player data found for Steam ID: ${steamId}`);
      return null;
    }

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
    const profile = localStorage.getItem('steam_profile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting Steam profile from storage:', error);
    return null;
  }
}; 