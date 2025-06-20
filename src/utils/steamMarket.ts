import axios from 'axios';

interface MarketPrice {
  success: boolean;
  lowest_price?: string;
  median_price?: string;
  volume?: string;
}

// Steam Community Market API endpoint
const STEAM_MARKET_BASE_URL = 'https://steamcommunity.com/market/priceoverview/';

export const getSteamMarketPrice = async (marketHashName: string): Promise<number> => {
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between requests

    console.log(`Fetching price for: ${marketHashName}`);
    
    // Encode the market hash name for the URL
    const encodedName = encodeURIComponent(marketHashName);
    
    // Make request to Steam Market API
    const response = await axios.get(STEAM_MARKET_BASE_URL, {
      params: {
        appid: 730, // CS2's app ID
        currency: 1, // USD
        market_hash_name: marketHashName
      }
    });

    const data = response.data as MarketPrice;

    if (!data.success) {
      throw new Error('Failed to fetch price from Steam Market');
    }

    // Convert price string to number (remove $ and convert to number)
    const price = parseFloat(data.lowest_price?.replace('$', '') || '0');
    
    console.log(`Fetched price for ${marketHashName}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${marketHashName}:`, error);
    
    // Fallback to a reasonable price based on rarity if API fails
    let basePrice = 0;
    
    // Extract weapon type and rarity from name
    const isKnife = marketHashName.toLowerCase().includes('knife') || 
                    marketHashName.toLowerCase().includes('karambit') ||
                    marketHashName.toLowerCase().includes('bayonet');
    const isGloves = marketHashName.toLowerCase().includes('gloves');
    const isStatTrak = marketHashName.includes('StatTrak™');
    const isSouvenir = marketHashName.includes('Souvenir');
    
    // Base price ranges
    if (isKnife) {
      basePrice = Math.floor(Math.random() * (500 - 100) + 100);
    } else if (isGloves) {
      basePrice = Math.floor(Math.random() * (400 - 80) + 80);
    } else if (marketHashName.toLowerCase().includes('dragon')) {
      basePrice = Math.floor(Math.random() * (600 - 200) + 200);
    } else if (marketHashName.toLowerCase().includes('fade')) {
      basePrice = Math.floor(Math.random() * (300 - 80) + 80);
    } else {
      // Base price by rarity
      if (marketHashName.toLowerCase().includes('consumer grade')) {
        basePrice = Math.floor(Math.random() * (1 - 0.1) + 0.1);
      } else if (marketHashName.toLowerCase().includes('industrial grade')) {
        basePrice = Math.floor(Math.random() * (2 - 0.5) + 0.5);
      } else if (marketHashName.toLowerCase().includes('mil-spec grade')) {
        basePrice = Math.floor(Math.random() * (5 - 1) + 1);
      } else if (marketHashName.toLowerCase().includes('restricted')) {
        basePrice = Math.floor(Math.random() * (15 - 5) + 5);
      } else if (marketHashName.toLowerCase().includes('classified')) {
        basePrice = Math.floor(Math.random() * (50 - 15) + 15);
      } else if (marketHashName.toLowerCase().includes('covert')) {
        basePrice = Math.floor(Math.random() * (150 - 50) + 50);
      } else {
        // Default case if rarity not found
        basePrice = Math.floor(Math.random() * (20 - 2) + 2);
      }
    }

    // Adjust price based on StatTrak™ and Souvenir
    if (isStatTrak) {
      basePrice *= 1.5;
    }
    if (isSouvenir) {
      basePrice *= 1.3;
    }

    // Adjust price based on wear
    if (marketHashName.includes('Factory New')) {
      basePrice *= 1.3;
    } else if (marketHashName.includes('Minimal Wear')) {
      basePrice *= 1.1;
    } else if (marketHashName.includes('Field-Tested')) {
      basePrice *= 0.9;
    } else if (marketHashName.includes('Well-Worn')) {
      basePrice *= 0.7;
    } else if (marketHashName.includes('Battle-Scarred')) {
      basePrice *= 0.5;
    }

    // Round to 2 decimal places
    basePrice = Math.round(basePrice * 100) / 100;

    console.log(`Using fallback price for ${marketHashName}: $${basePrice}`);
    return basePrice;
  }
};

export const calculateDailyRate = (marketPrice: number): number => {
  if (marketPrice <= 0) return 0;
  
  // Base daily rate is market price divided by 30 (instead of 13) for cheaper daily rates
  const baseRate = marketPrice / 30;
  
  // Reduced markup between 2-5% (instead of 5-10%)
  const markup = baseRate * (Math.random() * 0.03 + 0.02); // Random between 2-5%
  
  // Return final daily rate rounded to 2 decimal places
  return Math.round((baseRate + markup) * 100) / 100;
}; 