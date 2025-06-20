import React from 'react';
import { Link } from 'react-router-dom';
import { csgostashUrlMap } from '../components/RentPage';

const SKIN_NAMES = {
  'awp_dragon_lore_factory_new': 'AWP | Dragon Lore',
  'karambit_doppler_factory_new': 'Karambit | Doppler',
  'usp_s_kill_confirmed_factory_new': 'USP-S | Kill Confirmed',
  'm4a1s_hyper_beast_factory_new': 'M4A1-S | Hyper Beast',
  'awp_neo_noir_factory_new': 'AWP | Neo-Noir',
  'gloves_specialist_gloves_emerald_web_factory_new': 'Specialist Gloves | Emerald Web',
  'ak47_fire_serpent_factory_new': 'AK-47 | Fire Serpent',
  'm4a4_howl_factory_new': 'M4A4 | Howl',
  'ak47_case_hardened_factory_new': 'AK-47 | Case Hardened',
  'm9_bayonet_marble_fade_factory_new': 'M9 Bayonet | Marble Fade',
  'deagle_blaze_factory_new': 'Desert Eagle | Blaze',
  'ak47_bloodsport_factory_new': 'AK-47 | Bloodsport',
  'glock18_fade_factory_new': 'Glock-18 | Fade',
  'awp_asiimov_factory_new': 'AWP | Asiimov',
  'm4a4_neo_noir_factory_new': 'M4A4 | Neo-Noir',
  'gloves_sport_gloves_vice_factory_new': 'Sport Gloves | Vice',
  'butterfly_knife_fade_factory_new': 'Butterfly Knife | Fade',
  'talon_knife_crimson_web_factory_new': 'Talon Knife | Crimson Web',
  'p90_death_by_kitty_factory_new': 'P90 | Death by Kitty',
  'tec9_nuclear_threat_factory_new': 'Tec-9 | Nuclear Threat',
  'm4a1s_printstream_factory_new': 'M4A1-S | Printstream',
  'ak47_gold_arabesque_factory_new': 'AK-47 | Gold Arabesque',
  'm4a1s_hot_rod_factory_new': 'M4A1-S | Hot Rod',
  'ak47_wild_lotus_factory_new': 'AK-47 | Wild Lotus',
  'ak47_vulcan_factory_new': 'AK-47 | Vulcan',
  'ak47_asiimov_factory_new': 'AK-47 | Asiimov',
  'awp_fade_factory_new': 'AWP | Fade',
  'awp_containment_breach_factory_new': 'AWP | Containment Breach',
  'ak47_neon_rider_factory_new': 'AK-47 | Neon Rider',
  'm4a1s_dark_water_factory_new': 'M4A1-S | Dark Water',
  'usp_s_overgrowth_factory_new': 'USP-S | Overgrowth',
};

// Sample giveaway skins with their values
const giveawaySkins = [
  { id: 'awp_dragon_lore_factory_new', name: 'AWP | Dragon Lore', value: 15000, rarity: 'Covert' },
  { id: 'karambit_doppler_factory_new', name: 'Karambit | Doppler', value: 2500, rarity: 'Covert' },
  { id: 'm4a4_howl_factory_new', name: 'M4A4 | Howl', value: 8000, rarity: 'Covert' },
  { id: 'ak47_fire_serpent_factory_new', name: 'AK-47 | Fire Serpent', value: 3000, rarity: 'Covert' },
  { id: 'deagle_blaze_factory_new', name: 'Desert Eagle | Blaze', value: 2000, rarity: 'Classified' },
  { id: 'butterfly_knife_fade_factory_new', name: 'Butterfly Knife | Fade', value: 1800, rarity: 'Covert' },
  { id: 'gloves_specialist_gloves_emerald_web_factory_new', name: 'Specialist Gloves | Emerald Web', value: 1200, rarity: 'Covert' },
  { id: 'ak47_gold_arabesque_factory_new', name: 'AK-47 | Gold Arabesque', value: 1500, rarity: 'Classified' },
];

const GiveawayPage: React.FC = () => {
  const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';

  return (
    <div className={`min-h-screen bg-gradient-to-b from-csfloat-darker to-black pt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Daily Giveaways
            </span>
          </h1>
          <p className="text-xl text-csfloat-light/80 mb-12 max-w-3xl mx-auto">
            Win premium CS2 skins worth more than $150 every day! Download the Skinforge app and participate in our exclusive giveaways.
          </p>
          {!isAppInstalled && (
            <div className="mt-8">
              <Link 
                to="/download"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 inline-block"
              >
                Download App to Enter
              </Link>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">1. Download the App</h3>
            <p className="text-csfloat-light/70">Get the Skinforge app to access exclusive giveaways and features.</p>
          </div>
          
          <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">2. Enter Daily</h3>
            <p className="text-csfloat-light/70">Participate in our daily giveaways with just a few clicks.</p>
          </div>
          
          <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20 text-center">
            <div className="w-16 h-16 bg-csfloat-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-csfloat-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">3. Win Premium Skins</h3>
            <p className="text-csfloat-light/70">Win skins worth hundreds or thousands of dollars!</p>
          </div>
        </div>

        {/* Featured Giveaway Skins */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Featured Giveaway Skins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giveawaySkins.map((skin) => (
              <div key={skin.id} className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-4 border border-csfloat-gray/20 hover:border-purple-500/50 transition-all duration-200">
                <div className="relative mb-4">
                  <img 
                    src={csgostashUrlMap[skin.id] || '/skins/placeholder.png'} 
                    alt={skin.name}
                    className="w-full h-32 object-contain bg-csfloat-gray/10 rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    ${skin.value.toLocaleString()}
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">{skin.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-csfloat-light/70 text-sm">{skin.rarity}</span>
                  <span className="text-green-400 font-semibold">${skin.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Giveaway Rules */}
        <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-8 border border-csfloat-gray/20 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Giveaway Rules & Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Eligibility</h3>
              <ul className="space-y-2 text-csfloat-light/70">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Must have the Skinforge app installed
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Must be 18 years or older
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Must have a valid Steam account
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  One entry per person per day
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">How to Enter</h3>
              <ul className="space-y-2 text-csfloat-light/70">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Open the Skinforge app
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Navigate to the Giveaways section
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Click "Enter Giveaway"
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  Winners are announced daily at 8 PM EST
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prize Information */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-8 border border-purple-500/30 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Prize Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">Daily</div>
              <p className="text-csfloat-light/70">New giveaways every day</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">$150+</div>
              <p className="text-csfloat-light/70">Minimum skin value</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-csfloat-blue mb-2">Instant</div>
              <p className="text-csfloat-light/70">Winners notified immediately</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Win Premium Skins?</h2>
          <p className="text-xl text-csfloat-light/80 mb-8">
            Download the Skinforge app now and start participating in our daily giveaways!
          </p>
          <Link 
            to="/download"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 inline-block"
          >
            Download App & Start Winning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GiveawayPage; 