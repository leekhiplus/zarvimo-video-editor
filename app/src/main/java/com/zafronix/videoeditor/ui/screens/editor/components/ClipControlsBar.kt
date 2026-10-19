package com.zafronix.videoeditor.ui.screens.editor.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CallSplit
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zafronix.videoeditor.ui.theme.DangerRed
import com.zafronix.videoeditor.ui.theme.NeonCyan
import com.zafronix.videoeditor.ui.theme.NeonMagenta
import com.zafronix.videoeditor.ui.theme.NeonViolet
import com.zafronix.videoeditor.ui.theme.TextMuted
import com.zafronix.videoeditor.ui.theme.TextPrimary
import com.zafronix.videoeditor.ui.theme.ZafronixBorder
import com.zafronix.videoeditor.ui.theme.ZafronixCard
import com.zafronix.videoeditor.ui.theme.ZafronixElevated

@Composable
fun ClipControlsBar(
    hasSelectedClip: Boolean,
    onAddMedia: () -> Unit,
    onSplit: () -> Unit,
    onTrim: () -> Unit,
    onVolume: () -> Unit,
    onAddText: () -> Unit,
    onDelete: () -> Unit,
    onDuplicate: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(ZafronixCard)
            .border(1.dp, ZafronixBorder)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        ActionButton(
            icon = Icons.Default.Add,
            label = "Add",
            tint = NeonCyan,
            enabled = true,
            onClick = onAddMedia
        )

        ActionButton(
            icon = Icons.Default.CallSplit,
            label = "Split",
            tint = NeonCyan,
            enabled = hasSelectedClip,
            onClick = onSplit
        )

        ActionButton(
            icon = Icons.Default.ContentCut,
            label = "Trim",
            tint = NeonCyan,
            enabled = hasSelectedClip,
            onClick = onTrim
        )

        ActionButton(
            icon = Icons.Default.VolumeUp,
            label = "Volume",
            tint = NeonViolet,
            enabled = hasSelectedClip,
            onClick = onVolume
        )

        ActionButton(
            icon = Icons.Default.TextFields,
            label = "Text",
            tint = NeonMagenta,
            enabled = true,
            onClick = onAddText
        )

        ActionButton(
            icon = Icons.Default.ContentCopy,
            label = "Duplicate",
            tint = TextPrimary,
            enabled = hasSelectedClip,
            onClick = onDuplicate
        )

        ActionButton(
            icon = Icons.Default.Delete,
            label = "Delete",
            tint = DangerRed,
            enabled = hasSelectedClip,
            onClick = onDelete
        )
    }
}

@Composable
private fun ActionButton(
    icon: ImageVector,
    label: String,
    tint: Color,
    enabled: Boolean,
    onClick: () -> Unit
) {
    val actualTint = if (enabled) tint else TextMuted.copy(alpha = 0.5f)

    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = actualTint,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            fontSize = 10.sp,
            color = actualTint
        )
    }
}
