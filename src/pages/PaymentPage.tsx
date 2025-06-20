import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../contexts/CartContext';
import { csgostashUrlMap } from '../components/RentPage';

interface PaymentPageProps {
  skin?: {
    id: string;
    name: string;
    image: string;
    dailyRate: number;
    rentDays: number;
    totalPrice: number;
  };
}

type PaymentMethod = 'crypto' | 'cashapp' | 'paypal';
type CryptoType = 'BTC' | 'LTC' | 'ETH' | 'XMR' | 'USDT' | 'USDC';

interface CryptoOption {
  type: CryptoType;
  name: string;
  address: string;
  icon: string;
}

const cryptoOptions: CryptoOption[] = [
  {
    type: 'BTC',
    name: 'Bitcoin',
    address: 'bc1qxt04shd7q9tf67hq7tlpspap89j7htxxgjwu4x',
    icon: '/assets/bitcoin-btc-logo.png'
  },
  {
    type: 'LTC',
    name: 'Litecoin',
    address: 'ltc1qe4uefum4yrdya7p4vm66gqg6tvxyn7ahppn5p2',
    icon: '/assets/litecoin-ltc-logo.png'
  },
  {
    type: 'ETH',
    name: 'Ethereum',
    address: '0x62824e5f43cc31915Ac819302b49a2aE3Ee2CCf3',
    icon: '/assets/ethereum-eth-logo.png'
  },
  {
    type: 'XMR',
    name: 'Monero',
    address: '845dB9LYkw4GV4qGnqhQFU9mBThTJt8mRceRDt8JEg5gE5axxLVVnsCAUGUzMen23G82ZGatGXyQuV3imjUV3eQa3S5YzFn',
    icon: '/assets/monero-xmr-logo.png'
  }
];

