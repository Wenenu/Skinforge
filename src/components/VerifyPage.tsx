import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const search = location.search;

  useEffect(() => {
    const processLogin = async () => {
      try {
        const params = new URLSearchParams(search);
        const claimedId = params.get('openid.claimed_id');
        
        if (!claimedId) {
          throw new Error('Invalid login attempt - no Steam ID found');
        }

        // Extract Steam ID from the claimed ID
        const steamId = claimedId.substring(claimedId.lastIndexOf('/') + 1);
        
        // Sign in the user
        await signIn(steamId);
        
        // Set signed in status in localStorage
        localStorage.setItem('isSignedIn', 'true');
        localStorage.setItem('steamId', steamId);
        
        console.log('Successfully completed sign in process');
        
        // Navigate back to the previous page or home
        const returnPath = localStorage.getItem('returnPath') || '/';
        localStorage.removeItem('returnPath'); // Clean up
        navigate(returnPath);
      } catch (err) {
        console.error('Error during login verification:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setIsProcessing(false);
      }
    };

    if (!search) {
      console.error('No search parameters found in URL');
      setError('Invalid login attempt - no parameters found');
      setIsProcessing(false);
      return;
    }

    processLogin();
  }, [search, navigate, signIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-csfloat-dark text-white">
      <div className="max-w-md w-full text-center p-8">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Verification Failed</h1>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/rent')}
              className="bg-csfloat-blue px-6 py-2 rounded hover:bg-csfloat-blue/80 transition-colors"
            >
              Return to Rent Page
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">Setting up your account...</h1>
            {isProcessing && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue mx-auto mb-4"></div>
                <p className="text-csfloat-light/80">Verifying your Steam account...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage; 