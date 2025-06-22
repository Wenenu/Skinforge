import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { getSteamMarketPrice, calculateDailyRate } from '../utils/steamMarket';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency, type SupportedCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { predefinedSkins, PredefinedSkin } from '../utils/predefinedSkins';
import { useCart } from '../contexts/CartContext';
import DownloadModal from './DownloadModal';
import DownloadCTA from './DownloadCTA';
import useDownloadPrompts from '../hooks/useDownloadPrompts';
import { csgostashUrlMap } from '../utils/skinUrls';

interface Skin {
  id: string;
  name: string;
  weapon: {
    id: string;
    weapon_id: number;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  pattern: {
    id: string;
    name: string;
  };
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  stattrak: boolean;
  souvenir: boolean;
  finish_catalog: number;
  images: {
    [key: string]: string;
  };
  image?: string;
  possible: string[];
  types: string[];
  inspect: {
    gen: string | { [key: string]: string };
    links: { [key: string]: string };
  };
  price: number;
  wear: number;
  owner: string;
  minRentDays: number;
  maxRentDays: number;
  dailyRate: number;
  wearName: string;
  lastRented?: string;
}

// Add interface for API data
interface SkinDetails {
  weapon: string;
  weapon_catalog: number;
  finish: string;
  finish_catalog: number;
  rarity: string;
  color: string;
  images: {
    [key: string]: string;
  };
  image?: string;
  possible: string[];
  types: string[];
  inspect: {
    gen: string | { [key: string]: string };
    links: { [key: string]: string };
  };
}

const RentPage = () => {
  const { steamId } = useAuth();
  const [selectedPeriods, setSelectedPeriods] = useState<{[key: string]: number}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [skinsData, setSkinsData] = useState<Skin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, convertPrice } = useCurrency();
  const [convertedPrices, setConvertedPrices] = useState<{[key: string]: number}>({});
  const [convertedDailyRates, setConvertedDailyRates] = useState<{[key: string]: number}>({});
  const location = useLocation();
  const [selectedSkin, setSelectedSkin] = useState<PredefinedSkin | null>(null);
  const [rentDays, setRentDays] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [displayedSkins, setDisplayedSkins] = useState<PredefinedSkin[]>([]);
  const navigate = useNavigate();
  const { addItem, items, removeItem, updateItem } = useCart();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { triggerPrompt } = useDownloadPrompts();

