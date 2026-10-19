package com.zafronix.videoeditor.data.repository

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.zafronix.videoeditor.data.model.AspectRatio
import com.zafronix.videoeditor.data.model.Project
import com.zafronix.videoeditor.data.model.VideoClip
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class ProjectRepository(private val context: Context) {
    private val gson = Gson()
    private val projectsDir: File by lazy {
        File(context.filesDir, "zafronix_projects").apply {
            if (!exists()) mkdirs()
        }
    }

    suspend fun getAllProjects(): List<Project> = withContext(Dispatchers.IO) {
        val files = projectsDir.listFiles { _, name -> name.endsWith(".json") } ?: return@withContext emptyList()
        val projects = mutableListOf<Project>()
        for (file in files) {
            try {
                val json = file.readText()
                val project = gson.fromJson(json, Project::class.java)
                if (project != null) {
                    projects.add(project)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        projects.sortedByDescending { it.updatedAt }
    }

    suspend fun getProjectById(id: String): Project? = withContext(Dispatchers.IO) {
        val file = File(projectsDir, "$id.json")
        if (!file.exists()) return@withContext null
        try {
            val json = file.readText()
            gson.fromJson(json, Project::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun saveProject(project: Project): Boolean = withContext(Dispatchers.IO) {
        try {
            val updated = project.copy(updatedAt = System.currentTimeMillis())
            val file = File(projectsDir, "${project.id}.json")
            val json = gson.toJson(updated)
            file.writeText(json)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun deleteProject(id: String): Boolean = withContext(Dispatchers.IO) {
        val file = File(projectsDir, "$id.json")
        if (file.exists()) {
            file.delete()
        } else {
            false
        }
    }

    fun createSampleProject(): Project {
        return Project(
            title = "Neon Dreams",
            aspectRatio = AspectRatio.LANDSCAPE_16_9,
            videoClips = listOf(
                VideoClip(
                    name = "Neon_Cyberpunk_Intro.mp4",
                    uri = "asset:///samples/sample1.mp4",
                    sourceDurationMs = 5000L,
                    startOffsetMs = 0L,
                    endOffsetMs = 5000L,
                    orderIndex = 0
                ),
                VideoClip(
                    name = "Synthwave_Highway.mp4",
                    uri = "asset:///samples/sample2.mp4",
                    sourceDurationMs = 6000L,
                    startOffsetMs = 500L,
                    endOffsetMs = 5500L,
                    orderIndex = 1
                )
            )
        )
    }
}
