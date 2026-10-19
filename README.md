# Zarvimo Video Editor (Phase 1)

[![Android CI Build](https://github.com/OWNER/REPOSITORY/actions/workflows/android-build.yml/badge.svg)](https://github.com/OWNER/REPOSITORY/actions/workflows/android-build.yml)
![Android](https://img.shields.io/badge/Platform-Android_8.0+_(API_26+)-00E5FF?style=flat&logo=android)
![Compose](https://img.shields.io/badge/UI-Jetpack_Compose-7C3AED?style=flat&logo=jetpackcompose)
![Media3](https://img.shields.io/badge/Video_Engine-AndroidX_Media3-FF007F?style=flat)
![Language](https://img.shields.io/badge/Language-Kotlin_1.9.23-blue?style=flat&logo=kotlin)

Zarvimo Video Editor is a next-generation mobile video editing suite built with **Kotlin**, **Jetpack Compose**, **Gradle Kotlin DSL**, and **AndroidX Media3 (ExoPlayer & Transformer)**. Engineered with a signature dark navy/black aesthetic accentuated by glowing electric-cyan, ultra-violet, and vivid magenta neon highlights.

---

## ⚡ Architecture & Tech Stack

```
com.zafronix.videoeditor/
├── MainActivity.kt                      # Root Activity with Compose Navigation
├── ZafronixApp.kt                       # Application class
├── data/
│   ├── model/
│   │   ├── Project.kt                   # Root project data model (clips, tracks, overlays)
│   │   ├── VideoClip.kt                 # In/Out offsets, volume, playback speed, order
│   │   ├── AudioTrack.kt                # Background & master audio track model
│   │   ├── TextOverlay.kt               # Timed subtitle & text overlay model with neon styling
│   │   └── ExportConfig.kt              # Resolution (720p/1080p/4K), framerate & bitrate
│   └── repository/
│       └── ProjectRepository.kt         # Local disk JSON persistence in app files directory
├── domain/
│   ├── timeline/
│   │   └── TimelineManager.kt           # Pure math for duration, trim boundaries, split & reorder
│   └── history/
│       └── UndoRedoManager.kt           # State snapshot stack for non-destructive editing
├── playback/
│   └── ZafronixPlayerManager.kt         # AndroidX Media3 ExoPlayer wrapper with clipping & sync
├── export/
│   └── Media3TransformerExporter.kt     # AndroidX Media3 Transformer composition rendering pipeline
└── ui/
    ├── theme/                           # Color, Theme, Typography (Neon accents & dark navy)
    └── screens/
        ├── splash/SplashScreen.kt       # Animated neon pulsing logo
        ├── dashboard/DashboardScreen.kt # Recent projects, creation dialog, sample loader
        └── editor/
            ├── EditorScreen.kt          # Dual-pane preview + timeline workspace
            ├── EditorViewModel.kt       # ViewModel coordinating MVI state flow
            └── components/
                ├── VideoPreviewComponent.kt     # PlayerView + real-time text overlays
                ├── TimelineComponent.kt         # Multi-track ruler, scrubber needle, clip blocks
                ├── ClipControlsBar.kt           # Add, Split, Trim, Volume, Text, Duplicate, Delete
                ├── VolumeAdjustmentDialog.kt    # 0% - 200% volume slider & mute
                ├── TextOverlayEditorDialog.kt   # Neon color palette & text timing
                └── ExportDialog.kt              # Resolution & FPS configuration, progress bar
```

---

## 🚀 Key Phase 1 Features

1. **Splash Screen**: Animated neon pulse logo with seamless transition.
2. **Project Dashboard**:
   - Create new projects with Aspect Ratio presets (`16:9 Landscape`, `9:16 Shorts/Reels`, `1:1 Square`, `21:9 Cinema`).
   - Project persistence via JSON file storage.
   - Delete & reopen previous sessions.
3. **Hardware-Accelerated Video Preview**:
   - Synced ExoPlayer playback with Media3 clipping configurations.
   - Step forward / backward by individual frames (30fps / 60fps).
   - Real-time text overlay rendering during playback.
4. **Multi-Track Interactive Timeline**:
   - **Video Track**: Visual clip blocks with in/out trim markers, selection highlight, and duration.
   - **Audio Track**: Background music and volume adjustment.
   - **Text Overlay Track**: Timed text banners with customizable neon hues.
   - **Playhead**: Draggable needle with electric-cyan needle and smooth scrubbing.
   - **Zoom Controls**: Zoom in / out to adjust timeline scale.
5. **Editing Operations**:
   - **Trim**: Non-destructive start offset (in-point) and end offset (out-point).
   - **Split**: Slice clips at the exact current playhead timestamp into two distinct clips.
   - **Reorder**: Change clip order sequence.
   - **Delete & Duplicate**: Instantly remove or clone clips with auto-reindexing.
   - **Audio Volume**: Per-clip volume slider (0% to 200%) and mute toggle.
   - **Text Overlays**: Add customized neon titles with start time, duration, and palette presets.
6. **Undo & Redo System**: Full command/state stack preserving project history.
7. **AndroidX Media3 Transformer Export**: Real composition rendering to MP4/H.264 with live progress and ETA.

---

## 🛠️ GitHub Actions CI / CD Workflow

The complete, production-ready workflow is located at:
```
.github/workflows/android-build.yml
```

### Triggering the Workflow:
1. Push this repository to GitHub on `main` or open a Pull Request.
2. Or go to **Actions** > **Android CI Build** > click **Run workflow**.
3. The workflow will:
   - Check out code
   - Configure JDK 17 (Temurin) with automatic Gradle cache
   - Make `./gradlew` executable
   - Run unit tests (`./gradlew testDebugUnitTest`)
   - Build debug APK (`./gradlew assembleDebug --stacktrace`)
   - Upload `zafronix-video-editor-debug-apk` as a downloadable artifact!

---

## 💻 Local Build Instructions

### Prerequisites
- Java Development Kit (JDK) 17+
- Android SDK 34 (Android 14)

### Building via Terminal
```bash
# Make wrapper executable
chmod +x gradlew

# Run unit tests
./gradlew testDebugUnitTest

# Assemble Debug APK
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Repository Structure Instructions

When using the provided `zarvimo-video-editor.zip`:
1. Extract the contents directly into your Git repository root.
2. Verify that `.github/`, `gradle/`, `app/`, `build.gradle.kts`, `settings.gradle.kts`, and `gradlew` are located directly in the root directory (not in a subfolder).
3. Commit and push:
```bash
git add .
git commit -m "feat: initial Zarvimo Video Editor Phase 1 repository"
git push origin main
```
4. GitHub Actions will trigger automatically and build the debug APK.
