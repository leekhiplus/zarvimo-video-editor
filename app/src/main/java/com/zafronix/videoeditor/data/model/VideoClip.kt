package com.zafronix.videoeditor.data.model

import java.util.UUID

data class VideoClip(
    val id: String = UUID.randomUUID().toString(),
    val uri: String,
    val name: String,
    val sourceDurationMs: Long,
    val startOffsetMs: Long = 0L,
    val endOffsetMs: Long = sourceDurationMs,
    val volume: Float = 1.0f,
    val isMuted: Boolean = false,
    val playbackSpeed: Float = 1.0f,
    val orderIndex: Int = 0
) {
    val trimmedDurationMs: Long
        get() = (endOffsetMs - startOffsetMs).coerceAtLeast(100L)

    val effectiveDurationMs: Long
        get() = ((endOffsetMs - startOffsetMs) / playbackSpeed).toLong().coerceAtLeast(100L)
}
