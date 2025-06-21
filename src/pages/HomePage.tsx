import React from 'react';
import Hero from '../components/Hero';
import InfoSection from '../components/InfoSection';
import Features from '../components/Features';
import TradingProcess from '../components/TradingProcess';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-csfloat-dark">
      <Hero />
      <InfoSection />
      <Features />
      <TradingProcess />
    </div>
  );
};

export default HomePage; 