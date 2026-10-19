import React, { useRef } from 'react';
import {
  Plus,
  Scissors,
  Crop,
  Volume2,
  Type,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Film
} from 'lucide-react';
import { VideoClip } from '../types';

interface ClipToolbarProps {
  selectedClip: VideoClip | null;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onAddMediaUpload: (file: File) => void;
  onAddSampleClip: (specName: string) => void;
  onSplit: () => void;
  onTrim: () => void;
  onVolume: () => void;
  onAddText: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export const ClipToolbar: React.FC<ClipToolbarProps> = ({
  selectedClip,
  canMoveLeft,
  canMoveRight,
  onAddMediaUpload,
  onAddSampleClip,
  onSplit,
  onTrim,
  onVolume,
  onAddText,
  onDuplicate,
  onDelete,
  onMoveLeft,
  onMoveRight
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddMediaUpload(e.target.files[0]);
    }
  };

  const hasSelection = !!selectedClip;

  return (
    <div className="h-12 bg-[#0C101A] border-t border-[#1C2335] px-4 flex items-center justify-between select-none">
      {/* Primary Actions Group */}
      <div className="flex items-center gap-1.5">
        {/* Add Media Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Media</span>
          </button>

          {showAddMenu && (
            <div
              className="absolute bottom-10 left-0 w-52 bg-[#121624] border border-[#232B3E] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-md"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#1C2438] rounded-lg transition-colors text-left"
              >
                <Upload className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <p>Upload Device Video</p>
                  <p className="text-[10px] text-slate-500">MP4, WebM, MOV</p>
                </div>
              </button>

              <div className="h-[1px] bg-[#1E2538] my-0.5" />

              <p className="text-[10px] font-semibold text-slate-500 px-3 pt-1 uppercase tracking-wider">
                Neon Sample Clips
              </p>

              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onAddSampleClip('Cyberpunk_City_Run.mp4');
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1C2438] rounded-lg text-left transition-colors"
              >
                <Film className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Cyberpunk City Run (6s)</span>
              </button>

              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onAddSampleClip('Synthwave_Grid_Horizon.mp4');
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1C2438] rounded-lg text-left transition-colors"
              >
                <Film className="w-3.5 h-3.5 text-[#FF007F]" />
                <span>Synthwave Grid (5.5s)</span>
              </button>

              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onAddSampleClip('Holographic_Sphere_Orb.mp4');
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1C2438] rounded-lg text-left transition-colors"
              >
                <Film className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Hologram Orb (4.8s)</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="w-[1px] h-5 bg-[#1E2538] mx-1" />

        {/* Split at Playhead */}
        <button
          onClick={onSplit}
          disabled={!hasSelection}
          title="Split Selected Clip at Current Playhead"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#182030] hover:text-[#00E5FF] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
        >
          <Scissors className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Split</span>
        </button>

        {/* Trim In/Out */}
        <button
          onClick={onTrim}
          disabled={!hasSelection}
          title="Trim In-point and Out-point"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#182030] hover:text-[#00E5FF] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
        >
          <Crop className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Trim</span>
        </button>

        {/* Audio Volume */}
        <button
          onClick={onVolume}
          disabled={!hasSelection}
          title="Adjust Clip Volume and Mute"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#182030] hover:text-[#7C3AED] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Volume</span>
        </button>

        {/* Text Overlay */}
        <button
          onClick={onAddText}
          title="Add Neon Text Overlay"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#182030] hover:text-[#FF007F] transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-[#FF007F]" />
          <span>Text</span>
        </button>
      </div>

      {/* Clip Reorder & Manage Group */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMoveLeft}
          disabled={!hasSelection || !canMoveLeft}
          title="Move Clip Left"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#182030] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onMoveRight}
          disabled={!hasSelection || !canMoveRight}
          title="Move Clip Right"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#182030] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#1E2538] mx-1" />

        <button
          onClick={onDuplicate}
          disabled={!hasSelection}
          title="Duplicate Clip"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#182030] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={onDelete}
          disabled={!hasSelection}
          title="Delete Clip"
          className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
