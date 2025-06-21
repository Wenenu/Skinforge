import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignInButton from './SignInButton';
import { useAuth } from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import { useCurrency } from '../contexts/CurrencyContext';
import { getSteamProfile } from '../utils/steamAuth';
import { useMobile } from '../hooks/useMobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { steamId, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
  const [steamProfile, setSteamProfile] = useState<any>(null);
  const mobileInfo = useMobile();

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

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (mobileInfo.isDesktop && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [mobileInfo.isDesktop, isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Download Promotion Banner - Mobile Optimized */}
      {!isAppInstalled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center">
          <div className={`flex items-center justify-center ${mobileInfo.isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
            <span className={`font-medium ${mobileInfo.isMobile ? 'text-sm' : 'text-base'}`}>
              Download Skinforge App to participate in daily giveaways!
            </span>
            <Link 
              to="/giveaway"
              className="bg-white text-purple-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              onClick={handleMenuClose}
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
        <div className={`max-w-7xl mx-auto ${mobileInfo.isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation - Hidden on Mobile */}
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

            {/* Center Logo - Responsive */}
            <div className={`${mobileInfo.isMobile ? 'absolute left-1/2 transform -translate-x-1/2' : 'absolute left-1/2 transform -translate-x-1/2'}`}>
              <Link to="/" className={`${mobileInfo.isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-white transition-all duration-300 hover:scale-105`}>
                Skin<span className="text-csfloat-blue">forge</span>
              </Link>
            </div>

            {/* Right Side - Currency & Auth - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <CurrencySelector
                selectedCurrency={currency}
                onCurrencyChange={setCurrency}
              />
              <Link 
                to="/download" 
                className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </Link>
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
                onClick={handleMenuToggle}
                className="text-csfloat-light/80 hover:text-white p-2 rounded-lg hover:bg-csfloat-gray/20 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Enhanced */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-csfloat-gray/20 bg-csfloat-dark/95 backdrop-blur-sm">
              <nav className="flex flex-col space-y-4">
                {/* Main Navigation Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/" 
                    className="nav-link flex items-center justify-center space-x-2 py-3 px-4 rounded-lg hover:bg-csfloat-gray/20 transition-colors"
                    onClick={handleMenuClose}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Market</span>
                  </Link>
                  <Link 
                    to="/rent" 
                    className="nav-link flex items-center justify-center space-x-2 py-3 px-4 rounded-lg hover:bg-csfloat-gray/20 transition-colors"
                    onClick={handleMenuClose}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Rent</span>
                  </Link>
                  <Link 
                    to="/giveaway" 
                    className="nav-link flex items-center justify-center space-x-2 py-3 px-4 rounded-lg hover:bg-csfloat-gray/20 transition-colors"
                    onClick={handleMenuClose}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Giveaway</span>
                  </Link>
                  <Link 
                    to="/download" 
                    className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                    onClick={handleMenuClose}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </Link>
                </div>

                {/* Currency Selector */}
                <div className="pt-2 border-t border-csfloat-gray/20">
                  <CurrencySelector
                    selectedCurrency={currency}
                    onCurrencyChange={setCurrency}
                  />
                </div>

                {/* User Authentication */}
                <div className="pt-2 border-t border-csfloat-gray/20">
                  {steamId ? (
                    <div className="flex flex-col items-center space-y-3">
                      <Link 
                        to="/profile" 
                        className="text-white hover:text-csfloat-blue transition-colors flex items-center space-x-3 w-full justify-center py-2"
                        onClick={handleMenuClose}
                      >
                        {steamProfile?.avatarmedium ? (
                          <>
                            <img 
                              src={steamProfile.avatarmedium} 
                              alt={steamProfile.personaname || 'Steam Profile'} 
                              className="w-10 h-10 rounded-full border-2 border-csfloat-gray/30"
                            />
                            <span className="text-sm font-medium">{steamProfile.personaname}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                              <rect x="6" y="16" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="text-sm font-medium">Profile</span>
                          </>
                        )}
                      </Link>
                      <button 
                        onClick={() => {
                          signOut();
                          handleMenuClose();
                        }} 
                        className="btn-secondary w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <SignInButton />
                    </div>
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
