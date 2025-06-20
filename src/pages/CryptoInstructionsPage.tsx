import React from 'react';
import { useNavigate } from 'react-router-dom';

const cryptoOptions = [
  { type: 'BTC', name: 'Bitcoin', address: 'bc1qxt04shd7q9tf67hq7tlpspap89j7htxxgjwu4x', icon: '/assets/bitcoin-btc-logo.png' },
  { type: 'LTC', name: 'Litecoin', address: 'ltc1qe4uefum4yrdya7p4vm66gqg6tvxyn7ahppn5p2', icon: '/assets/litecoin-ltc-logo.png' },
  { type: 'ETH', name: 'Ethereum', address: '0x62824e5f43cc31915Ac819302b49a2aE3Ee2CCf3', icon: '/assets/ethereum-eth-logo.png' },
  { type: 'XMR', name: 'Monero', address: '845dB9LYkw4GV4qGnqhQFU9mBThTJt8mRceRDt8JEg5gE5axxLVVnsCAUGUzMen23G82ZGatGXyQuV3imjUV3eQa3S5YzFn', icon: '/assets/monero-xmr-logo.png' }
];

const CryptoInstructionsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
          <button onClick={() => navigate(-1)} className="mb-6 text-csfloat-blue hover:underline">&larr; Back</button>
          <h1 className="text-2xl font-bold text-white mb-6">Crypto Payment Instructions</h1>
          <p className="text-csfloat-light/70 mb-4">Send the payment to one of the following addresses. Make sure to use the correct network and double-check the address before sending.</p>
          <div className="space-y-4">
            {cryptoOptions.map(crypto => (
              <div key={crypto.type} className="flex items-center space-x-4 p-4 bg-csfloat-dark/70 rounded-lg">
                <img src={crypto.icon} alt={crypto.name} className="w-8 h-8" />
                <div className="flex-1">
                  <span className="text-white font-semibold">{crypto.name}</span>
                  <div className="text-csfloat-light/70 text-xs break-all mt-1">{crypto.address}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-500 text-sm">
              After sending, payment will be confirmed automatically. If you have any issues, contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoInstructionsPage; 