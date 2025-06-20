import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const steamId = searchParams.get('steamId');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setIsLoading(false);
      return;
    }

    if (steamId) {
      // Real Steam authentication successful
      signIn(steamId);
      navigate('/profile');
    } else {
      // Fallback to dummy authentication for backward compatibility
      const dummySteamId = 'DUMMY_LOCAL_STEAM_ID';
      signIn(dummySteamId);
      navigate('/profile');
    }
  }, [signIn, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Failed</h1>
            <p className="text-csfloat-light/70 mb-6">{error}</p>
            <button
              onClick={() => navigate('/rent')}
              className="bg-csfloat-blue px-6 py-2 rounded hover:bg-csfloat-blue/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyPage; 