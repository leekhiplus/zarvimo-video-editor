package com.zafronix.videoeditor.ui.screens.editor

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Redo
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.zafronix.videoeditor.data.model.VideoClip
import com.zafronix.videoeditor.ui.screens.editor.components.ClipControlsBar
import com.zafronix.videoeditor.ui.screens.editor.components.ExportDialog
import com.zafronix.videoeditor.ui.screens.editor.components.TextOverlayEditorDialog
import com.zafronix.videoeditor.ui.screens.editor.components.TimelineComponent
import com.zafronix.videoeditor.ui.screens.editor.components.VideoPreviewComponent
import com.zafronix.videoeditor.ui.screens.editor.components.VolumeAdjustmentDialog
import com.zafronix.videoeditor.ui.theme.NeonCyan
import com.zafronix.videoeditor.ui.theme.NeonMagenta
import com.zafronix.videoeditor.ui.theme.NeonViolet
import com.zafronix.videoeditor.ui.theme.TextMuted
import com.zafronix.videoeditor.ui.theme.TextPrimary
import com.zafronix.videoeditor.ui.theme.TextSecondary
import com.zafronix.videoeditor.ui.theme.ZafronixBgDark
import com.zafronix.videoeditor.ui.theme.ZafronixBorder
import com.zafronix.videoeditor.ui.theme.ZafronixElevated
import com.zafronix.videoeditor.ui.theme.ZafronixSurface

