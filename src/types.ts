export type AspectRatioType = '16:9' | '9:16' | '1:1' | '21:9';

export interface VideoClip {
  id: string;
  name: string;
  url: string; // Blob URL, object URL, or generated canvas video
  sourceDuration: number; // in seconds
  startOffset: number; // in-point in seconds
  endOffset: number; // out-point in seconds
  volume: number; // 0 to 2 (1 = 100%)
  isMuted: boolean;
  playbackSpeed: number;
  orderIndex: number;
  themeColor?: string;
  thumbnailUrl?: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  duration: number; // in seconds
  startTime: number; // in seconds
  volume: number;
  isMuted: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  posX: number; // 0 to 1
  posY: number; // 0 to 1
  fontSize: number; // px
  color: string; // hex
  bgColor: string; // hex
  isNeonGlow: boolean;
}

export interface Project {
  id: string;
  title: string;
  aspectRatio: AspectRatioType;
  videoClips: VideoClip[];
  audioTracks: AudioTrack[];
  textOverlays: TextOverlay[];
  updatedAt: number;
  createdAt: number;
}

export interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  format: 'webm' | 'mp4';
  includeAudio: boolean;
}
