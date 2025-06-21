import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main privacy policy page
    navigate('/privacy-policy');
  }, [navigate]);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue mx-auto mb-4"></div>
            <p className="text-csfloat-light/80">Redirecting to Privacy Policy...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 