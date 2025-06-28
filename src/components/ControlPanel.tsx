// Updated ControlPanel.jsx
import { Eye, Plus, RotateCw, ZoomIn } from "lucide-react";
import React from "react";
import { EditorState } from "../App";
import glass from '../../public/custom-glasses.png'
interface ControlPanelProps {
  editorState: EditorState;
  onGlassesUpdate: (updates: Partial<EditorState["glasses"]>) => void;
  onAddGlasses: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  editorState,
  onGlassesUpdate,
  onAddGlasses,
}) => {
  if (!editorState.glasses.visible) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
        <div className="text-center py-4 md:py-8">
         
          <button
            onClick={onAddGlasses}
            className="flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all shadow-lg mx-auto text-sm md:text-base w-full flex justify-center items-center"
          >
            <img className="w-12" src={glass} />
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Add Glasses</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-white flex items-center space-x-2">
          <div className="w-4 h-4 md:w-5 md:h-5 bg-orange-500 rounded" />
          <span>Adjust Glasses</span>
        </h3>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Scale Control */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-white mb-2 md:mb-3 flex items-center space-x-2">
            <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
            <span>Size ({Math.round(editorState.glasses.scale * 100)}%)</span>
          </label>
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={editorState.glasses.scale}
            onChange={(e) =>
              onGlassesUpdate({ scale: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 md:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Rotation Control */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-white mb-2 md:mb-3 flex items-center space-x-2">
            <RotateCw className="w-3 h-3 md:w-4 md:h-4" />
            <span>Rotation ({Math.round(editorState.glasses.rotation)}°)</span>
          </label>
          <input
            type="range"
            min="-45"
            max="45"
            step="1"
            value={editorState.glasses.rotation}
            onChange={(e) =>
              onGlassesUpdate({ rotation: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 md:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Opacity Control */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-white mb-2 md:mb-3 flex items-center space-x-2">
            <Eye className="w-3 h-3 md:w-4 md:h-4" />
            <span>
              Opacity ({Math.round(editorState.glasses.opacity * 100)}%)
            </span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={editorState.glasses.opacity}
            onChange={(e) =>
              onGlassesUpdate({ opacity: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 md:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-orange"
          />
        </div>

        {/* Position Info */}
        <div className="bg-white/10 rounded-lg p-3 md:p-4 border border-white/20">
          <div className="text-xs md:text-sm font-medium text-white mb-1 md:mb-2">
            Position
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
            <div>
              <span className="text-white/70">X: </span>
              <span className="text-white">
                {Math.round(editorState.glasses.position.x)}px
              </span>
            </div>
            <div>
              <span className="text-white/70">Y: </span>
              <span className="text-white">
                {Math.round(editorState.glasses.position.y)}px
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 md:space-y-3">
          <button
            onClick={() =>
              onGlassesUpdate({
                scale: 1,
                rotation: 0,
                opacity: 1,
              })
            }
            className="w-full py-1.5 px-3 md:py-2 md:px-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded-lg transition-all border border-orange-500/30 text-xs md:text-sm"
          >
            Reset Adjustments
          </button>
          <button
            onClick={() => onGlassesUpdate({ visible: false })}
            className="w-full py-1.5 px-3 md:py-2 md:px-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all border border-red-500/30 text-xs md:text-sm"
          >
            Remove Glasses
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
