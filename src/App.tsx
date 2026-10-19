/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AspectRatioType, Project, TextOverlay, VideoClip } from './types';
import { SAMPLE_SPECS, createProceduralVideoUrl } from './sampleVideos';
import { Navbar } from './components/Navbar';
import { VideoPlayerPreview } from './components/VideoPlayerPreview';
import { TimelineView } from './components/TimelineView';
import { ClipToolbar } from './components/ClipToolbar';
import { TrimModal } from './components/TrimModal';
import { VolumeModal } from './components/VolumeModal';
import { TextOverlayModal } from './components/TextOverlayModal';
import { ExportModal } from './components/ExportModal';
import { AndroidRepoHub } from './components/AndroidRepoHub';
import { SplashScreenModal } from './components/SplashScreenModal';

const INITIAL_PROJECT: Project = {
  id: 'proj_' + Date.now(),
  title: 'Neon Cyberpunk Dreams',
  aspectRatio: '16:9',
  videoClips: [],
  audioTracks: [
    {
      id: 'audio_master',
      name: 'Master Audio Track',
      duration: 16.3,
      startTime: 0,
      volume: 1.0,
      isMuted: false
    }
  ],
  textOverlays: [
    {
      id: 'text_intro',
      text: 'ZARVIMO PRO',
      startTime: 0.5,
      duration: 3.5,
      posX: 0.5,
      posY: 0.82,
      fontSize: 28,
      color: '#00E5FF',
      bgColor: 'rgba(8, 11, 17, 0.75)',
      isNeonGlow: true
    }
  ],
  updatedAt: Date.now(),
  createdAt: Date.now()
};