const getImageUrl = (skin: { id: string; image?: string }) => {
  if (csgostashUrlMap[skin.id]) return csgostashUrlMap[skin.id];
  return skin.image || '/skins/placeholder.png';
};

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useCurrency();
  const { items: cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);

  // Get skin data from location state or cart
  const initialItems = location.state?.items || (location.state?.skin ? [location.state.skin] : []);
  const [items, setItems] = useState(initialItems.map(item => ({ ...item })));

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">No Items Selected</h1>
            <button
              onClick={() => navigate('/rent')}
              className="bg-csfloat-blue px-6 py-2 rounded hover:bg-csfloat-blue/80 transition-colors"
            >
              Return to Rent Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (paymentMethod === 'crypto') {
      navigate('/crypto-instructions');
      return;
    }
    if (paymentMethod === 'cashapp') {
      navigate('/cashapp-instructions');
      return;
    }
    if (paymentMethod === 'paypal') {
      window.location.href = 'YOUR_PAYPAL_LINK_HERE';
      return;
    }
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    // Clear cart after successful payment
    clearCart();
    // In a real app, you would handle the payment here
    navigate('/rent', { state: { paymentSuccess: true } });
  };

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setShowCryptoModal(false);
  };

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case 'crypto':
        if (!selectedCrypto) {
          return {
            title: 'Select Cryptocurrency',
            instructions: [
              'Please select a cryptocurrency to proceed with payment',
              'Click the "Select Cryptocurrency" button below'
            ]
          };
        }
        return {
          title: `Send ${selectedCrypto.name} Payment`,
          instructions: [
            'Send exactly the amount shown above to the following address:',
            <span className="text-csfloat-light/70 text-xs break-all max-w-[180px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[400px] overflow-x-auto" style={{ wordBreak: 'break-all' }}>{selectedCrypto.address}</span>,
            'Make sure to use the correct network',
            'Payment will be confirmed automatically'
          ]
        };
      case 'cashapp':
        return {
          title: 'Cash App Payment',
          instructions: [
            'Send payment to: $Wenenu',
            'Include your Steam ID in the payment note'
          ]
        };
      case 'paypal':
        return {
          title: 'PayPal Payment',
          instructions: [
            'You will send the price to the PayPal account',
            'You must send using Family & Friends',
            'Provide Steam ID in the payment note'
          ]
        };
    }
  };

  const handleDaysChange = (id: string, newDays: number) => {
    setItems(prevItems => prevItems.map(item =>
      item.id === id
        ? { ...item, rentDays: newDays, totalPrice: newDays * item.dailyRate }
        : item
    ));
  };

  const paymentInfo = getPaymentInstructions();
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const isCrypto = paymentMethod === 'crypto';
  const discount = isCrypto ? 0.1 : 0;
  const discountedTotal = isCrypto ? totalPrice * 0.9 : totalPrice;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Complete Your Rental</h1>
          {/* Card payments banner */}
          <div className="mb-6 p-3 bg-yellow-900/40 border-l-4 border-yellow-500 rounded text-yellow-200 text-center font-semibold">
            Card payments coming soon!
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-csfloat-dark/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-csfloat-dark/50 rounded-lg">
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      className="w-20 h-20 object-contain bg-csfloat-gray/10 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-csfloat-light/70">Rental Period:</p>
                        <input
                          type="number"
                          min={1}
                          value={item.rentDays}
                          onChange={e => handleDaysChange(item.id, Math.max(1, Number(e.target.value)))}
                          className="w-16 px-2 py-1 rounded bg-csfloat-dark border border-csfloat-gray/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-csfloat-blue"
                        />
                        <span className="text-csfloat-light/70">days</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-csfloat-light/70">Daily Rate</span>
                        <span className="text-white">{formatCurrency(item.dailyRate, currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-csfloat-light/70">Total</span>
                        <span className="text-white font-semibold">{formatCurrency(item.totalPrice, currency)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-csfloat-gray/20 space-y-2">
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalPrice, currency)}</span>
                </div>
                {isCrypto && (
                  <div className="flex justify-between text-green-400 font-semibold text-md">
                    <span>Crypto Discount (10%)</span>
                    <span>-{formatCurrency(totalPrice * discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-xl border-t border-csfloat-gray/20 pt-2">
                  <span>Final Total</span>
                  <span>{formatCurrency(discountedTotal, currency)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-csfloat-dark/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                    paymentMethod === 'crypto'
                      ? 'border-csfloat-blue bg-csfloat-blue/10'
                      : 'border-csfloat-gray/20 hover:border-csfloat-blue/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img className="w-6 h-6" src="/assets/bitcoin-btc-logo.png" alt="Cryptocurrency" />
                      <span className="text-white">Cryptocurrency</span>
                    </div>
                    {paymentMethod === 'crypto' && (
                      <svg className="w-5 h-5 text-csfloat-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                    paymentMethod === 'cashapp'
                      ? 'border-csfloat-blue bg-csfloat-blue/10'
                      : 'border-csfloat-gray/20 hover:border-csfloat-blue/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img className="w-6 h-6" src="/assets/cashapp.png" alt="Cash App" />
                      <span className="text-white">Cash App</span>
                    </div>
                    {paymentMethod === 'cashapp' && (
                      <svg className="w-5 h-5 text-csfloat-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                    paymentMethod === 'paypal'
                      ? 'border-csfloat-blue bg-csfloat-blue/10'
                      : 'border-csfloat-gray/20 hover:border-csfloat-blue/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img className="w-6 h-6" src="/assets/paypal.png" alt="PayPal" />
                      <span className="text-white">PayPal</span>
                    </div>
                    {paymentMethod === 'paypal' && (
                      <svg className="w-5 h-5 text-csfloat-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>

              {/* Payment Instructions */}
              <div className="mt-6 p-4 bg-csfloat-dark/50 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">{paymentInfo.title}</h3>
                <ul className="space-y-2 text-csfloat-light/70">
                  {paymentInfo.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-csfloat-blue mr-2">•</span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              {paymentMethod === 'crypto' && !selectedCrypto && (
                <button
                  onClick={() => setShowCryptoModal(true)}
                  className="w-full mt-4 bg-csfloat-blue/20 border border-csfloat-blue text-csfloat-blue py-3 px-4 rounded-lg hover:bg-csfloat-blue/30 transition-colors"
                >
                  Select Cryptocurrency
                </button>
              )}

              {paymentMethod === 'crypto' && selectedCrypto && (
                <div className="mt-4 p-4 bg-csfloat-dark/50 rounded-lg border border-csfloat-blue/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <img src={selectedCrypto.icon} alt={selectedCrypto.name} className="w-8 h-8" />
                    <span className="text-white font-medium">{selectedCrypto.name}</span>
                  </div>
                  <div className="flex items-center justify-between bg-csfloat-dark/30 p-2 rounded">
                    <span className="text-csfloat-light/70 text-xs break-all max-w-[180px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[400px] overflow-x-auto" style={{ wordBreak: 'break-all' }}>{selectedCrypto.address}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedCrypto.address)}
                      className="text-csfloat-blue hover:text-csfloat-blue/80"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-500 text-sm">
                  It may take up to 2 hours to verify requests, while this is happening, make sure to add your Steam Trade URL and API Key to verify everything is correct.
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing || (paymentMethod === 'crypto' && !selectedCrypto)}
                className="w-full mt-6 bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Pay ${formatCurrency(discountedTotal, currency)}`
                )}
              </button>

              <p className="mt-4 text-sm text-red-500 text-center">
                We're not responsible for any errors made during this process
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Selection Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-csfloat-dark border border-csfloat-gray/20 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Select Cryptocurrency</h3>
              <button
                onClick={() => setShowCryptoModal(false)}
                className="text-csfloat-light/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {cryptoOptions.map((crypto) => (
                <button
                  key={crypto.type}
                  onClick={() => handleCryptoSelect(crypto)}
                  className="w-full p-4 bg-csfloat-dark/50 hover:bg-csfloat-dark/70 border border-csfloat-gray/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img src={crypto.icon} alt={crypto.name} className="w-8 h-8" />
                    <span className="text-white">{crypto.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage; 