import React from 'react';

interface DownloadCTAProps {
  variant?: 'full' | 'compact' | 'floating';
  className?: string;
  onDownloadClick: () => void;
}

const DownloadCTA: React.FC<DownloadCTAProps> = ({ 
  variant = 'full',
  className = '',
  onDownloadClick
}) => {
  if (variant === 'compact') {
    return (
      <div className={`bg-csfloat-dark/80 backdrop-blur-sm rounded-lg p-4 border border-csfloat-gray/20 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Download Required</h3>
            <p className="text-csfloat-light/70 text-sm">Download our client to start renting skins</p>
          </div>
          <button
            onClick={onDownloadClick}
            className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Download Now
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onDownloadClick}
          className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Client</span>
        </button>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`bg-gradient-to-br from-csfloat-dark/90 to-csfloat-darker/90 backdrop-blur-sm rounded-lg p-8 border border-csfloat-gray/20 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Start Renting?</h2>
          <p className="text-csfloat-light/70 mb-4">
            Download our secure client to start renting and managing your CS2 skins. Fast, safe, and easy to use.
          </p>
          <ul className="space-y-2">
            {['Secure Trading System', 'Instant Skin Access', '24/7 Support'].map((feature) => (
              <li key={feature} className="flex items-center text-csfloat-light/70">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center text-center">
          <button
            onClick={onDownloadClick}
            className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg transition-all duration-200 font-medium text-lg mb-3"
          >
            Download Now
          </button>
          <span className="text-csfloat-light/50 text-sm">Quick & Easy Setup</span>
        </div>
      </div>
    </div>
  );
};

export default DownloadCTA; 