import React from 'react';

const InfoSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-csfloat-dark to-csfloat-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Cheap Prices Section */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="gradient-text">Best Prices</span> on the Market
            </h2>
            <p className="text-xl text-csfloat-light/80 mb-8">
              We constantly monitor the market to ensure you get the best value for your money. Our peer-to-peer model means lower fees and bigger savings.
            </p>
            <ul className="space-y-4 text-lg text-csfloat-light/80">
              <li className="flex items-center">
                <svg className="w-6 h-6 text-csfloat-blue mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Up to 30% cheaper than other marketplaces.</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-csfloat-blue mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant price comparisons with competitors.</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-csfloat-blue mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No hidden fees. What you see is what you pay.</span>
              </li>
            </ul>
          </div>

          {/* Reviews Section */}
          <div className="bg-csfloat-darker p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">Loved by the Community</h3>
            <div className="space-y-6">
              <div className="bg-csfloat-dark p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <p className="ml-2 text-white font-semibold">"pretty good and cheap"</p>
                </div>
                <p className="text-csfloat-light/80 italic">"i saved a lot with just renting a knife instead of buying it instead" - <span className="font-semibold text-white">Angeldust</span></p>
              </div>
              <div className="bg-csfloat-dark p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <p className="ml-2 text-white font-semibold">"100% worth it"</p>
                </div>
                <p className="text-csfloat-light/80 italic">"i was able to save a lot by renting instead of actually buying the skins :3" - <span className="font-semibold text-white">Femgore</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
