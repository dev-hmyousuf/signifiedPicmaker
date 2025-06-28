import React from 'react';
import { RotateCw, Eye, ZoomIn, Plus } from 'lucide-react';
import { EditorState } from '../App';

interface ControlPanelProps {
  editorState: EditorState;
  onGlassesUpdate: (updates: Partial<EditorState['glasses']>) => void;
  onAddGlasses: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  editorState,
  onGlassesUpdate,
  onAddGlasses
}) => {
  if (!editorState.glasses.visible) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl">🕶️</div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Add Sunglasses</h3>
          <p className="text-white/70 text-sm mb-6">
            Click below to add our signature orange sunglasses to your photo
          </p>
          <button
            onClick={onAddGlasses}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-all shadow-lg mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Glasses</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <div className="w-5 h-5 bg-orange-500 rounded" />
          <span>Adjust Glasses</span>
        </h3>
      </div>

      <div className="space-y-6">
        {/* Scale Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <ZoomIn className="w-4 h-4" />
            <span>Size ({Math.round(editorState.glasses.scale * 100)}%)</span>
          </label>
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={editorState.glasses.scale}
            onChange={(e) => onGlassesUpdate({ scale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Rotation Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <RotateCw className="w-4 h-4" />
            <span>Rotation ({Math.round(editorState.glasses.rotation)}°)</span>
          </label>
          <input
            type="range"
            min="-45"
            max="45"
            step="1"
            value={editorState.glasses.rotation}
            onChange={(e) => onGlassesUpdate({ rotation: parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Opacity Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Opacity ({Math.round(editorState.glasses.opacity * 100)}%)</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={editorState.glasses.opacity}
            onChange={(e) => onGlassesUpdate({ opacity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Position Info */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="text-sm font-medium text-white mb-2">Position</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/70">X: </span>
              <span className="text-white">{Math.round(editorState.glasses.position.x)}px</span>
            </div>
            <div>
              <span className="text-white/70">Y: </span>
              <span className="text-white">{Math.round(editorState.glasses.position.y)}px</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button
            onClick={() => onGlassesUpdate({ 
              scale: 1, 
              rotation: 0, 
              opacity: 1 
            })}
            className="w-full py-2 px-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded-lg transition-all border border-orange-500/30"
          >
            Reset Adjustments
          </button>
          <button
            onClick={() => onGlassesUpdate({ visible: false })}
            className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all border border-red-500/30"
          >
            Remove Glasses
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;