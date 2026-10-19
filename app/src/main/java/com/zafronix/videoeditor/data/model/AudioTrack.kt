package com.zafronix.videoeditor.data.model

import java.util.UUID

data class AudioTrack(
    val id: String = UUID.randomUUID().toString(),
    val uri: String,
    val name: String,
    val durationMs: Long,
    val startTimeMs: Long = 0L,
    val volume: Float = 1.0f,
    val isMuted: Boolean = false
)
