import React from 'react';

const Footer = () => {
  const footerLinks = {
    Products: [
      { name: 'Market', href: '#' }
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

  return (
    <footer className="bg-csfloat-darker border-t border-csfloat-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    <a
                      href={link.href}
                      className="text-csfloat-light/70 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
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
