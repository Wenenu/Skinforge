import React, { useState } from 'react';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '../utils/currency';

interface CurrencySelectorProps {
  selectedCurrency: SupportedCurrency;
  onCurrencyChange: (currency: SupportedCurrency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-csfloat-dark px-3 py-2 rounded-lg hover:bg-csfloat-darker transition-colors duration-200"
      >
        <span className="text-white">{selectedCurrency}</span>
        <svg
          className={`w-4 h-4 text-csfloat-light/70 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-csfloat-dark rounded-lg shadow-lg py-2 z-50 min-w-[120px]">
          {SUPPORTED_CURRENCIES.map((currency) => (
            <button
              key={currency}
              onClick={() => {
                onCurrencyChange(currency);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-csfloat-darker transition-colors duration-200 ${
                selectedCurrency === currency
                  ? 'text-csfloat-blue'
                  : 'text-white'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector; 