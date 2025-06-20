import React from 'react';
import { useNavigate } from 'react-router-dom';

const cashtag = '$Wenenu';

const CashappInstructionsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      {/* Download Promotion Banner */}
      {localStorage.getItem('skinforge_app_installed') !== 'true' && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-2">Complete Your Payment with the App</h3>
                <p className="text-csfloat-light/80">
                  Download the Skinforge app to complete your payment and participate in weekly giveaways!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate('/download')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Download App
                </button>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('showGiveawayPrompt', {
                      detail: {
                        title: 'Weekly Giveaway!',
                        message: 'Download the Skinforge app to enter our weekly skin giveaway! Win premium CS2 skins worth up to $1000!',
                        variant: 'giveaway'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Learn About Giveaways
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
          <button onClick={() => navigate(-1)} className="mb-6 text-csfloat-blue hover:underline">&larr; Back</button>
          <h1 className="text-2xl font-bold text-white mb-6">Cash App Payment Instructions</h1>
          <p className="text-csfloat-light/70 mb-4">Send the payment to the following Cashtag. Include your Steam ID in the payment note.</p>
          <div className="flex items-center space-x-4 p-4 bg-csfloat-dark/70 rounded-lg">
            <img src="/assets/cashapp.png" alt="Cash App" className="w-8 h-8" />
            <div className="flex-1">
              <span className="text-white font-semibold">{cashtag}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-500 text-sm">
              After sending, payment will be confirmed as soon as possible. If you have any issues, contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashappInstructionsPage; 