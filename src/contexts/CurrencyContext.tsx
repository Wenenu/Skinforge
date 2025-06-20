import React, { createContext, useContext, useState, useCallback } from 'react';
import { SupportedCurrency, convertCurrency } from '../utils/currency';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  convertPrice: (amount: number, from: SupportedCurrency) => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');

  const convertPrice = useCallback(
    async (amount: number, from: SupportedCurrency) => {
      if (from === currency) return amount;
      return convertCurrency(amount, from, currency);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 