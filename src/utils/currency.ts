interface ExchangeRates {
  [key: string]: number;
}

const FALLBACK_URL = 'https://latest.currency-api.pages.dev/v1';
const PRIMARY_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';

export const fetchExchangeRate = async (from: string, to: string): Promise<number> => {
  try {
    // Try primary URL first
    const response = await fetch(`${PRIMARY_URL}/currencies/${from.toLowerCase()}.json`);
    if (!response.ok) {
      throw new Error('Primary API failed');
    }
    const data = await response.json();
    const rate = data[from.toLowerCase()][to.toLowerCase()];
    console.log(`[Currency] Primary API: ${from} -> ${to} =`, rate);
    return rate;
  } catch (error) {
    try {
      // Fallback to secondary URL
      const response = await fetch(`${FALLBACK_URL}/currencies/${from.toLowerCase()}.json`);
      if (!response.ok) {
        throw new Error('Both APIs failed');
      }
      const data = await response.json();
      const rate = data[from.toLowerCase()][to.toLowerCase()];
      console.log(`[Currency] Fallback API: ${from} -> ${to} =`, rate);
      return rate;
    } catch (secondError) {
      console.error('[Currency] Currency conversion failed:', secondError);
      return 0;
    }
  }
};

export const convertCurrency = async (amount: number, from: string, to: string): Promise<number> => {
  const rate = await fetchExchangeRate(from, to);
  console.log(`[Currency] convertCurrency: ${amount} ${from} -> ${to} @ rate ${rate} =`, amount * rate);
  return amount * rate;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Supported currencies for our application
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'RUB'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]; 