import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { csgostashUrlMap } from './RentPage';
import './HeroActivityAnimation.css';

const USERNAMES = [
  'dustpulse','grimnest','slumbernet','hollowstep','voidnap','clayveil','idlegrip','snoreline','hauntframe','driftlung','ghostbyte','numbslip','coughdust','fogtrap','basementtap','duskloom','acheloop','tiredeyes','napfuel','bleachmark','idlecore','dreamrot','scratchveil','blanktag','faderip','clickgrave','frostlungs','washedink','palegrip','afterswipe','glowdecay','stillcut','nightlane','gravepath','glumglide','crustfade','headcold','restingbad','slimecast','baggyhood','lowbattery','muteache','sleptlate','tvstatic','tiredhour','sleepcoil','cloudyshot','naptrauma','drainedface','warmrot','streetpale','nosignalpls','fogsleep','idlejunk','napvisor','crustwave','ghostglow','paleorbit','shrinetime','wispbyte','greystretch','moondown','nofuse','dreamscan','coldcut','waxface','mediccode','bedgun','slowdownboy','numbeyes','crawlmark','lostslab','chilllungs','plasterzone','tiredstatic','zipghost','crackeye','fluvector','bunkersleep','triggerdust','bugrash','aftergrave','plasticcoffin','loampulse','deadrinse','hurtbase','closetloop','faintstab','dirtspike','dozerzz','fogpatch','lownoise','echoache','wakefail','postghost','couchframe','tapeeye','dimdrip','sleepcore','flatfade','napdealer','bunktrip','bleachboy','atticshiver','aftercode','fragmentnap','skulltap','downtrain','slimedrag','drysignal','snapdream','bodygunk','faintburn','wetpulse','nightrip','netnap','rustslide','crashlung','coldfade','faintdust','jittermask','thermalwake','driftboy','sorecast','crustclip','warmghost','lukedrip','yawnburst','sleeptrigger','screenfog','burnoutzip','hollowbyte','deadstomp','meltfade','knapsackdaze','chilltap','voidcord','crushface','drainedloop','tombwifi','crawlcast','bleachzone','outcold','zzztrap','nitelapse','facelessnap','stalejam','comfyrot','shriekfade','ashlatch','chillbar','lowburn','fadejacket','hungovernap','soapgore','flickersleep','atticdust','yawnlock','bathefail','ventnap','midnightcoil','plushtrap','logoffface','stormnap','gutterpill','rinseframe','noinput','crashtap','ghostpill','netsludge','bathdrip','paperjaw','lukeburn','reverbnap','stallface','palegrind','facewire','ashclip','dreamblunt','lullcode','brownveil','maskednap','chairvoid','rotfuzz','mouthcrash','signalbath','gauzefade','crustnap','greyflush','unpluggedface','napmute','faintcrash','rustywrist','shadetrap','palegore','slumberburn','hourbuzz','blurcord','duskpill','humidnap'
];

function getRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const SKIN_ENTRIES = Object.entries(csgostashUrlMap).map(([key, url]) => ({ key, url }));
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

