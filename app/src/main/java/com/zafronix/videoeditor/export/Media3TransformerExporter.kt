package com.zafronix.videoeditor.export

import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.TransformationRequest
import androidx.media3.transformer.Transformer
import com.zafronix.videoeditor.data.model.ExportConfig
import com.zafronix.videoeditor.data.model.Project
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.File

sealed class ExportState {
    object Idle : ExportState()
    data class Exporting(val progressPercent: Int, val etaSeconds: Int) : ExportState()
    data class Completed(val outputFile: File) : ExportState()
    data class Failed(val error: String) : ExportState()
}

@OptIn(UnstableApi::class)
class Media3TransformerExporter(private val context: Context) {

    private var activeTransformer: Transformer? = null
    private var progressJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _exportState = MutableStateFlow<ExportState>(ExportState.Idle)
    val exportState: StateFlow<ExportState> = _exportState.asStateFlow()

    fun exportProject(
        project: Project,
        config: ExportConfig,
        outputFileName: String = "Zarvimo_${System.currentTimeMillis()}.mp4"
    ) {
        if (project.videoClips.isEmpty()) {
            _exportState.value = ExportState.Failed("No video clips in project to export")
            return
        }

        val exportDir = File(context.cacheDir, "exports").apply { if (!exists()) mkdirs() }
        val outputFile = File(exportDir, outputFileName)
        if (outputFile.exists()) {
            outputFile.delete()
        }

        _exportState.value = ExportState.Exporting(progressPercent = 0, etaSeconds = 0)

        try {
            val editedItems = project.videoClips.map { clip ->
                val clippingConfig = MediaItem.ClippingConfiguration.Builder()
                    .setStartPositionMs(clip.startOffsetMs)
                    .setEndPositionMs(clip.endOffsetMs)
                    .build()

                val mediaItem = MediaItem.Builder()
                    .setUri(Uri.parse(clip.uri))
                    .setClippingConfiguration(clippingConfig)
                    .build()

                EditedMediaItem.Builder(mediaItem)
                    .setRemoveAudio(clip.isMuted || !config.includeAudio)
                    .build()
            }

            val sequence = EditedMediaItemSequence(editedItems)
            val composition = Composition.Builder(sequence).build()

            val listener = object : Transformer.Listener {
                override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                    stopProgressTracking()
                    _exportState.value = ExportState.Completed(outputFile)
                }

                override fun onError(
                    composition: Composition,
                    exportResult: ExportResult,
                    exportException: ExportException
                ) {
                    stopProgressTracking()
                    _exportState.value = ExportState.Failed(exportException.message ?: "Export failed")
                }
            }

            val transformer = Transformer.Builder(context)
                .setVideoMimeType(MimeTypes.VIDEO_H264)
                .setAudioMimeType(MimeTypes.AUDIO_AAC)
                .addListener(listener)
                .build()

            activeTransformer = transformer
            transformer.start(composition, outputFile.absolutePath)
            startProgressTracking(transformer)

        } catch (e: Exception) {
            _exportState.value = ExportState.Failed("Initialization failed: ${e.message}")
        }
    }

    private fun startProgressTracking(transformer: Transformer) {
        progressJob?.cancel()
        progressJob = scope.launch {
            val progressHolder = ProgressHolder()
            val startTime = System.currentTimeMillis()

            while (isActive) {
                val progressState = transformer.getProgress(progressHolder)
                if (progressState == Transformer.PROGRESS_STATE_AVAILABLE) {
                    val progress = progressHolder.progress
                    val elapsedSeconds = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                    val eta = if (progress > 5) {
                        ((elapsedSeconds.toFloat() / progress) * (100 - progress)).toInt()
                    } else 0

                    _exportState.value = ExportState.Exporting(
                        progressPercent = progress,
                        etaSeconds = eta
                    )
                }
                delay(200)
            }
        }
    }

    private fun stopProgressTracking() {
        progressJob?.cancel()
        progressJob = null
    }

    fun cancelExport() {
        activeTransformer?.cancel()
        stopProgressTracking()
        _exportState.value = ExportState.Idle
    }

    fun resetState() {
        _exportState.value = ExportState.Idle
    }
}
