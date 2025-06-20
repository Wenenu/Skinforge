const API_BASE_URL = 'http://150.136.130.59:3002/api';

export const fetchUserData = async (steamId: string) => {
  const response = await fetch(`${API_BASE_URL}/user/${steamId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }
  return response.json();
};

export const updateUserData = async (steamId: string, data: { apiKey?: string; tradeUrl?: string; appInstalled?: boolean }) => {
  const response = await fetch(`${API_BASE_URL}/user/${steamId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user data: ${response.statusText}`);
  }
  return response.json();
}; 