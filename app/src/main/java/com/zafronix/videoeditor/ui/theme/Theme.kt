package com.zafronix.videoeditor.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val ZafronixDarkColorScheme = darkColorScheme(
    primary = NeonCyan,
    onPrimary = ZafronixBgDark,
    primaryContainer = ZafronixElevated,
    onPrimaryContainer = NeonCyan,
    secondary = NeonViolet,
    onSecondary = TextPrimary,
    tertiary = NeonMagenta,
    background = ZafronixBgDark,
    surface = ZafronixSurface,
    surfaceVariant = ZafronixCard,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary,
    outline = ZafronixBorder
)

@Composable
fun ZafronixTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = ZafronixDarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            window.statusBarColor = ZafronixBgDark.toArgb()
            window.navigationBarColor = ZafronixBgDark.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
