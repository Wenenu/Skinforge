import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignInButton from './SignInButton';
import { useAuth } from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import { useCurrency } from '../contexts/CurrencyContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { steamId, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-csfloat-dark/95 backdrop-blur-sm border-b border-csfloat-gray/20 py-2' 
        : 'bg-transparent py-4'
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
                <Link to="/profile" className="text-white hover:text-csfloat-blue transition-colors flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <rect x="6" y="16" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
                  </svg>
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
              <CurrencySelector
                selectedCurrency={currency}
                onCurrencyChange={setCurrency}
              />
              <div className="pt-4 border-t border-csfloat-gray/20">
                {steamId ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Link to="/profile" className="text-white hover:text-csfloat-blue transition-colors flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                        <rect x="6" y="16" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2" />
                      </svg>
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
  );
};

export default Header;
