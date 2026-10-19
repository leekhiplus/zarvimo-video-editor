package com.zafronix.videoeditor.data.model

import java.util.UUID

data class Project(
    val id: String = UUID.randomUUID().toString(),
    val title: String = "Untitled Video",
    val aspectRatio: AspectRatio = AspectRatio.LANDSCAPE_16_9,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val videoClips: List<VideoClip> = emptyList(),
    val audioTracks: List<AudioTrack> = emptyList(),
    val textOverlays: List<TextOverlay> = emptyList()
) {
    val totalDurationMs: Long
        get() = videoClips.sumOf { it.effectiveDurationMs }

    val clipCount: Int
        get() = videoClips.size
}
