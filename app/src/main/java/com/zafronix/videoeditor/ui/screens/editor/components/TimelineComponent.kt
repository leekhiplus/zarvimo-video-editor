package com.zafronix.videoeditor.ui.screens.editor.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zafronix.videoeditor.data.model.AudioTrack
import com.zafronix.videoeditor.data.model.TextOverlay
import com.zafronix.videoeditor.data.model.VideoClip
import com.zafronix.videoeditor.ui.theme.NeonCyan
import com.zafronix.videoeditor.ui.theme.NeonMagenta
import com.zafronix.videoeditor.ui.theme.NeonViolet
import com.zafronix.videoeditor.ui.theme.TextMuted
import com.zafronix.videoeditor.ui.theme.TextPrimary
import com.zafronix.videoeditor.ui.theme.TrackAudioColor
import com.zafronix.videoeditor.ui.theme.TrackTextColor
import com.zafronix.videoeditor.ui.theme.TrackVideoColor
import com.zafronix.videoeditor.ui.theme.ZafronixBorder
import com.zafronix.videoeditor.ui.theme.ZafronixCard
import com.zafronix.videoeditor.ui.theme.ZafronixElevated
import com.zafronix.videoeditor.ui.theme.ZafronixSurface
import kotlin.math.roundToInt

@Composable
fun TimelineComponent(
    videoClips: List<VideoClip>,
    audioTracks: List<AudioTrack>,
    textOverlays: List<TextOverlay>,
    selectedClipId: String?,
    currentPositionMs: Long,
    totalDurationMs: Long,
    zoomFactor: Float, // ms to dp factor, e.g. 0.05dp per ms
    onSelectClip: (String) -> Unit,
    onSeek: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val safeTotalDuration = totalDurationMs.coerceAtLeast(1000L)
    val timelineWidthDp = (safeTotalDuration * zoomFactor).coerceAtLeast(400f).dp

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .background(ZafronixSurface)
            .border(1.dp, ZafronixBorder, RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // Ruler / Scrubber Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(28.dp)
                    .background(ZafronixElevated)
                    .horizontalScroll(scrollState)
                    .pointerInput(safeTotalDuration, zoomFactor) {
                        detectTapGestures { offset ->
                            val clickedMs = (offset.x / (density * zoomFactor)).toLong()
                            onSeek(clickedMs.coerceIn(0L, safeTotalDuration))
                        }
                    }
            ) {
                // Time markers every 1 second
                val secondsCount = (safeTotalDuration / 1000).toInt() + 2
                Row(modifier = Modifier.width(timelineWidthDp)) {
                    for (sec in 0..secondsCount) {
                        val posDp = (sec * 1000 * zoomFactor).dp
                        Box(
                            modifier = Modifier
                                .offset { IntOffset((sec * 1000 * zoomFactor * density).roundToInt(), 0) }
                                .padding(top = 4.dp)
                        ) {
                            Text(
                                text = String.format("%02d:%02d", sec / 60, sec % 60),
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = TextMuted
                            )
                        }
                    }
                }
            }

            // Scrollable Tracks Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .horizontalScroll(scrollState)
            ) {
                Column(
                    modifier = Modifier
                        .width(timelineWidthDp)
                        .padding(vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {

                    // Track 1: Text Overlays Track
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(24.dp)
                            .background(ZafronixCard, RoundedCornerShape(4.dp))
                    ) {
                        textOverlays.forEach { textOverlay ->
                            val offsetDp = (textOverlay.startTimeMs * zoomFactor).dp
                            val widthDp = (textOverlay.durationMs * zoomFactor).coerceAtLeast(30f).dp
                            Box(
                                modifier = Modifier
                                    .offset { IntOffset((textOverlay.startTimeMs * zoomFactor * density).roundToInt(), 0) }
                                    .width(widthDp)
                                    .fillMaxHeight()
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(TrackTextColor.copy(alpha = 0.85f))
                                    .padding(horizontal = 6.dp),
                                contentAlignment = Alignment.CenterStart
                            ) {
                                Text(
                                    text = "T: ${textOverlay.text}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    maxLines = 1
                                )
                            }
                        }
                    }

                    // Track 2: Video Clips Track
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .background(ZafronixCard, RoundedCornerShape(6.dp))
                    ) {
                        var accumulatedMs = 0L
                        videoClips.forEach { clip ->
                            val isSelected = clip.id == selectedClipId
                            val clipWidthDp = (clip.effectiveDurationMs * zoomFactor).coerceAtLeast(40f).dp

                            Box(
                                modifier = Modifier
                                    .width(clipWidthDp)
                                    .fillMaxHeight()
                                    .padding(horizontal = 1.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSelected) TrackVideoColor else TrackVideoColor.copy(alpha = 0.7f))
                                    .border(
                                        2.dp,
                                        if (isSelected) Color.White else Color.Transparent,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .clickable { onSelectClip(clip.id) }
                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxSize(),
                                    verticalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = clip.name,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ZafronixSurface,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = "${clip.trimmedDurationMs / 1000f}s",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = ZafronixSurface
                                    )
                                }
                            }
                            accumulatedMs += clip.effectiveDurationMs
                        }
                    }

                    // Track 3: Audio Track
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(28.dp)
                            .background(ZafronixCard, RoundedCornerShape(4.dp))
                    ) {
                        Box(
                            modifier = Modifier
                                .width((totalDurationMs * zoomFactor).coerceAtLeast(200f).dp)
                                .fillMaxHeight()
                                .clip(RoundedCornerShape(4.dp))
                                .background(TrackAudioColor.copy(alpha = 0.7f))
                                .padding(horizontal = 8.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Text(
                                text = "♫ Master Audio Track (100%)",
                                fontSize = 11.sp,
                                color = Color.White
                            )
                        }
                    }
                }

                // Global Playhead Scrubber Line
                val playheadOffsetPx = (currentPositionMs * zoomFactor * density).roundToInt()
                Box(
                    modifier = Modifier
                        .offset { IntOffset(playheadOffsetPx, 0) }
                        .width(2.dp)
                        .fillMaxHeight()
                        .background(NeonCyan)
                )

                // Playhead Handle
                Box(
                    modifier = Modifier
                        .offset { IntOffset(playheadOffsetPx - (8 * density).roundToInt(), 0) }
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(NeonCyan)
                        .border(2.dp, Color.White, CircleShape)
                        .pointerInput(safeTotalDuration, zoomFactor) {
                            detectDragGestures { change, dragAmount ->
                                change.consume()
                                val deltaMs = (dragAmount.x / (density * zoomFactor)).toLong()
                                onSeek((currentPositionMs + deltaMs).coerceIn(0L, safeTotalDuration))
                            }
                        }
                )
            }
        }
    }
}
