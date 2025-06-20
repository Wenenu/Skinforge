import React from 'react';
import { Link } from 'react-router-dom';

interface DownloadPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'default' | 'highlight' | 'warning' | 'giveaway';
}

const DownloadPrompt: React.FC<DownloadPromptProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'default'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return {
          border: 'border-csfloat-blue',
          icon: (
            <svg className="w-12 h-12 text-csfloat-blue mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      case 'warning':
        return {
          border: 'border-yellow-500',
          icon: (
            <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'giveaway':
        return {
          border: 'border-purple-500',
          icon: (
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ animation: 'gentlePulse 3s ease-in-out infinite' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          )
        };
      default:
        return {
          border: 'border-csfloat-gray/20',
          icon: (
            <svg className="w-12 h-12 text-csfloat-blue mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          )
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-csfloat-dark/90 rounded-lg p-8 max-w-md w-full border ${variantStyles.border} transform transition-all duration-200 scale-100`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-csfloat-light/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {variantStyles.icon}
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <p className="text-csfloat-light/70 mb-6">{message}</p>
          
          <div className="flex flex-col gap-3">
            <Link
              to="/download"
              className="btn-primary py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200"
            >
              Download Now
            </Link>
            <button
              onClick={onClose}
              className="text-csfloat-light/50 hover:text-white text-sm transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPrompt; 