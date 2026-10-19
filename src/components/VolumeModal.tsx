import React, { useState } from 'react';
import { X, Check, Volume2, VolumeX } from 'lucide-react';
import { VideoClip } from '../types';

interface VolumeModalProps {
  clip: VideoClip;
  onDismiss: () => void;
  onSaveVolume: (volume: number, isMuted: boolean) => void;
}

export const VolumeModal: React.FC<VolumeModalProps> = ({
  clip,
  onDismiss,
  onSaveVolume
}) => {
  const [volume, setVolume] = useState(clip.volume);
  const [isMuted, setIsMuted] = useState(clip.isMuted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#0E131F] border border-[#232B3E] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Volume2 className="w-4 h-4 text-[#7C3AED]" />
            <span>Clip Audio: {clip.name}</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1C2438] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Gain Level</span>
            <span className="text-[#00E5FF] font-mono font-bold text-sm">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={2.0}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-[#7C3AED] bg-[#1A2234] h-2 rounded-lg appearance-none cursor-pointer"
          />

          {/* Mute Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#131826] border border-[#1E2638]">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#7C3AED]" />
              )}
              <span>Mute this clip</span>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isMuted ? 'bg-[#7C3AED]' : 'bg-[#252F47]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2538]">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSaveVolume(volume, isMuted)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(124,58,237,0.3)] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
