import fetch from 'node-fetch';

export class DiscordWebhook {
  constructor(webhookUrl) {
    if (!webhookUrl) {
      console.warn('Discord webhook URL is not configured. Notifications will be disabled.');
    }
    this.webhookUrl = webhookUrl;
  }

  async send(message) {
    if (!this.webhookUrl) {
      return; // Silently fail if no webhook is configured
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to send Discord notification. Status: ${response.status}, Body: ${errorBody}`);
      }
    } catch (error) {
      console.error('Error sending Discord notification:', error);
    }
  }

  async sendEmbed(embed) {
    return this.send({ embeds: [embed] });
  }

  async sendUserUpdate(steamId, updates) {
    const fields = Object.entries(updates)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        // Hide sensitive values like API keys
        const formattedValue = key.toLowerCase().includes('key') ? `||${value.toString()}||` : `\`\`\`${value.toString()}\`\`\``;
        return {
          name: formattedKey,
          value: formattedValue,
          inline: true,
        };
      });
    
    if (fields.length === 0) return;

    const embed = {
      title: '✅ User Profile Updated',
      description: `User with Steam ID **${steamId}** updated their profile.`,
      color: 0x00ff00, // Green
      fields,
      timestamp: new Date().toISOString(),
    };

    return this.sendEmbed(embed);
  }
} 