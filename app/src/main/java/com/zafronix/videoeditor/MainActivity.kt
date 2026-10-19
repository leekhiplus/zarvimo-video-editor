package com.zafronix.videoeditor

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.zafronix.videoeditor.ui.screens.dashboard.DashboardScreen
import com.zafronix.videoeditor.ui.screens.editor.EditorScreen
import com.zafronix.videoeditor.ui.screens.splash.SplashScreen
import com.zafronix.videoeditor.ui.theme.ZafronixBgDark
import com.zafronix.videoeditor.ui.theme.ZafronixTheme

sealed class Screen {
    object Splash : Screen()
    object Dashboard : Screen()
    data class Editor(val projectId: String) : Screen()
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ZafronixTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = ZafronixBgDark
                ) {
                    var currentScreen by remember { mutableStateOf<Screen>(Screen.Splash) }

                    when (val screen = currentScreen) {
                        is Screen.Splash -> {
                            SplashScreen(
                                onSplashComplete = {
                                    currentScreen = Screen.Dashboard
                                }
                            )
                        }

                        is Screen.Dashboard -> {
                            DashboardScreen(
                                onOpenProject = { projectId ->
                                    currentScreen = Screen.Editor(projectId)
                                }
                            )
                        }

                        is Screen.Editor -> {
                            EditorScreen(
                                projectId = screen.projectId,
                                onNavigateBack = {
                                    currentScreen = Screen.Dashboard
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
