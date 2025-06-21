import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { csgostashUrlMap } from './RentPage';
import './HeroActivityAnimation.css';
import { useMobile } from '../hooks/useMobile';

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

const getUserInfo = async (userId: number) => {
  const res = await fetch(API_BASE_URL + 'admin/users', {
    headers: { 'x-admin-token': 'supersecretadmintoken' },
  });
  const users = await res.json();
  return users.find((u: any) => u.id === userId);
};

const Hero = () => {
  const [randomNames, setRandomNames] = useState(() => getRandomElements(USERNAMES, 4));
  const [randomTimes, setRandomTimes] = useState(() => getRandomElements(TIME_AGO_OPTIONS, 4));
  const [randomSkins, setRandomSkins] = useState(() => getRandomSkinEntries(4));
  const [isAnimating, setIsAnimating] = useState(false);
  const mobileInfo = useMobile();

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
    <section className={`relative min-h-screen flex items-center justify-center ${mobileInfo.isMobile ? 'pt-24' : 'pt-32'} overflow-hidden`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-csfloat-dark via-csfloat-darker to-csfloat-dark"></div>

      {/* Floating background elements - Hidden on mobile for better performance */}
      {!mobileInfo.isMobile && (
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
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 text-center ${mobileInfo.isMobile ? 'px-4' : 'px-8'}`}>
        {/* Hero Title */}
        <h1 className={`${mobileInfo.isMobile ? 'text-3xl md:text-4xl' : 'text-5xl md:text-6xl lg:text-7xl'} font-bold text-white mb-6 leading-tight`}>
          The Ultimate{' '}
          <span className="bg-gradient-to-r from-csfloat-blue via-blue-400 to-purple-500 bg-clip-text text-transparent">
            CS2 Skin
          </span>{' '}
          Experience
        </h1>

        {/* Hero Subtitle */}
        <p className={`${mobileInfo.isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} text-csfloat-light/80 mb-8 max-w-3xl mx-auto leading-relaxed`}>
          Rent premium CS2 skins instantly. No waiting, no hassle. 
          <span className="text-csfloat-blue font-semibold"> Try before you buy</span> with our revolutionary rental system.
        </p>

        {/* CTA Buttons */}
        <div className={`flex ${mobileInfo.isMobile ? 'flex-col space-y-4' : 'flex-row space-x-6'} justify-center items-center mb-12`}>
          <Link
            to="/rent"
            className={`${mobileInfo.isMobile ? 'w-full' : ''} bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start Renting Now</span>
          </Link>
          
          <Link
            to="/download"
            className={`${mobileInfo.isMobile ? 'w-full' : ''} bg-csfloat-dark/50 border border-csfloat-blue/30 hover:border-csfloat-blue/50 text-csfloat-blue font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:bg-csfloat-blue/10 flex items-center justify-center space-x-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download App</span>
          </Link>
        </div>

        {/* Progress Section */}
        <div className={`${mobileInfo.isMobile ? 'px-4' : 'px-8'} max-w-2xl mx-auto mb-8`}>
          <div className="bg-csfloat-dark/30 backdrop-blur-sm border border-csfloat-gray/20 rounded-2xl p-6">
            <h3 className={`${mobileInfo.isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-4`}>
              Setup Progress
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`${mobileInfo.isMobile ? 'text-sm' : 'text-base'} text-csfloat-light/80`}>
                    {step.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    {step.complete ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-csfloat-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-csfloat-light/60 mb-2">
                <span>Progress</span>
                <span>{Math.round(percentComplete)}%</span>
              </div>
              <div className="w-full bg-csfloat-gray/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-csfloat-blue to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed - Mobile Optimized */}
        {!mobileInfo.isMobile && (
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-csfloat-dark/80 backdrop-blur-sm border border-csfloat-gray/20 rounded-xl p-4">
              <h4 className="text-csfloat-blue font-semibold mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Activity</span>
              </h4>
              <div className="space-y-2">
                {randomNames.map((name, index) => (
                  <div key={index} className={`flex items-center justify-between text-sm ${isAnimating ? 'opacity-50' : 'opacity-100'} transition-opacity duration-400`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-csfloat-light/60">{name}</span>
                      <span className="text-csfloat-light/40">rented</span>
                      <span className="text-csfloat-blue font-medium">{SKIN_NAMES[randomSkins[index]?.key as keyof typeof SKIN_NAMES] || 'Premium Skin'}</span>
                    </div>
                    <span className="text-csfloat-light/40 text-xs">{randomTimes[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Activity Feed */}
        {mobileInfo.isMobile && (
          <div className="mt-8 px-4">
            <div className="bg-csfloat-dark/80 backdrop-blur-sm border border-csfloat-gray/20 rounded-xl p-4">
              <h4 className="text-csfloat-blue font-semibold mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Activity</span>
              </h4>
              <div className="space-y-2">
                {randomNames.slice(0, 2).map((name, index) => (
                  <div key={index} className={`flex items-center justify-between text-xs ${isAnimating ? 'opacity-50' : 'opacity-100'} transition-opacity duration-400`}>
                    <div className="flex items-center space-x-1">
                      <span className="text-csfloat-light/60">{name}</span>
                      <span className="text-csfloat-light/40">rented</span>
                      <span className="text-csfloat-blue font-medium truncate max-w-20">
                        {SKIN_NAMES[randomSkins[index]?.key as keyof typeof SKIN_NAMES] || 'Skin'}
                      </span>
                    </div>
                    <span className="text-csfloat-light/40 text-xs">{randomTimes[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