  // Fetch skins data when component mounts
  useEffect(() => {
    const fetchSkins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching skins data...');
        const response = await fetch('https://raw.githubusercontent.com/qwkdev/csapi/main/data.json');
        const data = await response.json();
        
        console.log('Processing skins data...');
        // Take only first 40 skins for initial load to avoid too many API calls
        const entries = Object.entries(data) as [string, SkinDetails][];
        
        // Sort entries by rarity to favor higher quality skins
        const sortedEntries = entries.sort(([, detailsA], [, detailsB]) => {
          const rarityOrder: { [key: string]: number } = {
            'Consumer Grade': 0,
            'Industrial Grade': 1,
            'Mil-Spec Grade': 2,
            'Restricted': 3,
            'Classified': 4,
            'Covert': 5
          };
          return (rarityOrder[detailsB.rarity] ?? 0) - (rarityOrder[detailsA.rarity] ?? 0);
        });

        // Separate high-tier and regular skins
        const highTierEntries: [string, SkinDetails][] = [];
        const regularEntries: [string, SkinDetails][] = [];

        // Categorize skins
        sortedEntries.forEach(([name, details]) => {
          if (name.toLowerCase().includes('knife') || 
              name.toLowerCase().includes('gloves') ||
              name.toLowerCase().includes('dragon') ||
              name.toLowerCase().includes('fade') ||
              details.rarity === 'Covert' ||
              details.rarity === 'Classified') {
            highTierEntries.push([name, details]);
          } else {
            regularEntries.push([name, details]);
          }
        });

        // Take a balanced selection of skins
        const selectedEntries = [
          ...highTierEntries.slice(0, 3), // Take up to 3 high-tier skins
          ...regularEntries.slice(0, 17) // Take up to 17 regular skins
        ].slice(0, 20); // Ensure we don't exceed 20 total

        // Shuffle the selected entries to mix high-tier and regular skins
        for (let i = selectedEntries.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selectedEntries[i], selectedEntries[j]] = [selectedEntries[j], selectedEntries[i]];
        }
        
        // Convert the API data format to our Skin interface
        const processedSkins = await Promise.all(selectedEntries.map(async ([name, details]: [string, SkinDetails]) => {
          const wear = (() => {
            // Bias towards better wear conditions
            const random = Math.random();
            if (random < 0.4) return 'Factory New';
            if (random < 0.7) return 'Minimal Wear';
            if (random < 0.9) return 'Field-Tested';
            if (random < 0.95) return 'Well-Worn';
            return 'Battle-Scarred';
          })();
          
          // Generate market hash name
          const marketHashName = `${name} (${wear})`;
          // Get real market price from Steam
          const marketPrice = await getSteamMarketPrice(marketHashName);
          // Calculate daily rate based on market price
          const dailyRate = calculateDailyRate(marketPrice);
          
          return {
            id: `${name.replace(/\s+/g, '_')}_${wear.replace(/\s+/g, '_')}_${details.weapon_catalog}_${details.finish_catalog || '0'}`,
            name: name,
            weapon: {
              id: details.weapon.toLowerCase(),
              weapon_id: details.weapon_catalog,
              name: details.weapon
            },
            category: {
              id: 'weapon_category',
              name: details.weapon.includes('Knife') ? 'Knives' : 'Weapons'
            },
            pattern: {
              id: details.finish.toLowerCase().replace(/\s+/g, '_'),
              name: details.finish
            },
            rarity: {
              id: details.rarity.toLowerCase().replace(/\s+/g, '_'),
              name: details.rarity,
              color: details.color
            },
            stattrak: Math.random() < 0.3, // 30% chance for StatTrak
            souvenir: Math.random() < 0.2, // 20% chance for Souvenir
            finish_catalog: details.finish_catalog,
            images: details.images,
            image: details.image,
            possible: details.possible,
            types: details.types,
            inspect: details.inspect,
            price: marketPrice,
            wear: Math.random() * 0.2 + 0.8, // Bias towards better float values (0.8-1.0)
            owner: 'SteamUser' + Math.floor(Math.random() * 1000),
            minRentDays: 1,
            maxRentDays: 30,
            dailyRate: dailyRate,
            wearName: wear
          };
        }));

        console.log(`Processed ${processedSkins.length} skins`);
        setSkinsData(processedSkins);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching skins:', error);
        setError('Failed to load skins. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchSkins();
  }, []);

  // Effect to handle currency conversions
  useEffect(() => {
    const updatePrices = async () => {
      const newPrices: {[key: string]: number} = {};
      const newDailyRates: {[key: string]: number} = {};
      for (const skin of skinsData) {
        const converted = await convertPrice(skin.price, 'USD');
        const convertedDaily = await convertPrice(skin.dailyRate, 'USD');
        newPrices[skin.id] = converted;
        newDailyRates[skin.id] = convertedDaily;
      }
      // Check if all prices are the same (possible bug)
      const uniquePrices = new Set(Object.values(newPrices));
      if (uniquePrices.size === 1 && skinsData.length > 1) {
        skinsData.forEach(skin => {
          newPrices[skin.id] = skin.price;
          newDailyRates[skin.id] = skin.dailyRate;
        });
      }
      setConvertedPrices(newPrices);
      setConvertedDailyRates(newDailyRates);
    };
    if (skinsData.length > 0) {
      updatePrices();
    }
  }, [currency, skinsData, convertPrice]);

  // Update total price when currency changes
  useEffect(() => {
    if (selectedSkin) {
      const convertedDailyRate = convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate;
      setTotalPrice(calculateDiscountedTotal(convertedDailyRate, rentDays));
    }
  }, [currency, selectedSkin, rentDays, convertedDailyRates]);

