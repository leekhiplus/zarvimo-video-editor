import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Ratio
} from 'lucide-react';
import { AspectRatioType, TextOverlay, VideoClip } from '../types';

interface VideoPlayerPreviewProps {
  clips: VideoClip[];
  textOverlays: TextOverlay[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  aspectRatio: AspectRatioType;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onStepFrame: (direction: number) => void;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  clips,
  textOverlays,
  currentTime,
  totalDuration,
  isPlaying,
  aspectRatio,
  onTogglePlay,
  onSeek,
  onStepFrame,
  onChangeAspectRatio
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find which clip is active at current timeline time
  const currentClipInfo = React.useMemo(() => {
    if (clips.length === 0) return null;
    let accumulated = 0;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const effectiveDuration = (clip.endOffset - clip.startOffset) / clip.playbackSpeed;
      if (currentTime >= accumulated && currentTime < accumulated + effectiveDuration) {
        const offsetInClip = (currentTime - accumulated) * clip.playbackSpeed + clip.startOffset;
        return { clip, offsetInClip, index: i };
      }
      accumulated += effectiveDuration;
    }
    const lastClip = clips[clips.length - 1];
    return { clip: lastClip, offsetInClip: lastClip.endOffset, index: clips.length - 1 };
  }, [clips, currentTime]);

  // Sync HTML5 video element source and time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClipInfo) return;

    const { clip, offsetInClip } = currentClipInfo;

    // Check if source changed
    if (video.getAttribute('data-clip-id') !== clip.id || video.src !== clip.url) {
      video.setAttribute('data-clip-id', clip.id);
      video.src = clip.url;
      video.load();
    }

    // Set volume and mute
    video.volume = clip.isMuted ? 0 : Math.min(clip.volume, 1);
    video.muted = clip.isMuted;
    video.playbackRate = clip.playbackSpeed;

    // Sync playhead offset if difference is larger than 0.1s
    if (Math.abs(video.currentTime - offsetInClip) > 0.12) {
      video.currentTime = offsetInClip;
    }

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [currentClipInfo, isPlaying]);

  // Handle aspect ratio dimensions
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[360px] md:max-h-[420px]';
      case '1:1':
        return 'aspect-square max-h-[360px] md:max-h-[420px]';
      case '21:9':
        return 'aspect-[21/9] max-w-[800px] w-full';
      case '16:9':
      default:
        return 'aspect-video max-w-[760px] w-full';
    }
  };

  // Format timecode (00:00:00.00)
  const formatTimecode = (seconds: number) => {
    const safeSec = Math.max(0, seconds);
    const m = Math.floor(safeSec / 60);
    const s = Math.floor(safeSec % 60);
    const cs = Math.floor((safeSec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Filter text overlays active at current timestamp
  const activeOverlays = textOverlays.filter(
    (to) => currentTime >= to.startTime && currentTime <= to.startTime + to.duration
  );

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-2 select-none">
      {/* Video Viewport Container */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full flex items-center justify-center min-h-[220px]"
      >
        <div
          className={`relative bg-black rounded-xl overflow-hidden border border-[#1E2538] shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all ${getAspectRatioClass()}`}
        >
          {clips.length > 0 ? (
            <video
              ref={videoRef}
              playsInline
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <div className="text-center p-6 text-slate-500 flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#121624] border border-[#232B3E] flex items-center justify-center mb-3">
                <Ratio className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">Timeline is Empty</p>
              <p className="text-xs text-slate-500 mt-1">Add media clips below to begin editing</p>
            </div>
          )}

          {/* Real-time Text Overlays */}
          {activeOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute z-20 pointer-events-none transition-all px-3 py-1 rounded"
              style={{
                left: `${overlay.posX * 100}%`,
                top: `${overlay.posY * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: overlay.bgColor,
                color: overlay.color,
                fontSize: `${overlay.fontSize}px`,
                fontWeight: 700,
                textShadow: overlay.isNeonGlow
                  ? `0 0 10px ${overlay.color}, 0 0 20px ${overlay.color}`
                  : 'none'
              }}
            >
              {overlay.text}
            </div>
          ))}

          {/* Aspect Ratio Badge */}
          <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded bg-[#080B11]/80 backdrop-blur-md border border-[#232B3E] text-[10px] font-mono text-slate-400">
            {aspectRatio}
          </div>
        </div>
      </div>

      {/* Transport Control Bar */}
      <div className="w-full max-w-[800px] flex items-center justify-between px-3 py-2 bg-[#0E131F] border border-[#1E2538] rounded-xl mt-2 shadow-sm">
        {/* Timecode Readout */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-[#00E5FF] font-semibold">{formatTimecode(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Center Transport Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStepFrame(-1)}
            title="Step Backward 1 Frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-10 h-10 rounded-full bg-[#00E5FF] hover:bg-[#38EFFF] text-[#080B11] flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.4)] transition-all cursor-pointer transform active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onStepFrame(1)}
            title="Step Forward 1 Frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Framing & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-[#131826] border border-[#20293D] rounded-lg p-0.5">
            {(['16:9', '9:16', '1:1', '21:9'] as AspectRatioType[]).map((r) => (
              <button
                key={r}
                onClick={() => onChangeAspectRatio(r)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                  aspectRatio === r
                    ? 'bg-[#1E2638] text-[#00E5FF] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#181F30] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
