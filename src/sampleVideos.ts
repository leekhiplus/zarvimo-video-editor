/**
 * Procedural Neon Video Generator
 * Creates self-contained playable video Blob URLs with audio tone tracks so users can
 * play, trim, split, and export videos immediately without requiring external network calls.
 */

export interface SampleVideoSpec {
  name: string;
  duration: number; // seconds
  theme: 'cyberpunk' | 'synthwave' | 'hologram' | 'matrix';
  themeColor: string;
}

export const SAMPLE_SPECS: SampleVideoSpec[] = [
  {
    name: 'Cyberpunk_City_Run.mp4',
    duration: 6.0,
    theme: 'cyberpunk',
    themeColor: '#00E5FF'
  },
  {
    name: 'Synthwave_Grid_Horizon.mp4',
    duration: 5.5,
    theme: 'synthwave',
    themeColor: '#FF007F'
  },
  {
    name: 'Holographic_Sphere_Orb.mp4',
    duration: 4.8,
    theme: 'hologram',
    themeColor: '#7C3AED'
  }
];

export async function createProceduralVideoUrl(
  spec: SampleVideoSpec,
  onProgress?: (p: number) => void
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    const fps = 30;
    const totalFrames = Math.floor(spec.duration * fps);
    const stream = canvas.captureStream(fps);

    // Add audio track with Web Audio oscillator
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.08;
      osc.frequency.value = spec.theme === 'cyberpunk' ? 220 : spec.theme === 'synthwave' ? 160 : 330;
      osc.type = 'sawtooth';
      const dst = audioCtx.createMediaStreamDestination();
      osc.connect(gain);
      gain.connect(dst);
      osc.start();
      dst.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    } catch {
      // Audio context may require user gesture on some browsers
    }

    let mediaRecorder: MediaRecorder;
    try {
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
    } catch {
      mediaRecorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(URL.createObjectURL(blob));
    };

    mediaRecorder.start();

    let frame = 0;
    function renderFrame() {
      if (!ctx) return;
      const t = frame / fps;

      // Draw Theme Graphics
      ctx.fillStyle = '#080B11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (spec.theme === 'cyberpunk') {
        // Futuristic grid & neon towers
        ctx.fillStyle = '#0E1424';
        ctx.fillRect(0, 200, canvas.width, 160);

        // Perspective grid lines
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.5;
        for (let x = -100; x <= canvas.width + 100; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x + (t * 60) % 40, 200);
          ctx.lineTo((x - canvas.width / 2) * 2.5 + canvas.width / 2, canvas.height);
          ctx.stroke();
        }

        // Glowing neon sun
        const grad = ctx.createRadialGradient(320, 150, 10, 320, 150, 70);
        grad.addColorStop(0, '#00E5FF');
        grad.addColorStop(0.5, 'rgba(124, 58, 237, 0.6)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(320, 150, 70, 0, Math.PI * 2);
        ctx.fill();

        // City skyline silhouettes
        ctx.fillStyle = '#06080F';
        for (let i = 0; i < 12; i++) {
          const h = 40 + (Math.sin(i * 1.5) * 30 + 30);
          ctx.fillRect(i * 55, 200 - h, 50, h);
          // Windows
          ctx.fillStyle = (frame + i) % 15 < 7 ? '#00E5FF' : '#FF007F';
          ctx.fillRect(i * 55 + 10, 200 - h + 15, 6, 6);
          ctx.fillRect(i * 55 + 25, 200 - h + 25, 6, 6);
          ctx.fillStyle = '#06080F';
        }
      } else if (spec.theme === 'synthwave') {
        // Deep magenta gradient sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 220);
        skyGrad.addColorStop(0, '#1E0B2B');
        skyGrad.addColorStop(1, '#6B114D');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, 220);

        // Sunset sliced circle
        ctx.fillStyle = '#FF007F';
        ctx.beginPath();
        ctx.arc(320, 140, 60, 0, Math.PI * 2);
        ctx.fill();
        // Cut scanlines in the sun
        ctx.fillStyle = '#6B114D';
        for (let s = 110; s < 190; s += 8) {
          ctx.fillRect(250, s, 140, 3);
        }

        // Synthwave wireframe floor
        ctx.fillStyle = '#090514';
        ctx.fillRect(0, 220, canvas.width, 140);
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.5)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < canvas.width; i += 30) {
          ctx.beginPath();
          ctx.moveTo(320, 220);
          ctx.lineTo((i - 320) * 3 + 320, canvas.height);
          ctx.stroke();
        }
      } else {
        // Holographic vortex
        const cx = 320;
        const cy = 180;
        for (let r = 10; r < 120; r += 12) {
          ctx.strokeStyle = `hsl(${(t * 80 + r * 2) % 360}, 100%, 65%)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.45, t + r * 0.05, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Title HUD Overlay
      ctx.fillStyle = 'rgba(8, 11, 17, 0.7)';
      ctx.fillRect(15, 15, 230, 40);
      ctx.fillStyle = spec.themeColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(spec.name, 25, 34);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px monospace';
      ctx.fillText(`TC: ${t.toFixed(2)}s / ${spec.duration.toFixed(1)}s`, 25, 48);

      frame++;
      if (onProgress) {
        onProgress(Math.floor((frame / totalFrames) * 100));
      }

      if (frame < totalFrames) {
        setTimeout(renderFrame, 1000 / fps);
      } else {
        mediaRecorder.stop();
      }
    }

    renderFrame();
  });
}
