import type React from 'react';

interface ItemCardProps {
  name: string;
  condition: string;
  price: string;
  salePercentage: string;
  floatValue: string;
  ranking: string;
  sellerStatus: 'online' | 'offline';
  imageUrl: string;
  stickers?: Array<{
    name: string;
    wear: string;
    price: string;
  }>;
}

const ItemCard: React.FC<ItemCardProps> = ({
  name,
  condition,
  price,
  salePercentage,
  floatValue,
  ranking,
  sellerStatus,
  imageUrl,
  stickers = []
}) => {
  return (
    <div className="item-card group cursor-pointer">
      {/* Image container */}
      <div className="relative bg-gradient-to-br from-csfloat-gray/20 to-csfloat-darker/50 p-4 h-48 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {/* Seller status indicator */}
        <div className={`absolute top-2 right-2 flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
          sellerStatus === 'online'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            sellerStatus === 'online' ? 'bg-green-400' : 'bg-gray-400'
          }`} />
          <span className="capitalize">{sellerStatus}</span>
        </div>

        {/* Steam action button */}
        <div className="absolute top-2 left-2">
          <button className="bg-csfloat-blue/80 hover:bg-csfloat-blue text-white p-2 rounded-lg transition-colors duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Item name and condition */}
        <div className="mb-3">
          <h3 className="text-white font-medium text-sm mb-1">{name}</h3>
          <p className="text-csfloat-light/70 text-xs">{condition}</p>
        </div>

        {/* Stickers */}
        {stickers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {stickers.map((sticker, index) => (
              <div key={`${sticker.name}-${sticker.wear}-${index}`} className="text-xs bg-csfloat-gray/20 px-2 py-1 rounded text-csfloat-light/80">
                {sticker.name}
              </div>
            ))}
          </div>
        )}

        {/* Price and sale info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">{price}</span>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400 text-xs font-medium">{salePercentage}</span>
            </div>
          </div>
        </div>

        {/* Float value */}
        <div className="mb-3">
          <div className="text-xs text-csfloat-light/70 mb-1">Float Value</div>
          <div className="text-white font-mono text-sm">{floatValue}</div>
        </div>

        {/* Ranking */}
        <div className="flex items-center space-x-2 text-xs text-csfloat-light/70">
          <span>{ranking}</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Action buttons */}
        <div className="mt-4 space-y-2">
          <button className="w-full bg-csfloat-blue hover:bg-csfloat-blue/90 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
            Add to Cart
          </button>
          <div className="flex space-x-2">
            <button className="flex-1 bg-csfloat-gray/20 hover:bg-csfloat-gray/30 text-csfloat-light py-2 px-4 rounded-lg text-sm transition-colors duration-200">
              Inspect
            </button>
            <button className="flex-1 bg-csfloat-gray/20 hover:bg-csfloat-gray/30 text-csfloat-light py-2 px-4 rounded-lg text-sm transition-colors duration-200">
              Screenshot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