  const getImageUrl = (skin: Skin | any) => {
    // Only use csgostashUrlMap and fallback to placeholder
    if (csgostashUrlMap[skin.id]) return csgostashUrlMap[skin.id];
    return '/skins/placeholder.png';
  };

  // Function to handle image load errors
  const handleImageError = (skinId: string) => {
    console.error(`Failed to load image for skin ${skinId}`);
    // You could set a fallback image here if needed
  };

  // Add initial randomization effect
  useEffect(() => {
    // Randomize skins on first load
    setShuffleTrigger(Math.random());
    // Also set initial filtered skins
    const shuffledSkins = [...skinsData].sort(() => Math.random() - 0.5);
    setFilteredSkins(shuffledSkins.slice(0, 6));
  }, [skinsData]);

  useEffect(() => {
    const processSkins = () => {
      let tempSkins = [...skinsData];

      // Filter by search query
      if (searchQuery) {
        tempSkins = tempSkins.filter(skin =>
          skin.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by price
      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(Number);
        tempSkins = tempSkins.filter(skin => skin.price >= min && (max ? skin.price <= max : true));
      }

      // Sort skins
      switch (sortBy) {
        case 'popular':
          tempSkins.sort((a, b) => {
            // Prioritize high rarity skins
            const rarityOrder: { [key: string]: number } = {
              'Consumer Grade': 0,
              'Industrial Grade': 1,
              'Mil-Spec Grade': 2,
              'Restricted': 3,
              'Classified': 4,
              'Covert': 5
            };
            const rarityDiff = (rarityOrder[b.rarity.name] ?? 0) - (rarityOrder[a.rarity.name] ?? 0);
            if (rarityDiff !== 0) return rarityDiff;
            
            // Then consider price and wear
            return b.price * (1 - b.wear) - a.price * (1 - a.wear);
          });
          break;
        case 'newest':
          tempSkins.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'price_asc':
          tempSkins.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          tempSkins.sort((a, b) => b.price - a.price);
          break;
      }

      // Ensure at least 2 high-tier skins (if available) and fill the rest
      const highTierSkins = tempSkins.filter(skin => 
        skin.name.toLowerCase().includes('knife') ||
        skin.name.toLowerCase().includes('gloves') ||
        skin.name.toLowerCase().includes('dragon') ||
        skin.name.toLowerCase().includes('fade') ||
        skin.rarity.name === 'Covert' ||
        skin.rarity.name === 'Classified'
      );

      const otherSkins = tempSkins.filter(skin => 
        !highTierSkins.includes(skin)
      );

      // Shuffle both arrays separately
      for (let i = highTierSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [highTierSkins[i], highTierSkins[j]] = [highTierSkins[j], highTierSkins[i]];
      }

      for (let i = otherSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSkins[i], otherSkins[j]] = [otherSkins[j], otherSkins[i]];
      }

      // Take 2-3 high-tier skins (if available) and fill the rest with other skins
      const numHighTier = Math.min(3, highTierSkins.length);
      const finalSkins = [
        ...highTierSkins.slice(0, numHighTier),
        ...otherSkins.slice(0, 6 - numHighTier)
      ];

      // Shuffle the final selection to mix high-tier and regular skins
      for (let i = finalSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalSkins[i], finalSkins[j]] = [finalSkins[j], finalSkins[i]];
      }

      setFilteredSkins(finalSkins);
    };

    processSkins();
  }, [searchQuery, priceFilter, sortBy, shuffleTrigger, skinsData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openid.op_endpoint') === 'https://steamcommunity.com/openid/login' && window.opener) {
      const claimedId = params.get('openid.claimed_id');
      if (claimedId) {
        // In a real app, you would take these parameters and send them to your backend
        // to verify the login with Steam's API. For now, we'll simulate success.
        window.opener.postMessage({ type: 'steam_login_success', steamId: claimedId.substring(claimedId.lastIndexOf('/') + 1) }, window.location.origin);
      } else {
        window.opener.postMessage({ type: 'steam_login_failure' }, window.location.origin);
      }
      window.close();
    }
  }, []);

  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'consumer grade': return 'bg-gray-500';
      case 'industrial grade': return 'bg-blue-500';
      case 'mil-spec grade': return 'bg-blue-600';
      case 'restricted': return 'bg-purple-500';
      case 'classified': return 'bg-pink-500';
      case 'covert': return 'bg-red-500';
      case 'contraband': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const handleLogin = () => {
    // Save the current path for return after login
    localStorage.setItem('returnPath', window.location.pathname);

    // Redirect to the backend's Steam authentication route
    window.location.href = 'http://150.136.130.59:3002/auth/steam';
  };

  const handleShuffle = () => {
    setShuffleTrigger(c => c + 1);
  };

  const calculateRentCost = (skinId: string, days: number) => {
    const dailyRate = convertedDailyRates[skinId] || 0;
    return formatCurrency(dailyRate * days, currency);
  };

  const handlePeriodChange = (skinId: string, value: number) => {
    setSelectedPeriods(prev => ({
      ...prev,
      [skinId]: value
    }));
  };

  useEffect(() => {
    // Randomly select 6 skins from the predefined list
    const shuffled = [...predefinedSkins].sort(() => 0.5 - Math.random());
    setDisplayedSkins(shuffled.slice(0, 6));
  }, []);

  const handleSkinSelect = (skin: PredefinedSkin) => {
    setSelectedSkin(skin);
    setRentDays(1);
    const dailyRate = convertedDailyRates[skin.id] || skin.dailyRate;
    setTotalPrice(calculateDiscountedTotal(dailyRate, 1));
  };

  const handleDaysChange = (days: number) => {
    if (selectedSkin) {
      setRentDays(days);
      const dailyRate = convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate;
      const newTotalPrice = calculateDiscountedTotal(dailyRate, days);
      setTotalPrice(newTotalPrice);
      
      // Update cart if item exists
      if (items.some(item => item.id === selectedSkin.id)) {
        updateItem(selectedSkin.id, days);
      }
    }
  };

  // Discount calculation based on rental days
  const getDiscount = (days: number) => {
    if (days >= 30) return 0.20;
    if (days >= 21) return 0.15;
    if (days >= 14) return 0.10;
    if (days >= 7) return 0.05;
    return 0;
  };

  const calculateDiscountedTotal = (dailyRate: number, days: number) => {
    const discount = getDiscount(days);
    const total = dailyRate * days * (1 - discount);
    return total;
  };

  const handleAddToCart = () => {
    if (selectedSkin) {
      addItem({
        id: selectedSkin.id,
        name: selectedSkin.name,
        image: getImageUrl(selectedSkin),
        dailyRate: convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate,
        rentDays,
        totalPrice
      });
      setSelectedSkin(null);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleRentClick = () => {
    const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
    if (!isAppInstalled) {
      triggerPrompt('action');
      return;
    }

    // Only proceed with authentication check if app is installed
    if (!steamId) {
      handleLogin();
    } else {
      if (selectedSkin) {
        navigate('/payment', {
          state: {
            skin: selectedSkin,
            rentDays: rentDays,
            totalPrice: totalPrice
          }
        });
      }
    }
  };

  const renderSkinsContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue mx-auto mb-4"></div>
            <p>Loading skins...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-csfloat-blue px-4 py-2 rounded hover:bg-csfloat-blue/80"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSkins.slice(0, 12).map((skin) => (
          <div
            key={skin.id}
            className={`item-card p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedSkin?.id === skin.id ? 'ring-2 ring-csfloat-accent' : ''
            }`}
            onClick={() => handleSkinSelect(skin)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{skin.name}</h3>
              <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: skin.rarity.color + '20', color: skin.rarity.color }}>
                {skin.rarity.name}
              </span>
            </div>
            
            <div className="relative aspect-video mb-4">
              <img
                src={getImageUrl(skin)}
                alt={skin.name}
                className="w-full h-full object-contain"
                onError={() => handleImageError(skin.id)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-csfloat-gray">Steam Market</p>
                <p className="text-lg font-semibold">{formatCurrency(convertedPrices[skin.id] ?? skin.price, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-csfloat-gray">Daily Rate</p>
                <p className="text-lg font-semibold">{formatCurrency(convertedDailyRates[skin.id] ?? skin.dailyRate, currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedSkinFooter = () => {
    if (!selectedSkin) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-csfloat-dark/95 backdrop-blur-sm border-t border-csfloat-gray/20 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(selectedSkin)}
                alt={selectedSkin.name}
                className="w-16 h-16 object-contain"
                onError={() => handleImageError(selectedSkin.id)}
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedSkin.name}</h3>
                <p className="text-sm text-csfloat-gray">Daily Rate: {formatCurrency(convertedDailyRates[selectedSkin.id] ?? selectedSkin.dailyRate, currency)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDaysChange(Math.max(1, rentDays - 1))}
                  className="btn-secondary px-3 py-1"
                >
                  -
                </button>
                <span className="w-12 text-center">{rentDays} days</span>
                <button
                  onClick={() => handleDaysChange(Math.min(30, rentDays + 1))}
                  className="btn-secondary px-3 py-1"
                >
                  +
                </button>
              </div>
              
              <div className="w-px h-8 bg-csfloat-gray/20 mx-4"></div>
              
              <div className="text-right">
                <p className="text-sm text-csfloat-gray">Total Price</p>
                <p className="text-xl font-bold">{formatCurrency(totalPrice, currency)}</p>
              </div>
              
              <div className="w-px h-8 bg-csfloat-gray/20 mx-4"></div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  className="btn-secondary px-6 py-2"
                >
                  Add to Cart
                </button>
                <button
                  className={`w-full py-2 px-4 rounded ${
                    selectedSkin ? 'bg-csfloat-blue hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'
                  } text-white font-semibold transition-colors duration-200`}
                  onClick={handleRentClick}
                  disabled={!selectedSkin}
                >
                  {selectedSkin ? 'Rent Now' : 'Select a Skin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!steamId) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-csfloat-blue to-blue-400">
              Rent Premium CS2 Skins
            </h1>
            <p className="text-xl text-csfloat-light/80 mb-12 max-w-2xl mx-auto">
              Access high-tier skins without the commitment. Connect with Steam to browse our curated collection of premium CS2 skins available for rent.
            </p>
            <button 
              onClick={handleLogin}
              className="btn-primary flex items-center space-x-3 mx-auto px-8 py-4 text-lg bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-csfloat-blue/20"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" alt="Steam Logo" className="w-6 h-6" />
              <span>Sign in through Steam</span>
            </button>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Featured Skins Available for Rent</h2>
            {renderSkinsContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      {/* Download Promotion Banner */}
      {localStorage.getItem('skinforge_app_installed') !== 'true' && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-2">Ready to Rent Premium Skins?</h3>
                <p className="text-csfloat-light/80">
                  Download the Skinforge app to start renting and participate in daily giveaways!
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
        </div>
      )}

      {/* Floating Download CTA */}
      <DownloadCTA variant="floating" onDownloadClick={handleDownloadClick} />

      {/* Main content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${localStorage.getItem('skinforge_app_installed') !== 'true' ? 'pt-10' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Available Skins for Rent</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadClick}
              className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Client</span>
            </button>
            <UserProfile />
            {items.length > 0 && (
              <button
                onClick={() => navigate('/payment', { state: { items } })}
                className="bg-csfloat-blue px-6 py-2 rounded-lg hover:bg-csfloat-blue/80 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Checkout ({items.length})</span>
              </button>
            )}
          </div>
        </div>
        {/* Search and Filters */}
        {/* Removed search input, shuffle button, and price filter dropdown */}

        {renderSkinsContent()}
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      )}

      {selectedSkin && renderSelectedSkinFooter()}
    </div>
  );
};

export default RentPage; 