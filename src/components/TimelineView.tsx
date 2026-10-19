import React, { useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
  Type,
  Video
} from 'lucide-react';
import { AudioTrack, TextOverlay, VideoClip } from '../types';

interface TimelineViewProps {
  clips: VideoClip[];
  audioTracks: AudioTrack[];
  textOverlays: TextOverlay[];
  selectedClipId: string | null;
  currentTime: number;
  totalDuration: number;
  zoomFactor: number; // pixels per second
  onSelectClip: (id: string) => void;
  onSeek: (time: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenTrimForClip: (clip: VideoClip) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  clips,
  audioTracks,
  textOverlays,
  selectedClipId,
  currentTime,
  totalDuration,
  zoomFactor,
  onSelectClip,
  onSeek,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenTrimForClip
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayhead = useRef(false);

  const safeTotal = Math.max(totalDuration, 1.0);
  const timelinePixelWidth = Math.max(safeTotal * zoomFactor + 200, 800);

  // Convert click/drag offset into timeline seconds
  const handleTimelinePointerAction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 88; // 88px offset for track headers
    const targetSeconds = Math.max(0, Math.min(clickX / zoomFactor, safeTotal));
    onSeek(targetSeconds);
  };

  const onPointerDownScrubber = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingPlayhead.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleTimelinePointerAction(e);
  };

  const onPointerMoveScrubber = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead.current) {
      handleTimelinePointerAction(e);
    }
  };

  const onPointerUpScrubber = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead.current) {
      isDraggingPlayhead.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Generate ruler tick marks
  const rulerTicks = [];
  const tickStep = zoomFactor > 80 ? 1 : zoomFactor > 30 ? 2 : 5;
  for (let s = 0; s <= safeTotal + 5; s += tickStep) {
    rulerTicks.push(s);
  }

  // Playhead position in pixels
  const playheadX = currentTime * zoomFactor + 88;

  return (
    <div className="flex flex-col h-[230px] w-full bg-[#090C14] border-t border-[#1C2335] select-none">
      {/* Timeline Controls Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#1A2133] bg-[#0C101A]">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Timeline Tracks</span>
          <span className="text-[10px] text-slate-500 font-mono">
            Scale: {Math.round(zoomFactor)}px/s · {clips.length} Clips
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            title="Fit Timeline"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors text-[10px] font-mono px-1.5"
          >
            Fit
          </button>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks Container with Scroll */}
      <div
        ref={containerRef}
        onPointerDown={handleTimelinePointerAction}
        onPointerMove={onPointerMoveScrubber}
        onPointerUp={onPointerUpScrubber}
        className="relative flex-1 overflow-x-auto overflow-y-hidden cursor-crosshair"
      >
        <div
          className="relative h-full flex flex-col"
          style={{ width: `${timelinePixelWidth}px` }}
        >
          {/* Time Ruler */}
          <div className="h-7 bg-[#0E131F] border-b border-[#1A2234] flex items-center relative">
            <div className="w-[88px] h-full border-r border-[#1A2234] bg-[#0B0E17] flex items-center justify-center text-[10px] font-mono text-slate-500 shrink-0">
              TIME (s)
            </div>

            <div className="relative flex-1 h-full">
              {rulerTicks.map((sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-between"
                  style={{ left: `${sec * zoomFactor}px` }}
                >
                  <div className="text-[9px] font-mono text-slate-400 pl-1 pt-0.5">
                    {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
                  </div>
                  <div className="w-[1px] h-2 bg-[#263147]" />
                </div>
              ))}
            </div>
          </div>

          {/* Track 1: Text Overlays Track */}
          <div className="h-10 border-b border-[#161C2C] flex items-center bg-[#090C14]">
            <div className="w-[88px] h-full border-r border-[#161C2C] bg-[#0A0E18] flex items-center gap-1.5 px-2.5 text-[11px] font-medium text-[#FF007F] shrink-0">
              <Type className="w-3 h-3 text-[#FF007F]" />
              <span>Text</span>
            </div>

            <div className="relative flex-1 h-full py-1">
              {textOverlays.map((to) => {
                const left = to.startTime * zoomFactor;
                const width = Math.max(to.duration * zoomFactor, 36);
                return (
                  <div
                    key={to.id}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    className="absolute top-1 bottom-1 rounded bg-[#FF007F]/20 border border-[#FF007F]/60 px-2 flex items-center justify-between text-[11px] font-semibold text-[#FF007F] truncate shadow-[0_0_8px_rgba(255,0,127,0.15)]"
                  >
                    <span className="truncate">{to.text}</span>
                    <span className="text-[9px] font-mono opacity-70 shrink-0">
                      {to.duration}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Video Track */}
          <div className="h-16 border-b border-[#161C2C] flex items-center bg-[#0A0D17]">
            <div className="w-[88px] h-full border-r border-[#161C2C] bg-[#0B0E19] flex items-center gap-1.5 px-2.5 text-[11px] font-medium text-[#00E5FF] shrink-0">
              <Video className="w-3 h-3 text-[#00E5FF]" />
              <span>Video</span>
            </div>

            <div className="relative flex-1 h-full py-1 flex items-center">
              {clips.map((clip) => {
                const effectiveDur = (clip.endOffset - clip.startOffset) / clip.playbackSpeed;
                const width = Math.max(effectiveDur * zoomFactor, 42);
                const isSelected = clip.id === selectedClipId;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenTrimForClip(clip);
                    }}
                    style={{ width: `${width}px` }}
                    className={`relative h-full rounded-md mx-[1px] p-2 flex flex-col justify-between transition-all cursor-pointer select-none group ${
                      isSelected
                        ? 'bg-[#00E5FF]/20 border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                        : 'bg-[#151C2C] border border-[#232D44] hover:border-[#00E5FF]/50'
                    }`}
                  >
                    {/* Clip Title & Info */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-100 truncate">
                        {clip.name}
                      </span>
                      {clip.isMuted && (
                        <span className="text-[9px] text-red-400 font-mono">MUTED</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{effectiveDur.toFixed(1)}s</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[#00E5FF] text-[9px]">
                        Double-click: Trim
                      </span>
                    </div>

                    {/* Left Trim Handle Visual */}
                    {isSelected && (
                      <>
                        <div
                          title="In-Point Trim Handle"
                          className="absolute left-0 top-0 bottom-0 w-2 bg-[#00E5FF] rounded-l-md flex items-center justify-center cursor-ew-resize opacity-90"
                        >
                          <div className="w-[1px] h-3 bg-black" />
                        </div>
                        <div
                          title="Out-Point Trim Handle"
                          className="absolute right-0 top-0 bottom-0 w-2 bg-[#00E5FF] rounded-r-md flex items-center justify-center cursor-ew-resize opacity-90"
                        >
                          <div className="w-[1px] h-3 bg-black" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 3: Audio Track */}
          <div className="h-10 flex items-center bg-[#090C14]">
            <div className="w-[88px] h-full border-r border-[#161C2C] bg-[#0A0E18] flex items-center gap-1.5 px-2.5 text-[11px] font-medium text-[#7C3AED] shrink-0">
              <Volume2 className="w-3 h-3 text-[#7C3AED]" />
              <span>Audio</span>
            </div>

            <div className="relative flex-1 h-full py-1">
              <div
                style={{ width: `${safeTotal * zoomFactor}px` }}
                className="h-full rounded bg-[#7C3AED]/20 border border-[#7C3AED]/50 px-3 flex items-center justify-between text-[11px] text-[#A78BFA] font-medium"
              >
                <span>♫ Master Audio (Composition Mix)</span>
                <span className="font-mono text-[9px] opacity-75">{safeTotal.toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Global Playhead Scrubber Line & Needle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#00E5FF] z-30 pointer-events-none shadow-[0_0_10px_#00E5FF]"
            style={{ left: `${playheadX}px` }}
          >
            {/* Playhead Head Marker */}
            <div
              onPointerDown={onPointerDownScrubber}
              className="absolute -top-1 -left-[7px] w-4 h-4 bg-[#00E5FF] rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,229,255,0.8)] cursor-ew-resize pointer-events-auto flex items-center justify-center"
            >
              <div className="w-1 h-1 bg-[#080B11] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
