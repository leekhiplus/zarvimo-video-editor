import React, { useState, useRef } from 'react';
import { X, Sparkles, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AspectRatioType, ExportSettings, Project } from '../types';

interface ExportModalProps {
  project: Project;
  onDismiss: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  onDismiss
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [format, setFormat] = useState<'webm' | 'mp4'>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortExportRef = useRef(false);

  const handleStartExport = async () => {
    if (project.videoClips.length === 0) {
      setErrorMsg('No clips to export.');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setErrorMsg(null);
    setExportedUrl(null);
    abortExportRef.current = false;

    try {
      // Setup canvas dimensions based on resolution and aspect ratio
      const width = resolution === '4k' ? 3840 : resolution === '1080p' ? 1920 : 1280;
      let height = Math.round(width * (9 / 16));
      if (project.aspectRatio === '9:16') {
        height = Math.round(width * (16 / 9));
      } else if (project.aspectRatio === '1:1') {
        height = width;
      } else if (project.aspectRatio === '21:9') {
        height = Math.round(width * (9 / 21));
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.min(width, 1920); // keep memory efficient for browser canvas
      canvas.height = Math.min(height, 1080);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      const stream = canvas.captureStream(fps);

      let mimeType = 'video/webm;codecs=vp9';
      if (format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
      } else if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recorderStopped = new Promise<string>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          resolve(url);
        };
      });

      recorder.start();

      // Sequentially load and draw each clip's trimmed slice
      const totalCompositionSec = project.videoClips.reduce(
        (sum, c) => sum + (c.endOffset - c.startOffset) / c.playbackSpeed,
        0
      );

      let globalTimeAccumulator = 0;
      const offscreenVideo = document.createElement('video');
      offscreenVideo.crossOrigin = 'anonymous';
      offscreenVideo.muted = true;
      offscreenVideo.playsInline = true;

      for (let cIdx = 0; cIdx < project.videoClips.length; cIdx++) {
        if (abortExportRef.current) break;
        const clip = project.videoClips[cIdx];
        const clipDuration = (clip.endOffset - clip.startOffset) / clip.playbackSpeed;

        await new Promise<void>((resolveLoad) => {
          offscreenVideo.src = clip.url;
          offscreenVideo.onloadeddata = () => resolveLoad();
          offscreenVideo.onerror = () => resolveLoad();
        });

        const frameIntervalMs = 1000 / fps;
        let clipCurrentTime = clip.startOffset;

        while (clipCurrentTime <= clip.endOffset && !abortExportRef.current) {
          offscreenVideo.currentTime = clipCurrentTime;
          await new Promise<void>((r) => {
            offscreenVideo.onseeked = () => r();
            setTimeout(r, 40); // safety fallback
          });

          // Draw video frame to canvas
          ctx.fillStyle = '#080B11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          try {
            ctx.drawImage(offscreenVideo, 0, 0, canvas.width, canvas.height);
          } catch {
            // fallback frame fill
            ctx.fillStyle = '#101522';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Burn in Text Overlays for current global time
          const currentGlobalSec = globalTimeAccumulator + (clipCurrentTime - clip.startOffset);
          project.textOverlays.forEach((to) => {
            if (currentGlobalSec >= to.startTime && currentGlobalSec <= to.startTime + to.duration) {
              ctx.save();
              ctx.fillStyle = to.bgColor;
              ctx.font = `bold ${Math.round((to.fontSize / 360) * canvas.height)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const x = to.posX * canvas.width;
              const y = to.posY * canvas.height;
              const metrics = ctx.measureText(to.text);
              const padding = 16;
              const textHeight = Math.round((to.fontSize / 360) * canvas.height);

              ctx.fillRect(
                x - metrics.width / 2 - padding,
                y - textHeight / 2 - padding / 2,
                metrics.width + padding * 2,
                textHeight + padding
              );

              if (to.isNeonGlow) {
                ctx.shadowColor = to.color;
                ctx.shadowBlur = 18;
              }
              ctx.fillStyle = to.color;
              ctx.fillText(to.text, x, y);
              ctx.restore();
            }
          });

          // Watermark / Brand Badge
          ctx.save();
          ctx.fillStyle = 'rgba(8, 11, 17, 0.6)';
          ctx.fillRect(canvas.width - 150, canvas.height - 35, 140, 26);
          ctx.fillStyle = '#00E5FF';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('ZARVIMO STUDIO', canvas.width - 80, canvas.height - 18);
          ctx.restore();

          clipCurrentTime += (1 / fps) * clip.playbackSpeed;
          const currentPercent = Math.min(
            Math.round((currentGlobalSec / totalCompositionSec) * 100),
            99
          );
          setProgress(currentPercent);
          await new Promise((r) => setTimeout(r, frameIntervalMs * 0.4));
        }

        globalTimeAccumulator += clipDuration;
      }

      if (!abortExportRef.current) {
        recorder.stop();
        const finalUrl = await recorderStopped;
        setProgress(100);
        setExportedUrl(finalUrl);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Export error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    abortExportRef.current = true;
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E131F] border border-[#232B3E] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span>Export Video Studio</span>
          </div>
          <button
            onClick={onDismiss}
            disabled={isExporting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1C2438] transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isExporting && !exportedUrl && (
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(['720p', '1080p', '4k'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      resolution === r
                        ? 'bg-[#1C2438] text-[#00E5FF] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                        : 'bg-[#121624] text-slate-400 border-[#232B3E] hover:border-slate-600'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Frame Rate</label>
              <div className="grid grid-cols-3 gap-2">
                {([24, 30, 60] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      fps === f
                        ? 'bg-[#1C2438] text-[#00E5FF] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                        : 'bg-[#121624] text-slate-400 border-[#232B3E] hover:border-slate-600'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Container Format</label>
              <div className="grid grid-cols-2 gap-2">
                {(['mp4', 'webm'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      format === fmt
                        ? 'bg-[#1C2438] text-[#00E5FF] border-[#00E5FF]'
                        : 'bg-[#121624] text-slate-400 border-[#232B3E]'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Summary */}
            <div className="p-3 rounded-xl bg-[#131826] border border-[#1E2638] text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Total Clips:</span>
                <span className="text-slate-200 font-mono">{project.videoClips.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Text Overlays:</span>
                <span className="text-slate-200 font-mono">{project.textOverlays.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="text-[#00E5FF] font-mono">{project.aspectRatio}</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Progress State */}
        {isExporting && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center animate-pulse">
              <Loader2 className="w-7 h-7 text-[#00E5FF] animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Rendering Video Composition</p>
              <p className="text-xs text-slate-400 mt-1">
                Compositing clips, burning text overlays, and encoding stream...
              </p>
            </div>

            <div className="w-full bg-[#182030] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00E5FF] h-full transition-all duration-200 rounded-full shadow-[0_0_10px_#00E5FF]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between w-full text-xs font-mono text-slate-400">
              <span className="text-[#00E5FF] font-bold">{progress}%</span>
              <span>Processing...</span>
            </div>

            <button
              onClick={handleCancel}
              className="mt-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel Rendering
            </button>
          </div>
        )}

        {/* Export Completed State */}
        {exportedUrl && (
          <div className="py-5 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-100">Render Completed!</p>
            <p className="text-xs text-slate-400">
              Your video was successfully exported and composited.
            </p>

            <a
              href={exportedUrl}
              download={`${project.title.replace(/\s+/g, '_')}_rendered.${format}`}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#38EFFF] text-[#080B11] text-xs font-bold transition-all shadow-[0_0_14px_rgba(0,229,255,0.35)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Rendered Video ({format.toUpperCase()})</span>
            </a>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer */}
        {!isExporting && !exportedUrl && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2538]">
            <button
              onClick={onDismiss}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38EFFF] text-[#080B11] text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Rendering</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