@Composable
fun EditorScreen(
    projectId: String,
    onNavigateBack: () -> Unit,
    viewModel: EditorViewModel = viewModel()
) {
    LaunchedEffect(projectId) {
        viewModel.loadProject(projectId)
    }

    val project by viewModel.project.collectAsState()
    val selectedClipId by viewModel.selectedClipId.collectAsState()
    val zoomFactor by viewModel.zoomFactor.collectAsState()
    val canUndo by viewModel.canUndo.collectAsState()
    val canRedo by viewModel.canRedo.collectAsState()

    val isPlaying by viewModel.playerManager.isPlaying.collectAsState()
    val currentPositionMs by viewModel.playerManager.currentPositionMs.collectAsState()
    val durationMs by viewModel.playerManager.durationMs.collectAsState()
    val exportState by viewModel.exporter.exportState.collectAsState()

    var showExportDialog by remember { mutableStateOf(false) }
    var showVolumeDialog by remember { mutableStateOf(false) }
    var showTextDialog by remember { mutableStateOf(false) }

    val selectedClip = project.videoClips.find { it.id == selectedClipId }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ZafronixBgDark)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // Top Studio Header Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ZafronixSurface)
                    .border(1.dp, ZafronixBorder)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                    Column {
                        Text(
                            text = project.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "${project.aspectRatio.displayName} · ${project.videoClips.size} clips",
                            fontSize = 11.sp,
                            color = NeonCyan
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { viewModel.undo() },
                        enabled = canUndo
                    ) {
                        Icon(
                            Icons.Default.Undo,
                            contentDescription = "Undo",
                            tint = if (canUndo) TextPrimary else TextMuted.copy(alpha = 0.4f)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.redo() },
                        enabled = canRedo
                    ) {
                        Icon(
                            Icons.Default.Redo,
                            contentDescription = "Redo",
                            tint = if (canRedo) TextPrimary else TextMuted.copy(alpha = 0.4f)
                        )
                    }

                    IconButton(onClick = { viewModel.zoomOut() }) {
                        Icon(Icons.Default.ZoomOut, contentDescription = "Zoom Out", tint = TextSecondary)
                    }

                    IconButton(onClick = { viewModel.zoomIn() }) {
                        Icon(Icons.Default.ZoomIn, contentDescription = "Zoom In", tint = TextSecondary)
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    Button(
                        onClick = { showExportDialog = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NeonCyan,
                            contentColor = ZafronixSurface
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Export", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            // Video Preview Workspace
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(12.dp),
                contentAlignment = Alignment.Center
            ) {
                VideoPreviewComponent(
                    playerManager = viewModel.playerManager,
                    aspectRatio = project.aspectRatio,
                    currentPositionMs = currentPositionMs,
                    textOverlays = project.textOverlays,
                    modifier = Modifier.fillMaxSize()
                )
            }

            // Transport Control Strip
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Timecode
                val curMin = (currentPositionMs / 1000) / 60
                val curSec = (currentPositionMs / 1000) % 60
                val curMs = (currentPositionMs % 1000) / 10
                val totMin = (durationMs / 1000) / 60
                val totSec = (durationMs / 1000) % 60

                Text(
                    text = String.format("%02d:%02d.%02d / %02d:%02d", curMin, curSec, curMs, totMin, totSec),
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold,
                    color = NeonCyan
                )

                // Playback Transport Buttons
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    IconButton(
                        onClick = { viewModel.playerManager.stepFrames(-1) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.FastRewind, contentDescription = "-1 Frame", tint = TextSecondary)
                    }

                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(NeonCyan)
                            .border(1.dp, NeonCyan, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        IconButton(onClick = { viewModel.playerManager.togglePlayPause() }) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isPlaying) "Pause" else "Play",
                                tint = ZafronixSurface,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }

                    IconButton(
                        onClick = { viewModel.playerManager.stepFrames(1) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.FastForward, contentDescription = "+1 Frame", tint = TextSecondary)
                    }
                }

                // Snap / Aspect Indicator
                Text(
                    text = project.aspectRatio.displayName.substringBefore(" "),
                    fontSize = 12.sp,
                    color = TextMuted,
                    fontFamily = FontFamily.Monospace
                )
            }

            // Multi-Track Timeline
            TimelineComponent(
                videoClips = project.videoClips,
                audioTracks = project.audioTracks,
                textOverlays = project.textOverlays,
                selectedClipId = selectedClipId,
                currentPositionMs = currentPositionMs,
                totalDurationMs = durationMs,
                zoomFactor = zoomFactor,
                onSelectClip = { viewModel.selectClip(it) },
                onSeek = { viewModel.playerManager.seekTo(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            )

            // Clip Action Controls Bar
            ClipControlsBar(
                hasSelectedClip = selectedClip != null,
                onAddMedia = {
                    val count = project.videoClips.size + 1
                    viewModel.addClip(
                        name = "Clip_$count.mp4",
                        uri = "asset:///samples/sample$count.mp4",
                        durationMs = 4000L
                    )
                },
                onSplit = { viewModel.splitClipAtPlayhead() },
                onTrim = {
                    selectedClip?.let {
                        viewModel.trimSelectedClip(
                            newStartOffsetMs = it.startOffsetMs + 500L,
                            newEndOffsetMs = it.endOffsetMs - 500L
                        )
                    }
                },
                onVolume = { showVolumeDialog = true },
                onAddText = { showTextDialog = true },
                onDelete = { viewModel.deleteSelectedClip() },
                onDuplicate = { viewModel.duplicateSelectedClip() }
            )
        }

        // Dialogs
        if (showVolumeDialog && selectedClip != null) {
            VolumeAdjustmentDialog(
                initialVolume = selectedClip.volume,
                initialIsMuted = selectedClip.isMuted,
                onDismiss = { showVolumeDialog = false },
                onConfirm = { vol, muted ->
                    viewModel.updateSelectedClipVolume(vol, muted)
                    showVolumeDialog = false
                }
            )
        }

        if (showTextDialog) {
            TextOverlayEditorDialog(
                currentPlayheadMs = currentPositionMs,
                onDismiss = { showTextDialog = false },
                onConfirm = { overlay ->
                    viewModel.addTextOverlay(overlay)
                    showTextDialog = false
                }
            )
        }

        if (showExportDialog) {
            ExportDialog(
                exportState = exportState,
                onDismiss = {
                    showExportDialog = false
                    viewModel.exporter.resetState()
                },
                onStartExport = { config ->
                    viewModel.startExport(config)
                },
                onCancelExport = {
                    viewModel.exporter.cancelExport()
                }
            )
        }
    }
}
