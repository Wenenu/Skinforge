import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const steamId = searchParams.get('steamId');

    if (!steamId) {
      setStatus('error');
      setErrorMessage('No Steam ID found in the URL. Cannot complete login.');
      return;
    }

    const handleSignIn = async () => {
      try {
        setStatus('loading');
        await signIn(steamId);
        setStatus('success');
        
        // Redirect to home page after showing success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to complete sign in.');
      }
    };

    handleSignIn();
  }, [searchParams, signIn, navigate]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-csfloat-darker text-white">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">Verification Failed</h1>
          <p className="mb-6 text-csfloat-light/80">{errorMessage}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-csfloat-blue px-6 py-3 rounded-lg hover:bg-csfloat-blue/80 transition-colors font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-csfloat-darker text-white">
      <div className="max-w-md w-full text-center p-8">
        {status === 'loading' ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-csfloat-blue mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-4">Verifying your login...</h1>
            <p className="text-csfloat-light/80">
              Please wait while we securely log you in with Steam.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Login Successful!</h1>
            <p className="text-csfloat-light/80 mb-6">
              Welcome! You have been successfully signed in with Steam.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-csfloat-light/60">Redirecting you to the home page...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPage; 