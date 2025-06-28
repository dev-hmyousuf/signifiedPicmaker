import React from 'react';
import { Glasses, Headphones, Plus } from 'lucide-react';

interface AssetPanelProps {
  onAssetAdd: (type: 'glasses' | 'headphones', url: string) => void;
}

// Placeholder assets - replace with actual transparent PNGs
const GLASSES_ASSETS = [
  {
    id: 'glasses-1',
    name: 'Classic Sunglasses',
    url: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '🕶️'
  },
  {
    id: 'glasses-2',
    name: 'Aviator Style',
    url: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '🥽'
  },
  {
    id: 'glasses-3',
    name: 'Round Frames',
    url: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '👓'
  }
];

const HEADPHONES_ASSETS = [
  {
    id: 'headphones-1',
    name: 'Over-Ear',
    url: 'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '🎧'
  },
  {
    id: 'headphones-2',
    name: 'Gaming Headset',
    url: 'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '🎮'
  },
  {
    id: 'headphones-3',
    name: 'Studio Monitor',
    url: 'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    preview: '🔊'
  }
];

const AssetPanel: React.FC<AssetPanelProps> = ({ onAssetAdd }) => {
  return (
    <div className="space-y-6">
      {/* Glasses Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Glasses className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Sunglasses</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {GLASSES_ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetAdd('glasses', asset.url)}
              className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10 hover:border-blue-400 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {asset.preview}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{asset.name}</div>
                <div className="text-white/60 text-sm">Click to add</div>
              </div>
              <Plus className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Headphones Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Headphones</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {HEADPHONES_ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetAdd('headphones', asset.url)}
              className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10 hover:border-purple-400 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {asset.preview}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{asset.name}</div>
                <div className="text-white/60 text-sm">Click to add</div>
              </div>
              <Plus className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-white/50 text-sm">
          More assets coming soon! Replace URLs with your transparent PNGs.
        </p>
      </div>
    </div>
  );
};

export default AssetPanel;