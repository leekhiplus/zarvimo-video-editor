package com.zafronix.videoeditor.playback

import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import com.zafronix.videoeditor.data.model.VideoClip
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

@OptIn(UnstableApi::class)
class ZafronixPlayerManager(private val context: Context) {

    val player: ExoPlayer = ExoPlayer.Builder(context).build()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private var currentClips: List<VideoClip> = emptyList()
    private var progressPollingJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main)

    init {
        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                _isPlaying.value = isPlaying
                if (isPlaying) {
                    startProgressPolling()
                } else {
                    stopProgressPolling()
                    updateCurrentPosition()
                }
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_ENDED) {
                    _isPlaying.value = false
                    stopProgressPolling()
                    player.seekTo(0, 0L)
                    _currentPositionMs.value = 0L
                }
            }
        })
    }

    /**
     * Rebuilds playlist from clips using Media3 ClippingConfiguration.
     */
    fun setClips(clips: List<VideoClip>) {
        currentClips = clips
        val total = clips.sumOf { it.effectiveDurationMs }
        _durationMs.value = total

        val mediaItems = clips.map { clip ->
            val clippingConfig = MediaItem.ClippingConfiguration.Builder()
                .setStartPositionMs(clip.startOffsetMs)
                .setEndPositionMs(clip.endOffsetMs)
                .build()

            MediaItem.Builder()
                .setUri(Uri.parse(clip.uri))
                .setMediaId(clip.id)
                .setClippingConfiguration(clippingConfig)
                .build()
        }

        player.setMediaItems(mediaItems)
        player.prepare()
    }

    fun play() {
        if (currentClips.isNotEmpty()) {
            player.play()
        }
    }

    fun pause() {
        player.pause()
    }

    fun togglePlayPause() {
        if (player.isPlaying) {
            pause()
        } else {
            play()
        }
    }

    /**
     * Maps global timeline timestamp to appropriate MediaItem and internal position.
     */
    fun seekTo(timelinePositionMs: Long) {
        if (currentClips.isEmpty()) return
        val clampedTime = timelinePositionMs.coerceIn(0L, _durationMs.value)

        var accumulated = 0L
        for ((index, clip) in currentClips.withIndex()) {
            val clipDur = clip.effectiveDurationMs
            if (clampedTime >= accumulated && clampedTime < accumulated + clipDur) {
                val clipOffset = clampedTime - accumulated
                player.seekTo(index, clipOffset)
                _currentPositionMs.value = clampedTime
                return
            }
            accumulated += clipDur
        }
        // If at or past end, seek to last clip end
        if (currentClips.isNotEmpty()) {
            val lastIndex = currentClips.lastIndex
            player.seekTo(lastIndex, currentClips.last().trimmedDurationMs)
            _currentPositionMs.value = _durationMs.value
        }
    }

    fun stepFrames(frames: Int, fps: Int = 30) {
        val frameDurationMs = (1000.0 / fps).toLong()
        val newPos = (_currentPositionMs.value + (frames * frameDurationMs)).coerceIn(0L, _durationMs.value)
        seekTo(newPos)
    }

    fun setVolume(volume: Float) {
        player.volume = volume.coerceIn(0f, 2.0f)
    }

    private fun startProgressPolling() {
        progressPollingJob?.cancel()
        progressPollingJob = scope.launch {
            while (isActive) {
                updateCurrentPosition()
                delay(16) // ~60fps timeline refresh
            }
        }
    }

    private fun stopProgressPolling() {
        progressPollingJob?.cancel()
        progressPollingJob = null
    }

    private fun updateCurrentPosition() {
        val currentMediaItemIndex = player.currentMediaItemIndex
        val itemPosition = player.currentPosition

        if (currentMediaItemIndex in currentClips.indices) {
            var accumulated = 0L
            for (i in 0 until currentMediaItemIndex) {
                accumulated += currentClips[i].effectiveDurationMs
            }
            _currentPositionMs.value = (accumulated + itemPosition).coerceIn(0L, _durationMs.value)
        }
    }

    fun release() {
        stopProgressPolling()
        player.release()
    }
}
