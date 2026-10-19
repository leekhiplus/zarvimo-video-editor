package com.zafronix.videoeditor.data.model

import java.util.UUID

data class TextOverlay(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val startTimeMs: Long = 0L,
    val durationMs: Long = 3000L,
    val normalizedX: Float = 0.5f, // 0f to 1f (center default)
    val normalizedY: Float = 0.8f, // 0f to 1f (subtitles position default)
    val fontSizeSp: Int = 24,
    val textColorHex: String = "#00E5FF", // Neon Cyan default
    val backgroundColorHex: String = "#80080B11", // semi-transparent navy
    val isNeonGlow: Boolean = true
) {
    val endTimeMs: Long
        get() = startTimeMs + durationMs

    fun isVisibleAt(timestampMs: Long): Boolean {
        return timestampMs in startTimeMs..endTimeMs
    }
}