export default function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState<'editor' | 'android-repo'>('editor');
  const [showSplash, setShowSplash] = useState(true);

  // Playback & Scrubber State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [zoomFactor, setZoomFactor] = useState(48); // px per second

  // History Stacks (Undo / Redo)
  const undoStackRef = useRef<Project[]>([]);
  const redoStackRef = useRef<Project[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Modals
  const [trimClipTarget, setTrimClipTarget] = useState<VideoClip | null>(null);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Initial Sample Media Loader
  useEffect(() => {
    let isCancelled = false;

    async function loadInitialClips() {
      if (project.videoClips.length > 0) return;

      const clips: VideoClip[] = [];
      for (let i = 0; i < SAMPLE_SPECS.length; i++) {
        if (isCancelled) break;
        const spec = SAMPLE_SPECS[i];
        const url = await createProceduralVideoUrl(spec);
        clips.push({
          id: `clip_${i + 1}`,
          name: spec.name,
          url,
          sourceDuration: spec.duration,
          startOffset: 0,
          endOffset: spec.duration,
          volume: 1.0,
          isMuted: false,
          playbackSpeed: 1.0,
          orderIndex: i,
          themeColor: spec.themeColor
        });
      }

      if (!isCancelled && clips.length > 0) {
        setProject((prev) => ({
          ...prev,
          videoClips: clips
        }));
        setSelectedClipId(clips[0].id);
      }
    }

    loadInitialClips();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Total calculated composition duration
  const totalDuration = React.useMemo(() => {
    return project.videoClips.reduce(
      (sum, clip) => sum + (clip.endOffset - clip.startOffset) / clip.playbackSpeed,
      0
    );
  }, [project.videoClips]);

  // Snapshot mutation with undo/redo preservation
  const mutateProject = useCallback(
    (updater: (curr: Project) => Project) => {
      setProject((current) => {
        undoStackRef.current.push(JSON.parse(JSON.stringify(current)));
        if (undoStackRef.current.length > 30) undoStackRef.current.shift();
        redoStackRef.current = [];
        setCanUndo(true);
        setCanRedo(false);

        const updated = updater(current);
        return { ...updated, updatedAt: Date.now() };
      });
    },
    []
  );

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    setProject(previous);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [project]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    setProject(next);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [project]);

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return Math.min(prev + 0.05, totalDuration);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Keyboard Shortcuts (Space for play/pause, Ctrl+Z for undo, Ctrl+Y for redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / 30));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(totalDuration, t + 1 / 30));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDuration, handleUndo, handleRedo]);

  // Selected clip object
  const selectedClip = project.videoClips.find((c) => c.id === selectedClipId) || null;
  const selectedIndex = project.videoClips.findIndex((c) => c.id === selectedClipId);

  // Operations:
  const handleAddMediaUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      const dur = video.duration || 5.0;
      mutateProject((curr) => {
        const newClip: VideoClip = {
          id: 'clip_' + Date.now(),
          name: file.name,
          url,
          sourceDuration: dur,
          startOffset: 0,
          endOffset: dur,
          volume: 1.0,
          isMuted: false,
          playbackSpeed: 1.0,
          orderIndex: curr.videoClips.length
        };
        return {
          ...curr,
          videoClips: [...curr.videoClips, newClip]
        };
      });
    };
  };

  const handleAddSampleClip = async (specName: string) => {
    const spec = SAMPLE_SPECS.find((s) => s.name === specName) || SAMPLE_SPECS[0];
    const url = await createProceduralVideoUrl(spec);
    mutateProject((curr) => {
      const newClip: VideoClip = {
        id: 'clip_' + Date.now(),
        name: spec.name,
        url,
        sourceDuration: spec.duration,
        startOffset: 0,
        endOffset: spec.duration,
        volume: 1.0,
        isMuted: false,
        playbackSpeed: 1.0,
        orderIndex: curr.videoClips.length,
        themeColor: spec.themeColor
      };
      return {
        ...curr,
        videoClips: [...curr.videoClips, newClip]
      };
    });
  };

  // Split selected clip at current playhead
  const handleSplit = () => {
    if (!selectedClip) return;

    // Find relative playhead offset in selected clip
    let accumulated = 0;
    for (const c of project.videoClips) {
      const effDur = (c.endOffset - c.startOffset) / c.playbackSpeed;
      if (c.id === selectedClip.id) {
        const offsetInClip = (currentTime - accumulated) * c.playbackSpeed + c.startOffset;

        if (offsetInClip <= c.startOffset + 0.2 || offsetInClip >= c.endOffset - 0.2) {
          return; // Too close to boundaries
        }

        mutateProject((curr) => {
          const idx = curr.videoClips.findIndex((x) => x.id === c.id);
          if (idx === -1) return curr;

          const part1: VideoClip = {
            ...c,
            id: 'clip_' + Date.now() + '_a',
            endOffset: offsetInClip
          };
          const part2: VideoClip = {
            ...c,
            id: 'clip_' + Date.now() + '_b',
            startOffset: offsetInClip
          };

          const newClips = [...curr.videoClips];
          newClips.splice(idx, 1, part1, part2);
          return {
            ...curr,
            videoClips: newClips.map((item, i) => ({ ...item, orderIndex: i }))
          };
        });
        return;
      }
      accumulated += effDur;
    }
  };

  // Trim selected clip
  const handleSaveTrim = (startOffset: number, endOffset: number) => {
    if (!trimClipTarget) return;
    mutateProject((curr) => {
      const updated = curr.videoClips.map((c) =>
        c.id === trimClipTarget.id ? { ...c, startOffset, endOffset } : c
      );
      return { ...curr, videoClips: updated };
    });
    setTrimClipTarget(null);
  };

  // Volume & Mute
  const handleSaveVolume = (volume: number, isMuted: boolean) => {
    if (!selectedClip) return;
    mutateProject((curr) => {
      const updated = curr.videoClips.map((c) =>
        c.id === selectedClip.id ? { ...c, volume, isMuted } : c
      );
      return { ...curr, videoClips: updated };
    });
    setShowVolumeModal(false);
  };

  // Duplicate clip
  const handleDuplicate = () => {
    if (!selectedClip || selectedIndex === -1) return;
    mutateProject((curr) => {
      const clone: VideoClip = {
        ...selectedClip,
        id: 'clip_' + Date.now(),
        name: `${selectedClip.name} (Copy)`
      };
      const list = [...curr.videoClips];
      list.splice(selectedIndex + 1, 0, clone);
      return {
        ...curr,
        videoClips: list.map((c, i) => ({ ...c, orderIndex: i }))
      };
    });
  };

  // Delete clip
  const handleDelete = () => {
    if (!selectedClip) return;
    mutateProject((curr) => {
      const list = curr.videoClips.filter((c) => c.id !== selectedClip.id);
      return {
        ...curr,
        videoClips: list.map((c, i) => ({ ...c, orderIndex: i }))
      };
    });
    setSelectedClipId(null);
  };

  // Reorder clips
  const handleMoveClip = (direction: -1 | 1) => {
    if (selectedIndex === -1) return;
    const targetIdx = selectedIndex + direction;
    if (targetIdx < 0 || targetIdx >= project.videoClips.length) return;

    mutateProject((curr) => {
      const list = [...curr.videoClips];
      const [item] = list.splice(selectedIndex, 1);
      list.splice(targetIdx, 0, item);
      return {
        ...curr,
        videoClips: list.map((c, i) => ({ ...c, orderIndex: i }))
      };
    });
  };

  // Text overlay
  const handleAddTextOverlay = (overlay: TextOverlay) => {
    mutateProject((curr) => ({
      ...curr,
      textOverlays: [...curr.textOverlays, overlay]
    }));
    setShowTextModal(false);
  };

  // Download ZIP handler
  const handleDownloadZip = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    const link = document.createElement('a');
    link.href = '/zarvimo-video-editor.zip';
    link.download = 'zarvimo-video-editor.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080B11] text-[#E2E8F0]">
      {/* Top Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectTitle={project.title}
        onUpdateTitle={(title) => mutateProject((c) => ({ ...c, title }))}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNewProject={() => {
          setProject({
            ...INITIAL_PROJECT,
            id: 'proj_' + Date.now(),
            title: 'New Neon Video Studio',
            videoClips: []
          });
          setCurrentTime(0);
        }}
        onOpenExport={() => setShowExportModal(true)}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Workspace Body */}
      {activeTab === 'editor' ? (
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Top Half: Video Preview Viewport */}
          <div className="flex-1 min-h-[220px] overflow-hidden">
            <VideoPlayerPreview
              clips={project.videoClips}
              textOverlays={project.textOverlays}
              currentTime={currentTime}
              totalDuration={totalDuration}
              isPlaying={isPlaying}
              aspectRatio={project.aspectRatio}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={(time) => setCurrentTime(time)}
              onStepFrame={(dir) =>
                setCurrentTime((t) => Math.max(0, Math.min(totalDuration, t + dir * (1 / 30))))
              }
              onChangeAspectRatio={(aspectRatio) =>
                mutateProject((c) => ({ ...c, aspectRatio }))
              }
            />
          </div>

          {/* Bottom Half: Multi-Track Timeline & Clip Toolbar */}
          <div className="shrink-0 flex flex-col">
            <TimelineView
              clips={project.videoClips}
              audioTracks={project.audioTracks}
              textOverlays={project.textOverlays}
              selectedClipId={selectedClipId}
              currentTime={currentTime}
              totalDuration={totalDuration}
              zoomFactor={zoomFactor}
              onSelectClip={(id) => setSelectedClipId(id)}
              onSeek={(time) => setCurrentTime(time)}
              onZoomIn={() => setZoomFactor((z) => Math.min(z * 1.3, 160))}
              onZoomOut={() => setZoomFactor((z) => Math.max(z / 1.3, 15))}
              onResetZoom={() => setZoomFactor(48)}
              onOpenTrimForClip={(clip) => setTrimClipTarget(clip)}
            />

            <ClipToolbar
              selectedClip={selectedClip}
              canMoveLeft={selectedIndex > 0}
              canMoveRight={selectedIndex >= 0 && selectedIndex < project.videoClips.length - 1}
              onAddMediaUpload={handleAddMediaUpload}
              onAddSampleClip={handleAddSampleClip}
              onSplit={handleSplit}
              onTrim={() => selectedClip && setTrimClipTarget(selectedClip)}
              onVolume={() => setShowVolumeModal(true)}
              onAddText={() => setShowTextModal(true)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onMoveLeft={() => handleMoveClip(-1)}
              onMoveRight={() => handleMoveClip(1)}
            />
          </div>
        </main>
      ) : (
        <AndroidRepoHub onDownloadZip={handleDownloadZip} />
      )}

      {/* Modal Dialogs */}
      {showSplash && <SplashScreenModal onDismiss={() => setShowSplash(false)} />}

      {trimClipTarget && (
        <TrimModal
          clip={trimClipTarget}
          onDismiss={() => setTrimClipTarget(null)}
          onSaveTrim={handleSaveTrim}
        />
      )}

      {showVolumeModal && selectedClip && (
        <VolumeModal
          clip={selectedClip}
          onDismiss={() => setShowVolumeModal(false)}
          onSaveVolume={handleSaveVolume}
        />
      )}

      {showTextModal && (
        <TextOverlayModal
          currentPlayheadTime={currentTime}
          onDismiss={() => setShowTextModal(false)}
          onAddOverlay={handleAddTextOverlay}
        />
      )}

      {showExportModal && (
        <ExportModal project={project} onDismiss={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
