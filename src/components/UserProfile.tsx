import React, { useState, useEffect } from 'react';
import { getSteamProfile } from '../utils/steamAuth';
import { useAuth } from '../hooks/useAuth';

const UserProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const profile = getSteamProfile();
  const { signOut } = useAuth();

  useEffect(() => {
    // Simulate profile loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Reset image error when profile changes
    setImageError(false);
  }, [profile?.avatarmedium]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full border-2 border-csfloat-blue/30 animate-pulse bg-csfloat-blue/20"></div>
        <div className="w-24 h-4 bg-csfloat-blue/20 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!profile) return null;

  const handleImageError = () => {
    console.error('Failed to load Steam avatar image');
    setImageError(true);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        {imageError ? (
          <div className="w-8 h-8 rounded-full border-2 border-csfloat-blue/30 bg-csfloat-dark flex items-center justify-center">
            <span className="text-white text-xs">{profile.personaname.charAt(0)}</span>
          </div>
        ) : (
          <img
            src={profile.avatarmedium}
            alt={`${profile.personaname}'s avatar`}
            className="w-8 h-8 rounded-full border-2 border-csfloat-blue/30"
            onError={handleImageError}
          />
        )}
        <span className="text-white font-medium">{profile.personaname}</span>
      </div>
      <button
        onClick={signOut}
        className="text-csfloat-light/70 hover:text-white transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default UserProfile; 