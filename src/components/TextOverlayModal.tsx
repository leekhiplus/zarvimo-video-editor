import React, { useState } from 'react';
import { X, Check, Type, Sparkles } from 'lucide-react';
import { TextOverlay } from '../types';

interface TextOverlayModalProps {
  currentPlayheadTime: number;
  onDismiss: () => void;
  onAddOverlay: (overlay: TextOverlay) => void;
}

const NEON_PRESETS = [
  { name: 'Neon Cyan', color: '#00E5FF' },
  { name: 'Neon Magenta', color: '#FF007F' },
  { name: 'Neon Violet', color: '#7C3AED' },
  { name: 'Cyber Lime', color: '#39FF14' },
  { name: 'Pure White', color: '#FFFFFF' }
];

export const TextOverlayModal: React.FC<TextOverlayModalProps> = ({
  currentPlayheadTime,
  onDismiss,
  onAddOverlay
}) => {
  const [text, setText] = useState('ZAFRONIX NEON');
  const [color, setColor] = useState('#00E5FF');
  const [fontSize, setFontSize] = useState(28);
  const [duration, setDuration] = useState(3.0);
  const [isNeonGlow, setIsNeonGlow] = useState(true);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddOverlay({
      id: 'text_' + Date.now(),
      text: text.trim(),
      startTime: currentPlayheadTime,
      duration,
      posX: 0.5,
      posY: 0.82,
      fontSize,
      color,
      bgColor: 'rgba(8, 11, 17, 0.75)',
      isNeonGlow
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E131F] border border-[#232B3E] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Type className="w-4 h-4 text-[#FF007F]" />
            <span>Add Neon Text Overlay</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1C2438] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Overlay Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 bg-[#121624] border border-[#232B3E] focus:border-[#FF007F] rounded-xl text-sm text-slate-100 focus:outline-none transition-colors"
            placeholder="Enter title or subtitles..."
          />
        </div>

        {/* Live Preview Box */}
        <div className="w-full h-20 bg-black rounded-xl border border-[#1A2234] flex items-center justify-center overflow-hidden p-2">
          <span
            style={{
              color,
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              textShadow: isNeonGlow ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none'
            }}
            className="truncate select-none"
          >
            {text || 'Preview Text'}
          </span>
        </div>

        {/* Neon Palette */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Color Palette</label>
          <div className="flex items-center gap-2.5">
            {NEON_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => setColor(preset.color)}
                style={{ backgroundColor: preset.color }}
                className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                  color === preset.color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0E131F] scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Font Size</span>
              <span className="font-mono text-slate-200">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[#FF007F] bg-[#1A2234] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Duration</span>
              <span className="font-mono text-slate-200">{duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={10.0}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full accent-[#FF007F] bg-[#1A2234] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Glow toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131826] border border-[#1E2638] text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FF007F]" />
            <span>Neon Bloom & Glow</span>
          </div>
          <button
            onClick={() => setIsNeonGlow(!isNeonGlow)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
              isNeonGlow ? 'bg-[#FF007F]' : 'bg-[#252F47]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isNeonGlow ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
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
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF007F] hover:bg-[#FF3399] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,0,127,0.3)] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Add to Playhead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
