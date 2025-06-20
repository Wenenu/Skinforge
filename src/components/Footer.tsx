import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    Products: [
      { name: 'Market', href: '#' },
      { name: 'Giveaways', href: '/giveaway' }
    ],
    Resources: [
      { name: 'FAQ', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Blog', href: '#' }
    ],
    Company: [
      { name: 'Contact', href: '#' }
    ]
  };

  const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';

  return (
    <footer className="bg-csfloat-darker border-t border-csfloat-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Download Promotion Section */}
        {!isAppInstalled && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-2">Get the Full Skinforge Experience</h3>
                <p className="text-csfloat-light/80">
                  Download our app to participate in daily giveaways and unlock exclusive features!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/download"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Download App
                </Link>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('showGiveawayPrompt', {
                      detail: {
                        title: 'Daily Giveaway!',
                        message: 'Download the Skinforge app to enter our daily skin giveaway! Win premium CS2 skins worth up to $1000!',
                        variant: 'giveaway'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Learn About Giveaways
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-2">
            <div className="text-2xl font-bold text-white mb-4">
              Skin<span className="text-csfloat-blue">forge</span>
            </div>
            <p className="text-csfloat-light/70 mb-6 max-w-md">
              The premier destination for all your Counter-Strike 2 skin renting needs.
            </p>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-medium mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-csfloat-light/70 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-csfloat-light/70 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-csfloat-gray/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-csfloat-light/60 text-sm mb-4 md:mb-0">
            © Skinforge Inc. 2025. Not affiliated with Valve Corp.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-csfloat-light/60 hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-csfloat-light/60 hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
