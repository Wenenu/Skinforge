import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadClient } from '../utils/downloadUtils';

const DownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const startDownload = async () => {
      try {
        setDownloadStarted(true);
        
        await downloadClient({
          onProgress: (progress) => {
            setDownloadProgress(progress);
          },
          onError: (errorMessage) => {
            setError(errorMessage);
          },
          onSuccess: () => {
            // Set the installation flag
            localStorage.setItem('skinforge_app_installed', 'true');
            
            // Redirect after a short delay
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        });
      } catch (err) {
        setError('Failed to start download. Please try again.');
        console.error('Download error:', err);
      }
    };

    startDownload();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-csfloat-dark via-csfloat-darker to-csfloat-dark">
      <div className="max-w-md w-full mx-4">
        <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-8 border border-csfloat-gray/20">
          <div className="text-center">
            {!error ? (
              <>
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-4">
                    {downloadStarted ? (
                      <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-16 h-16 text-csfloat-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {downloadStarted ? 'Starting Download...' : 'Preparing Download'}
                  </h2>
                  <p className="text-csfloat-light/70">
                    {downloadStarted
                      ? 'Your download will begin automatically. You will be redirected in a few seconds.'
                      : 'Getting everything ready for you...'}
                  </p>
                  
                  {/* Progress bar */}
                  {downloadProgress > 0 && downloadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-csfloat-gray/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-csfloat-blue to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-csfloat-light/60 mt-2">
                        {Math.round(downloadProgress)}% complete
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 text-sm text-csfloat-light/50">
                  <p>If your download doesn't start automatically,</p>
                  <button
                    onClick={() => downloadClient()}
                    className="text-csfloat-blue hover:text-blue-400 underline mt-1"
                  >
                    click here
                  </button>
                </div>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-white mb-2">Download Failed</h2>
                <p className="text-csfloat-light/70 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-csfloat-blue hover:text-blue-400 underline"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage; 