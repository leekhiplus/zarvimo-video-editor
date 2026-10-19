import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop } from 'lucide-react';
import { VideoClip } from '../types';

interface TrimModalProps {
  clip: VideoClip;
  onDismiss: () => void;
  onSaveTrim: (startOffset: number, endOffset: number) => void;
}

export const TrimModal: React.FC<TrimModalProps> = ({
  clip,
  onDismiss,
  onSaveTrim
}) => {
  const [start, setStart] = useState(clip.startOffset);
  const [end, setEnd] = useState(clip.endOffset);
  const [previewTime, setPreviewTime] = useState(clip.startOffset);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video preview with slider scrubbing
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = previewTime;
    }
  }, [previewTime]);

  const maxDuration = clip.sourceDuration;

  const handleStartChange = (val: number) => {
    const safeVal = Math.min(val, end - 0.2);
    setStart(safeVal);
    setPreviewTime(safeVal);
  };

  const handleEndChange = (val: number) => {
    const safeVal = Math.max(val, start + 0.2);
    setEnd(safeVal);
    setPreviewTime(safeVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0E131F] border border-[#232B3E] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Crop className="w-4 h-4 text-[#00E5FF]" />
            <span>Trim Clip: {clip.name}</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1C2438] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Scrub Preview */}
        <div className="w-full h-44 bg-black rounded-xl overflow-hidden border border-[#1A2234] flex items-center justify-center relative">
          <video
            ref={videoRef}
            src={clip.url}
            className="w-full h-full object-contain pointer-events-none"
            muted
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#00E5FF] border border-[#00E5FF]/30">
            Preview: {previewTime.toFixed(2)}s
          </div>
        </div>

        {/* Trim Controls */}
        <div className="space-y-4">
          {/* In-Point (Start) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">In-Point (Start Offset)</span>
              <span className="text-[#00E5FF] font-mono font-semibold">{start.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxDuration}
              step={0.05}
              value={start}
              onChange={(e) => handleStartChange(parseFloat(e.target.value))}
              className="w-full accent-[#00E5FF] bg-[#1A2234] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Out-Point (End) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Out-Point (End Offset)</span>
              <span className="text-[#00E5FF] font-mono font-semibold">{end.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxDuration}
              step={0.05}
              value={end}
              onChange={(e) => handleEndChange(parseFloat(e.target.value))}
              className="w-full accent-[#00E5FF] bg-[#1A2234] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Resulting Duration Display */}
          <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E2638] flex items-center justify-between text-xs">
            <span className="text-slate-400">Trimmed Duration</span>
            <span className="font-mono font-bold text-slate-100">
              {(end - start).toFixed(2)}s / {maxDuration.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2538]">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSaveTrim(start, end)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38EFFF] text-[#080B11] text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Trim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
