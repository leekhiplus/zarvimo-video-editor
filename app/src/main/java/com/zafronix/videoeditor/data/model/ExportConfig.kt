package com.zafronix.videoeditor.data.model

enum class AspectRatio(val displayName: String, val widthRatio: Int, val heightRatio: Int) {
    LANDSCAPE_16_9("16:9 Landscape", 16, 9),
    PORTRAIT_9_16("9:16 Portrait", 9, 16),
    SQUARE_1_1("1:1 Square", 1, 1),
    CINEMA_21_9("21:9 UltraWide", 21, 9);

    val ratio: Float
        get() = widthRatio.toFloat() / heightRatio.toFloat()
}

enum class ExportResolution(val label: String, val width: Int, val height: Int) {
    HD_720P("720p HD", 1280, 720),
    FHD_1080P("1080p Full HD", 1920, 1080),
    UHD_4K("4K Ultra HD", 3840, 2160)
}

enum class ExportFrameRate(val fps: Int) {
    FPS_24(24),
    FPS_30(30),
    FPS_60(60)
}

data class ExportConfig(
    val resolution: ExportResolution = ExportResolution.FHD_1080P,
    val frameRate: ExportFrameRate = ExportFrameRate.FPS_30,
    val bitrateMbps: Int = 12,
    val includeAudio: Boolean = true
)