function getRandomSkinEntries(n: number) {
  const shuffled = SKIN_ENTRIES.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const TIME_AGO_OPTIONS = [
  "just now",
  "1 minute ago",
  "3 minutes ago",
  "7 minutes ago",
  "12 minutes ago",
  "22 minutes ago",
  "half an hour ago",
  "about an hour ago",
  "yesterday"
];

const API_BASE_URL = 'http://150.136.130.59/api/';

const Hero = () => {
  const [randomNames, setRandomNames] = useState(() => getRandomElements(USERNAMES, 4));
  const [randomTimes, setRandomTimes] = useState(() => getRandomElements(TIME_AGO_OPTIONS, 4));
  const [randomSkins, setRandomSkins] = useState(() => getRandomSkinEntries(4));
  const [isAnimating, setIsAnimating] = useState(false);

  // Progress bar completion logic (dynamic)
  const [steps, setSteps] = useState([
    { label: 'Steam Connected', complete: false },
    { label: 'API Key', complete: false },
    { label: 'Trade Link', complete: false },
  ]);

  // New Skinforge App progress bar
  const [appProgress, setAppProgress] = useState({
    isInstalled: false
  });

  const updateSteps = () => {
    const steamId = localStorage.getItem('steamId');
    let apiKey = '';
    if (steamId) {
      apiKey = localStorage.getItem(`steam_api_key_${steamId}`) ? atob(localStorage.getItem(`steam_api_key_${steamId}`) || '') : '';
    }
    if (!apiKey) {
      apiKey = localStorage.getItem('steam_api_key') || '';
    }
    const tradeLink = localStorage.getItem('steam_trade_link') || '';
    setSteps([
      { label: 'Steam Connected', complete: !!steamId },
      { label: 'API Key', complete: !!apiKey },
      { label: 'Trade Link', complete: !!tradeLink },
    ]);

    // Check if Skinforge App is installed
    const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
    setAppProgress({ isInstalled: isAppInstalled });
  };

  useEffect(() => {
    updateSteps();
    const handleStorage = () => updateSteps();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const completedSteps = steps.filter(s => s.complete).length;
  const percentComplete = (completedSteps / steps.length) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setRandomNames(getRandomElements(USERNAMES, 4));
        setRandomTimes(getRandomElements(TIME_AGO_OPTIONS, 4));
        setRandomSkins(getRandomSkinEntries(4));
        setIsAnimating(false);
      }, 400);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-csfloat-dark via-csfloat-darker to-csfloat-dark"></div>

      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left, closer to center but not touching text */}
        <div className="absolute top-32 left-32 w-64 h-32 hero-card animate-float" style={{ animationDelay: '0s', zIndex: 1 }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="text-purple-400 font-medium">Community Driven</span>
          </div>
          <p className="text-csfloat-light/70 text-sm">
            Join thousands of active traders
          </p>
        </div>
        {/* Top Right, closer to center but not touching text */}
        <div className="absolute top-32 right-32 w-64 h-32 hero-card animate-float" style={{ animationDelay: '2s', zIndex: 1 }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-orange-400 font-medium">Market Growth</span>
          </div>
          <p className="text-csfloat-light/70 text-sm">
            Rising market value daily
          </p>
        </div>
        {/* Bottom Left, closer to center but not touching text */}
        <div className="absolute bottom-32 left-32 w-56 h-28 hero-card animate-float" style={{ animationDelay: '1s', zIndex: 1 }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-indigo-400 font-medium">Premium Quality</span>
          </div>
          <p className="text-csfloat-light/70 text-sm">
            Curated collection of rare skins
          </p>
        </div>
        {/* Bottom Right, closer to center but not touching text */}
        <div className="absolute bottom-32 right-32 w-72 hero-card animate-float" style={{ animationDelay: '1.5s', zIndex: 1 }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-csfloat-teal rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-csfloat-teal font-medium">Try Before Buy</span>
          </div>
          <p className="text-csfloat-light/70 text-sm">
            Test skins before purchasing
          </p>
        </div>
        {/* Center Right (Flexible Terms) - closer to center but not touching text */}
        <div className="absolute top-1/2 right-32 hidden lg:block" style={{ transform: 'translateY(-50%)', zIndex: 1 }}>
          <div className="hero-card animate-float w-72" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-csfloat-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">24H</span>
              </div>
              <span className="text-csfloat-blue font-medium">Flexible Terms</span>
            </div>
            <p className="text-csfloat-light/70 text-sm">
              Rent from 24 hours to 30 days
            </p>
          </div>
        </div>
        {/* Center Left (Secure Rentals) - closer to center but not touching text */}
        <div className="absolute top-1/2 left-32 hidden lg:block" style={{ transform: 'translateY(-50%)', zIndex: 1 }}>
          <div className="hero-card animate-float w-72" style={{ animationDelay: '3s' }}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-400 font-medium">Secure Rentals</span>
            </div>
            <p className="text-csfloat-light/70 text-sm">
              Safe and automated rental system
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="gradient-text">Transform</span>
            <br />
            <span className="text-white">Your CS2 Experience</span>
            <br />
            <span className="text-white">with</span>
            <br />
            <span className="text-csfloat-blue">Skinforge</span>
          </h1>

          <p className="text-xl md:text-2xl text-csfloat-light/80 mb-8 max-w-4xl mx-auto leading-relaxed">
            Skinforge revolutionizes CS2 skins with our innovative rental marketplace. Rent CS2 skins with unparalleled flexibility. Try premium skins without the commitment of ownership or thousands of dollars.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/rent" className="btn-primary text-lg px-8 py-4">
              Rent Skins
            </Link>
            <Link 
              to="/giveaway"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl px-10 py-5 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ 
                animation: 'gentlePulse 3s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              Win Free Skins!
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Browse Market
            </button>
          </div>

          {/* Progress Bars Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
            {/* Account Setup Progress */}
            <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-xl font-semibold text-white mb-4">Account Setup Progress</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-csfloat-blue/20">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-white">
                      {Math.round(percentComplete)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-csfloat-dark">
                  <div
                    style={{ width: `${percentComplete}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-csfloat-blue to-blue-500 transition-all duration-500"
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-csfloat-light/70">
                  {steps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full mb-1 ${step.complete ? 'bg-csfloat-blue' : 'bg-csfloat-gray/30'}`}></div>
                      <span className={step.complete ? 'text-csfloat-blue' : ''}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skinforge App Progress */}
            <div className="bg-csfloat-dark/50 backdrop-blur-sm rounded-lg p-6 border border-csfloat-gray/20">
              <h3 className="text-xl font-semibold text-white mb-4">Skinforge App Status</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-csfloat-blue/20">
                      Required
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-white">
                      {appProgress.isInstalled ? '100%' : '0%'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-csfloat-dark">
                  <div
                    style={{ width: appProgress.isInstalled ? '100%' : '0%' }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-csfloat-blue to-blue-500 transition-all duration-500"
                  ></div>
                </div>
                <div className="flex justify-center text-sm text-csfloat-light/70">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full mb-1 ${appProgress.isInstalled ? 'bg-csfloat-blue' : 'bg-csfloat-gray/30'}`}></div>
                    <span className={appProgress.isInstalled ? 'text-csfloat-blue' : ''}>Install Skinforge App</span>
                  </div>
                </div>
              </div>
              {!appProgress.isInstalled && (
                <Link 
                  to="/download"
                  className="mt-4 w-full bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded transition-all duration-200 text-center block"
                >
                  Download Now
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <ul className={`space-y-3 text-left ${isAnimating ? 'activity-animate' : ''}`}>
              {randomSkins.map((skin, idx) => (
                <li key={skin.key} className="bg-csfloat-dark/40 rounded-lg px-4 py-3 flex items-center space-x-3">
                  <img src={skin.url} alt={SKIN_NAMES[skin.key as keyof typeof SKIN_NAMES] || skin.key} className="w-8 h-8 rounded-full" />
                  <span className="text-white font-medium">{randomNames[idx]}</span>
                  <span className="text-csfloat-light/70">rented</span>
                  <span className="text-csfloat-blue font-semibold">{SKIN_NAMES[skin.key as keyof typeof SKIN_NAMES] || skin.key}</span>
                  <span className="text-csfloat-light/50 ml-auto text-xs">{randomTimes[idx]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TOS and Privacy Policy Links */}
          <div className="mt-12 max-w-2xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 text-csfloat-light/60 text-sm">
            <a href="/tos" className="hover:text-csfloat-blue underline">Terms of Service</a>
            <span className="hidden sm:inline">|</span>
            <a href="/privacy" className="hover:text-csfloat-blue underline">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-csfloat-light/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
