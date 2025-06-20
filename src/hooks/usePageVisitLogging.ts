import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageVisitLogging = () => {
  const location = useLocation();

  useEffect(() => {
    const logPageVisit = async () => {
      try {
        await fetch('/api/log-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: location.pathname,
          }),
        });
      } catch (error) {
        console.error('Failed to log page visit:', error);
      }
    };

    // Log the page visit
    logPageVisit();
  }, [location.pathname]);
};

export default usePageVisitLogging; 