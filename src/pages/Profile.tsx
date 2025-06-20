import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSteamProfile, fetchSteamProfile, logSteamApiKeyGeneration } from '../utils/steamAuth';
import { useAuth } from '../hooks/useAuth';
import DownloadCTA from '../components/DownloadCTA';
import DownloadModal from '../components/DownloadModal';

const DUMMY_ID = 'DUMMY_LOCAL_STEAM_ID';
const DEFAULT_AVATAR = '/assets/default-avatar.png'; // Place a default avatar image in your public/assets folder

// Helper to try to auto-generate trade link from Steam ID
const getTradeLinkFromSteamId = (steamId: string) => {
  if (!steamId) return '';
  // This is the standard format for Steam trade links
  return `https://steamcommunity.com/tradeoffer/new/?partner=${parseInt(steamId) - 76561197960265728}&token=`;
};

const getUserInfo = async (userId: number) => {
  const res = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'x-admin-token': 'supersecretadmintoken' },
  });
  const users = await res.json();
  return users.find((u: any) => u.id === userId);
};

const saveSteamInfo = async (userId: number, { steam_api_key, trade_url }: { steam_api_key?: string, trade_url?: string }) => {
  return fetch('http://localhost:3000/api/user/steam', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': String(userId),
    },
    body: JSON.stringify({ steam_api_key, trade_url }),
  }).then(res => res.json());
};

