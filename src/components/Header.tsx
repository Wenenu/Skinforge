import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignInButton from './SignInButton';
import { useAuth } from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import { useCurrency } from '../contexts/CurrencyContext';
import { getSteamProfile } from '../utils/steamAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { steamId, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
  const [steamProfile, setSteamProfile] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (steamId) {
      const profile = getSteamProfile();
      setSteamProfile(profile);
    } else {
      setSteamProfile(null);
    }
  }, [steamId]);

  // Listen for changes to steam_profile in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'steam_profile' && steamId) {
        const profile = getSteamProfile();
        setSteamProfile(profile);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [steamId]);

  return (
    <>
      {/* Download Promotion Banner */}
      {!isAppInstalled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center">
          <div className="flex items-center justify-center space-x-4">
            <span className="font-medium">Download Skinforge App to participate in daily giveaways!</span>
            <Link 
              to="/giveaway"
              className="bg-white text-purple-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      )}
      
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? `bg-csfloat-dark/95 backdrop-blur-sm border-b border-csfloat-gray/20 py-2 ${!isAppInstalled ? 'top-10' : ''}` 
          : `bg-transparent py-4 ${!isAppInstalled ? 'top-10' : ''}`
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="nav-link flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Market</span>
              </Link>
              <Link to="/rent" className="nav-link flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rent</span>
              </Link>
              <Link to="/giveaway" className="nav-link flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Giveaway</span>
              </Link>
            </nav>

            {/* Center Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="text-2xl md:text-3xl font-bold text-white transition-all duration-300 hover:scale-105">
                Skin<span className="text-csfloat-blue">forge</span>
              </Link>
            </div>

            {/* Right Side - Currency & Auth */}
            <div className="hidden md:flex items-center space-x-4">
              <CurrencySelector
                selectedCurrency={currency}
                onCurrencyChange={setCurrency}
              />
              {steamId ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="text-white hover:text-csfloat-blue transition-colors flex items-center space-x-2">
                    {steamProfile?.avatarmedium ? (
                      <>
                        <img 
                          src={steamProfile.avatarmedium} 
                          alt={steamProfile.personaname || 'Steam Profile'} 
                          className="w-8 h-8 rounded-full border-2 border-csfloat-gray/30"
                        />
                        <span className="hidden lg:block text-sm font-medium">{steamProfile.personaname}</span>
                      </>
                    ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                        <rect x="6" y="16" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </Link>
                  <button onClick={signOut} className="btn-secondary">
                    Sign Out
                  </button>
                </div>
              ) : (
                <SignInButton />
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-csfloat-light/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-csfloat-gray/20">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="nav-link">Market</Link>
                <Link to="/rent" className="nav-link">Rent</Link>
                <Link to="/giveaway" className="nav-link">Giveaway</Link>
                <CurrencySelector
                  selectedCurrency={currency}
                  onCurrencyChange={setCurrency}
                />
                <div className="pt-4 border-t border-csfloat-gray/20">
                  {steamId ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Link to="/profile" className="text-white hover:text-csfloat-blue transition-colors flex items-center space-x-2">
                        {steamProfile?.avatarmedium ? (
                          <>
                            <img 
                              src={steamProfile.avatarmedium} 
                              alt={steamProfile.personaname || 'Steam Profile'} 
                              className="w-8 h-8 rounded-full border-2 border-csfloat-gray/30"
                            />
                            <span className="hidden lg:block text-sm font-medium">{steamProfile.personaname}</span>
                          </>
                        ) : (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                            <rect x="6" y="16" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </Link>
                      <button onClick={signOut} className="btn-secondary w-full">
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <SignInButton />
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
