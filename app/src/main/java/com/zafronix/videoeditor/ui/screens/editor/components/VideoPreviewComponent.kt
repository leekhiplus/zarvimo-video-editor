package com.zafronix.videoeditor.ui.screens.editor.components

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.PlayerView
import com.zafronix.videoeditor.data.model.AspectRatio
import com.zafronix.videoeditor.data.model.TextOverlay
import com.zafronix.videoeditor.playback.ZafronixPlayerManager
import com.zafronix.videoeditor.ui.theme.NeonCyan
import com.zafronix.videoeditor.ui.theme.ZafronixBgDark
import com.zafronix.videoeditor.ui.theme.ZafronixBorder

@OptIn(UnstableApi::class)
@Composable
fun VideoPreviewComponent(
    playerManager: ZafronixPlayerManager,
    aspectRatio: AspectRatio,
    currentPositionMs: Long,
    textOverlays: List<TextOverlay>,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    val playerView = remember {
        PlayerView(context).apply {
            useController = false
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            player = playerManager.player
        }
    }

    DisposableEffect(playerManager) {
        playerView.player = playerManager.player
        onDispose {
            playerView.player = null
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(ZafronixBgDark)
            .border(1.dp, ZafronixBorder, RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center
    ) {
        // Enforce aspect ratio box
        Box(
            modifier = Modifier
                .aspectRatio(aspectRatio.ratio)
                .clip(RoundedCornerShape(8.dp))
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            AndroidView(
                factory = { playerView },
                modifier = Modifier.fillMaxSize()
            )

            // Dynamic Text Overlays
            textOverlays.forEach { overlay ->
                if (overlay.isVisibleAt(currentPositionMs)) {
                    val overlayColor = try {
                        Color(android.graphics.Color.parseColor(overlay.textColorHex))
                    } catch (e: Exception) {
                        NeonCyan
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0x99000000))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = overlay.text,
                                color = overlayColor,
                                fontSize = overlay.fontSizeSp.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