const Profile = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isApiKeyFocused, setIsApiKeyFocused] = useState(false);
  const apiKeyInputRef = useRef(null);
  const navigate = useNavigate();
  const { steamId, signOut, isRealAuth } = useAuth();
  const [tradeLink, setTradeLink] = useState('');
  const [tradeLinkAuto, setTradeLinkAuto] = useState('');
  const userId = Number(localStorage.getItem('userId'));
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const isGuest = steamId === DUMMY_ID;
  const displayProfile = profile || {
    personaname: 'Guest User',
    avatarmedium: DEFAULT_AVATAR,
    steamid: 'N/A',
  };

  useEffect(() => {
    if (isGuest) {
      // Only fetch real profile if API key is provided
      if (apiKey && steamId) {
        setIsLoadingProfile(true);
        fetchSteamProfile(steamId, apiKey)
          .then(realProfile => {
            if (realProfile) {
              setProfile(realProfile);
              setMessage('');
            } else {
              setMessage('Failed to fetch Steam profile. Check your API key.');
            }
            setIsLoadingProfile(false);
          })
          .catch(() => {
            setMessage('Failed to fetch Steam profile. Check your API key.');
            setIsLoadingProfile(false);
          });
      } else {
        setProfile(null);
        setIsLoadingProfile(false);
      }
      return;
    }
    // Real user logic (original)
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      let localProfile = getSteamProfile();
      // Try to load trade link from localStorage
      const storedTradeLink = localStorage.getItem('steam_trade_link') || '';
      setTradeLink(storedTradeLink);
      // Try to auto-generate trade link if steamId exists
      if (steamId) {
        const autoLink = getTradeLinkFromSteamId(steamId);
        setTradeLinkAuto(autoLink);
      }
      // If we have both steamId and apiKey, always try to fetch the real profile
      if (steamId && apiKey) {
        const realProfile = await fetchSteamProfile(steamId, apiKey);
        if (realProfile) {
          setProfile(realProfile);
          setIsLoadingProfile(false);
          return;
        }
      }
      // Fallback to local or mock profile
      if (!localProfile) {
        const id = steamId || localStorage.getItem('steamId');
        if (!id) {
          navigate('/rent');
          return;
        }
        localProfile = {
          personaname: `User_${id.slice(-4)}`,
          avatarmedium: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
          steamid: id
        };
        localStorage.setItem('steam_profile', JSON.stringify(localProfile));
      }
      setProfile(localProfile);
      setIsLoadingProfile(false);
    };
    if (!userId) return;
    getUserInfo(userId).then(user => {
      if (user) {
        setApiKey(user.steam_api_key || '');
        setTradeLink(user.trade_url || '');
      }
    });
    loadProfile();
  }, [steamId, navigate, userId, apiKey, isGuest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const result = await saveSteamInfo(userId, { steam_api_key: apiKey });
    if (result.success) {
      setMessage('API key saved!');
    } else {
      setMessage(result.error || 'Failed to save API key');
    }
    setIsLoading(false);
  };

  const handleTradeLinkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const result = await saveSteamInfo(userId, { trade_url: tradeLink });
    if (result.success) {
      setMessage('Trade link saved!');
    } else {
      setMessage(result.error || 'Failed to save trade link');
    }
    setIsLoading(false);
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  // Determine if using mock profile
  const isMockProfile = displayProfile && displayProfile.personaname && displayProfile.personaname.startsWith('User_');

  if (isLoadingProfile) {
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

  if (!displayProfile) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Profile Not Found</h1>
            <button
              onClick={() => navigate('/rent')}
              className="bg-csfloat-blue px-6 py-2 rounded hover:bg-csfloat-blue/80 transition-colors"
            >
              Return to Rent Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Download CTA */}
        <DownloadCTA 
          variant="full" 
          onDownloadClick={handleDownloadClick}
          className="mb-8" 
        />

        <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
          {/* Authentication Status */}
          <div className={`mb-6 p-4 rounded border-l-4 ${
            isRealAuth 
              ? 'bg-green-900/40 border-green-500' 
              : 'bg-yellow-900/40 border-yellow-500'
          }`}>
            <span className={`font-semibold ${
              isRealAuth ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {isRealAuth 
                ? '✅ Real Steam Authentication Active' 
                : '⚠️ Using Demo Authentication - Submit your API Key for full functionality'
              }
            </span>
          </div>

          {/* Notice for API Key */}
          <div className="mb-6 p-4 bg-yellow-900/40 border-l-4 border-yellow-500 rounded">
            <span className="text-yellow-300 font-semibold">To properly display info and for the site to work properly, please submit your API Key.</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={displayProfile.avatarmedium}
                alt={`${displayProfile.personaname}'s avatar`}
                className="w-20 h-20 rounded-full border-2 border-csfloat-blue/30"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{isMockProfile ? 'Default' : displayProfile.personaname}</h1>
                <p className="text-csfloat-light/70">Steam ID: {displayProfile.steamid}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-csfloat-light/70 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-csfloat-dark/30 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Account Statistics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-csfloat-light/70">Member Since</span>
                    <span className="text-white">June 2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-csfloat-light/70">Total Rentals</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-csfloat-light/70">Active Rentals</span>
                    <span className="text-white">0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-csfloat-dark/30 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">API Settings</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-csfloat-light/70 mb-2">
                      Steam API Key
                    </label>
                    <input
                      type="text"
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-csfloat-dark/50 border border-csfloat-gray/30 rounded-lg py-2 px-4 text-white focus:border-csfloat-blue focus:ring-1 focus:ring-csfloat-blue focus:outline-none"
                      placeholder="Enter your Steam API key"
                    />
                    <p className="mt-2 text-sm text-csfloat-light/50">
                      Don't have an API key?{' '}
                      <a
                        href="https://steamcommunity.com/dev/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-csfloat-blue hover:text-blue-400"
                      >
                        Generate one here
                      </a>
                    </p>
                  </div>

                  {/* Only show API key related messages here */}
                  {message && !/Trade link saved!/i.test(message) && (
                    <div className={`p-4 rounded-lg ${
                      /success|refreshed|updated/i.test(message)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-csfloat-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save API Key'}
                  </button>
                </form>
              </div>
              {/* Trade Link Section */}
              <div className="bg-csfloat-dark/30 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Steam Trade Link</h2>
                <div className="mb-2 text-csfloat-light/70 text-sm">
                  <span>Don't know your trade link? </span>
                  <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noopener noreferrer" className="text-csfloat-blue hover:underline">Get it here</a>
                </div>
                <form onSubmit={handleTradeLinkSave} className="space-y-4">
                  <input
                    type="text"
                    value={tradeLink}
                    onChange={e => setTradeLink(e.target.value)}
                    className="w-full bg-csfloat-dark/50 border border-csfloat-gray/30 rounded-lg py-2 px-4 text-white focus:border-csfloat-blue focus:ring-1 focus:ring-csfloat-blue focus:outline-none"
                    placeholder="Paste your Steam trade link here"
                  />
                  <button
                    type="submit"
                    className="w-full bg-csfloat-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Save Trade Link
                  </button>
                </form>
                {/* Only show trade link related messages here */}
                {message && /Trade link saved!/i.test(message) && (
                  <div className="p-4 rounded-lg bg-green-500/20 text-green-400 mt-4">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
};

export default Profile; 