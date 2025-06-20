import React from 'react';
import { useNavigate } from 'react-router-dom';

const cashtag = '$Wenenu';

const CashappInstructionsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
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