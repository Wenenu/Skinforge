import { useState, useEffect, useCallback } from 'react';

interface DownloadPromptConfig {
  title: string;
  message: string;
  variant?: 'default' | 'highlight' | 'warning' | 'giveaway';
}

export const useDownloadPrompts = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptConfig, setPromptConfig] = useState<DownloadPromptConfig>({
    title: '',
    message: '',
    variant: 'default'
  });
  const [lastPromptTime, setLastPromptTime] = useState<number>(
    parseInt(localStorage.getItem('lastDownloadPromptTime') || '0')
  );

  // Check if app is installed
  const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';

  // Configurations for different prompts
  const PROMPT_CONFIGS = {
    idle: {
      title: 'Ready to Enhance Your CS2 Experience?',
      message: 'Download our app now to start managing and renting skins seamlessly.',
      variant: 'default'
    } as DownloadPromptConfig,
    browsing: {
      title: 'Get the Full Experience',
      message: 'Install our app to unlock all features and start renting skins instantly.',
      variant: 'highlight'
    } as DownloadPromptConfig,
    action: {
      title: 'App Required',
      message: 'To complete this action, you\'ll need to install the Skinforge app first.',
      variant: 'warning'
    } as DownloadPromptConfig
  };

  // Function to show prompt with specific config
  const triggerPrompt = useCallback((type: keyof typeof PROMPT_CONFIGS | 'custom', customConfig?: DownloadPromptConfig) => {
    if (isAppInstalled) return;

    const now = Date.now();
    const timeSinceLastPrompt = now - lastPromptTime;
    const MIN_PROMPT_INTERVAL = 5 * 60 * 1000; // 5 minutes

    if (timeSinceLastPrompt >= MIN_PROMPT_INTERVAL) {
      if (type === 'custom' && customConfig) {
        setPromptConfig(customConfig);
      } else {
        setPromptConfig(PROMPT_CONFIGS[type as keyof typeof PROMPT_CONFIGS]);
      }
      setShowPrompt(true);
      setLastPromptTime(now);
      localStorage.setItem('lastDownloadPromptTime', now.toString());
    }
  }, [isAppInstalled, lastPromptTime]);

  // Auto-trigger idle prompt after some time
  useEffect(() => {
    if (isAppInstalled) return;

    const IDLE_PROMPT_DELAY = 2 * 60 * 1000; // 2 minutes
    const timer = setTimeout(() => {
      triggerPrompt('idle');
    }, IDLE_PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [isAppInstalled, triggerPrompt]);

  // Handle user activity
  useEffect(() => {
    if (isAppInstalled) return;

    let pageViewCount = parseInt(localStorage.getItem('pageViewCount') || '0');
    pageViewCount++;
    localStorage.setItem('pageViewCount', pageViewCount.toString());

    // Show browsing prompt every 3 page views
    if (pageViewCount % 3 === 0) {
      triggerPrompt('browsing');
    }
  }, [isAppInstalled, triggerPrompt]);

  // Listen for custom giveaway events
  useEffect(() => {
    const handleGiveawayEvent = (event: CustomEvent) => {
      if (event.detail && event.detail.title && event.detail.message) {
        triggerPrompt('custom', {
          title: event.detail.title,
          message: event.detail.message,
          variant: event.detail.variant || 'giveaway'
        });
      }
    };

    window.addEventListener('showGiveawayPrompt', handleGiveawayEvent as EventListener);
    
    return () => {
      window.removeEventListener('showGiveawayPrompt', handleGiveawayEvent as EventListener);
    };
  }, [triggerPrompt]);

  const closePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    promptConfig,
    triggerPrompt,
    closePrompt
  };
};

export default useDownloadPrompts; 