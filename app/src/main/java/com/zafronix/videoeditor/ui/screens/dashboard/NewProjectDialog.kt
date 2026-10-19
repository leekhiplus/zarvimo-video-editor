package com.zafronix.videoeditor.ui.screens.dashboard

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.zafronix.videoeditor.data.model.AspectRatio
import com.zafronix.videoeditor.ui.theme.NeonCyan
import com.zafronix.videoeditor.ui.theme.TextMuted
import com.zafronix.videoeditor.ui.theme.TextPrimary
import com.zafronix.videoeditor.ui.theme.TextSecondary
import com.zafronix.videoeditor.ui.theme.ZafronixBorder
import com.zafronix.videoeditor.ui.theme.ZafronixCard
import com.zafronix.videoeditor.ui.theme.ZafronixElevated
import com.zafronix.videoeditor.ui.theme.ZafronixSurface

@Composable
fun NewProjectDialog(
    onDismiss: () -> Unit,
    onCreate: (title: String, ratio: AspectRatio) -> Unit
) {
    var title by remember { mutableStateOf("New Neon Project") }
    var selectedRatio by remember { mutableStateOf(AspectRatio.LANDSCAPE_16_9) }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(ZafronixSurface)
                .border(1.dp, ZafronixBorder, RoundedCornerShape(16.dp))
                .padding(24.dp)
        ) {
            Column {
                Text(
                    text = "CREATE PROJECT",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    color = NeonCyan
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Project Title") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = ZafronixBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextSecondary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "ASPECT RATIO",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    AspectRatio.values().forEach { ratio ->
                        val isSelected = selectedRatio == ratio
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ZafronixElevated else ZafronixCard)
                                .border(
                                    1.dp,
                                    if (isSelected) NeonCyan else ZafronixBorder,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedRatio = ratio }
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = ratio.displayName,
                                fontSize = 14.sp,
                                color = if (isSelected) NeonCyan else TextPrimary,
                                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                            )
                            Text(
                                text = "${ratio.widthRatio}:${ratio.heightRatio}",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextSecondary)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                onCreate(title.trim(), selectedRatio)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NeonCyan,
                            contentColor = ZafronixSurface
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Create Studio", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
