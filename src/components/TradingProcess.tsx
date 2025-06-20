import React from 'react';

const TradingProcess = () => {
  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Select Your Desired Items",
      description: "Browse and choose from one of the largest collections of CS2 skins.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Notification to Seller",
      description: "Seller is alerted of your purchase and informed to send a trade offer.",
      gradient: "from-purple-500 to-pink-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Trade Offer Sent",
      description: "Seller responds by sending you a trade offer on Steam.",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Confirm Your Trade",
      description: "Review and accept the trade offer to proceed.",
      gradient: "from-yellow-500 to-orange-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Verifying Transaction",
      description: "Our system verifies the successful Steam trade.",
      gradient: "from-red-500 to-rose-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Transaction Complete",
      description: "Seller receives the proceeds post-verification.",
      gradient: "from-indigo-500 to-blue-400"
    }
  ];

  return (
    <section className="py-24 bg-csfloat-darker relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple <span className="gradient-text">Trading Process</span>
          </h2>
          <p className="text-xl text-csfloat-light/80 max-w-3xl mx-auto">
            We've streamlined the trading process to make it as easy as possible. Follow these simple steps to get started.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative bg-csfloat-dark p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-lg p-4 mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                  {step.title}
                </h3>
                <p className="text-csfloat-light/80">
                  {step.description}
                </p>
                
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-4xl font-bold text-csfloat-light/10 group-hover:text-csfloat-light/20 transition-colors duration-300">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TradingProcess;
