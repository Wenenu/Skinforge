import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const steamId = searchParams.get('steamId');

    if (!steamId) {
      setStatus('error');
      return;
    }

    // Call the signIn function from your auth context
    signIn(steamId);
    setStatus('success');

    // Redirect to the home page after a short delay
    setTimeout(() => {
      navigate('/');
    }, 2000);

  }, [searchParams, signIn, navigate]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-csfloat-darker text-white">
        <div className="max-w-md w-full text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Verification Failed</h1>
          <p className="mb-4">No Steam ID found in the URL. Cannot complete login.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-csfloat-blue px-6 py-2 rounded hover:bg-csfloat-blue/80 transition-colors"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">
          {status === 'success' ? 'Login Successful!' : 'Verifying your login...'}
        </h1>
        <p className="text-csfloat-light/80">
          {status === 'success' 
            ? 'Redirecting you to the home page...' 
            : 'Please wait while we securely log you in.'
          }
        </p>
      </div>
    </div>
  );
};

export default VerifyPage; 