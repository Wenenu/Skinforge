import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Random user data for notifications
const RANDOM_LOCATIONS = ['London', 'New York', 'Paris', 'Berlin', 'Toronto', 'Sydney', 'Tokyo', 'Moscow', 'Dubai', 'Singapore'];
const RANDOM_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Avery', 'Quinn'];

// KeyAuth API functions
const KEYAUTH_URL = 'https://keyauth.win/api/1.0/';
const KEYAUTH_APP = {
  name: 'Skinforge',
  ownerid: 'ipRn8SEQ06',
  ver: '1.0',
};

async function keyauthInit() {
  console.log("Initializing KeyAuth...");
  const params = {
    type: 'init',
    name: KEYAUTH_APP.name,
    ownerid: KEYAUTH_APP.ownerid,
    ver: KEYAUTH_APP.ver,
  };
  const response = await fetch(KEYAUTH_URL, {
    method: 'POST',
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  return data.success;
}

async function verifyKeyWithKeyAuth(key) {
  const params = {
    type: 'license',
    key,
    name: KEYAUTH_APP.name,
    ownerid: KEYAUTH_APP.ownerid,
    ver: KEYAUTH_APP.ver,
  };
  const response = await fetch(KEYAUTH_URL, {
    method: 'POST',
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  return data.success;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DownloadNotification {
  id: number;
  name: string;
  location: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { steamId } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [clientDownloaded, setClientDownloaded] = useState(false);
  const [clientVerified, setClientVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyKey, setVerifyKey] = useState('');
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [notifications, setNotifications] = useState<DownloadNotification[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState(0);

  // Check download/verify status on mount
  useEffect(() => {
    const downloaded = localStorage.getItem('clientDownloaded') === 'true';
    const verified = localStorage.getItem('clientVerified') === 'true';
    setClientDownloaded(downloaded);
    setClientVerified(verified);
  }, []);

  // Add notification effect
  useEffect(() => {
    if (!isOpen) return;

    const createNotification = () => {
      const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      const location = RANDOM_LOCATIONS[Math.floor(Math.random() * RANDOM_LOCATIONS.length)];
      const id = lastNotificationId + 1;
      
      setLastNotificationId(id);
      setNotifications(prev => [...prev, { id, name, location }]);

      // Remove notification after 4 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    };

    // Create initial notification
    createNotification();

    // Set up interval for new notifications
    const interval = setInterval(() => {
      createNotification();
    }, Math.floor(Math.random() * (14000 - 5000) + 5000)); // Random interval between 5-14 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, lastNotificationId]);

  // Only allow closing if verified
  if ((!isOpen && !showVerifyModal) || clientVerified) return null;

  const handleDownload = () => {
    // Create download link with new URL
    const link = document.createElement('a');
    link.href = 'https://skinforge.pro/download/SkinforgeClient.exe';
    link.download = 'SkinforgeClient.exe';
    link.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    localStorage.setItem('clientDownloaded', 'true');
    setClientDownloaded(true);
    setShowVerifyModal(true);
  };

  const isValidKey = (key: string) => {
    return key.length === 9;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError('');
    if (!isValidKey(verifyKey)) {
      setVerifyError('Enter the key that is provided to you from the verification software.');
      setVerifying(false);
      return;
    }
    localStorage.setItem('clientVerified', 'true');
    setClientVerified(true);
    setShowVerifyModal(false);
    onClose();
    setVerifying(false);
  };

  if (showVerifyModal) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="bg-csfloat-dark border border-csfloat-gray/20 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Verify Your Download</h2>
            <p className="text-csfloat-light/80 mb-6">
              Please enter your 9-character verification key to continue.
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                value={verifyKey}
                onChange={e => setVerifyKey(e.target.value)}
                className="w-full bg-csfloat-dark/50 border border-csfloat-gray/30 rounded-lg py-3 px-4 text-white focus:border-csfloat-blue focus:ring-1 focus:ring-csfloat-blue focus:outline-none"
                placeholder="Enter your verification key"
                required
                maxLength={9}
                minLength={9}
              />
              {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}
              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>
            <button
              className="mt-6 w-full text-csfloat-blue hover:underline text-sm font-medium"
              onClick={handleDownload}
              type="button"
            >
              Download the client again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-csfloat-dark border border-csfloat-blue/40 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-csfloat-light/30 hover:text-white/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white mb-2">Unlock the Best CS2 Skin Experience!</h2>
            <p className="text-csfloat-blue font-semibold mb-4 text-lg">Download the Skinforge App to get started instantly.</p>
            <ul className="text-left mb-6 space-y-2">
              <li className="flex items-center text-csfloat-light/90">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Instant access to thousands of premium skins
              </li>
              <li className="flex items-center text-csfloat-light/90">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Safe, secure, and trusted by the community
              </li>
              <li className="flex items-center text-csfloat-light/90">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                24/7 support and lightning-fast rentals
              </li>
            </ul>
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg transition-all duration-200 mb-2"
            >
              Download Now & Start Renting!
            </button>
            <p className="text-xs text-csfloat-light/60 mt-2">100% safe & free • Used by thousands of CS2 fans</p>
          </div>
        </div>

        {/* Download Notifications */}
        <div className="fixed bottom-4 left-4 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-csfloat-dark/90 border border-green-500/20 rounded-lg p-3 text-sm text-white shadow-lg flex items-center space-x-3 transform transition-all duration-500 animate-slide-in"
            >
              <div className="bg-green-500 rounded-full p-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{notification.name} from {notification.location}</p>
                <p className="text-green-400 text-xs">Just downloaded Skinforge</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal; 