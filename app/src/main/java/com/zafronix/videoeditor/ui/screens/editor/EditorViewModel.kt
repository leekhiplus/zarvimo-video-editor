package com.zafronix.videoeditor.ui.screens.editor

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.zafronix.videoeditor.data.model.ExportConfig
import com.zafronix.videoeditor.data.model.Project
import com.zafronix.videoeditor.data.model.TextOverlay
import com.zafronix.videoeditor.data.model.VideoClip
import com.zafronix.videoeditor.data.repository.ProjectRepository
import com.zafronix.videoeditor.domain.history.UndoRedoManager
import com.zafronix.videoeditor.domain.timeline.TimelineManager
import com.zafronix.videoeditor.export.ExportState
import com.zafronix.videoeditor.export.Media3TransformerExporter
import com.zafronix.videoeditor.playback.ZafronixPlayerManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class EditorViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = ProjectRepository(application)
    val timelineManager = TimelineManager()
    val undoRedoManager = UndoRedoManager()
    val playerManager = ZafronixPlayerManager(application)
    val exporter = Media3TransformerExporter(application)

    private val _project = MutableStateFlow<Project>(Project())
    val project: StateFlow<Project> = _project.asStateFlow()

    private val _selectedClipId = MutableStateFlow<String?>(null)
    val selectedClipId: StateFlow<String?> = _selectedClipId.asStateFlow()

    private val _zoomFactor = MutableStateFlow(0.04f) // dp per millisecond
    val zoomFactor: StateFlow<Float> = _zoomFactor.asStateFlow()

    private val _canUndo = MutableStateFlow(false)
    val canUndo: StateFlow<Boolean> = _canUndo.asStateFlow()

    private val _canRedo = MutableStateFlow(false)
    val canRedo: StateFlow<Boolean> = _canRedo.asStateFlow()

    fun loadProject(projectId: String) {
        viewModelScope.launch {
            val loaded = repository.getProjectById(projectId) ?: repository.createSampleProject()
            _project.value = loaded
            _selectedClipId.value = loaded.videoClips.firstOrNull()?.id
            playerManager.setClips(loaded.videoClips)
            updateUndoRedoStates()
        }
    }

    private fun mutateProject(mutation: (Project) -> Project) {
        val current = _project.value
        undoRedoManager.pushState(current)
        val updated = mutation(current)
        _project.value = updated
        playerManager.setClips(updated.videoClips)
        updateUndoRedoStates()
        viewModelScope.launch {
            repository.saveProject(updated)
        }
    }

    fun selectClip(clipId: String) {
        _selectedClipId.value = clipId
    }

    fun addClip(name: String, uri: String, durationMs: Long) {
        mutateProject { current ->
            val newClip = VideoClip(
                name = name,
                uri = uri,
                sourceDurationMs = durationMs,
                startOffsetMs = 0L,
                endOffsetMs = durationMs
            )
            val updatedClips = timelineManager.addClip(current.videoClips, newClip)
            current.copy(videoClips = updatedClips)
        }
    }

    fun splitClipAtPlayhead() {
        val selectedId = _selectedClipId.value ?: return
        val current = _project.value
        val playheadMs = playerManager.currentPositionMs.value

        val resolved = timelineManager.findClipAtTimestamp(current.videoClips, playheadMs) ?: return
        val targetClip = resolved.first
        val offsetInside = resolved.second - targetClip.startOffsetMs

        val splitResult = timelineManager.splitClipAtOffset(targetClip, offsetInside) ?: return
        val (part1, part2) = splitResult

        mutateProject { curr ->
            val index = curr.videoClips.indexOfFirst { it.id == targetClip.id }
            if (index == -1) return@mutateProject curr

            val mutableList = curr.videoClips.toMutableList()
            mutableList[index] = part1
            mutableList.add(index + 1, part2)
            val reindexed = mutableList.mapIndexed { idx, c -> c.copy(orderIndex = idx) }
            curr.copy(videoClips = reindexed)
        }
        _selectedClipId.value = part2.id
    }

    fun trimSelectedClip(newStartOffsetMs: Long, newEndOffsetMs: Long) {
        val selectedId = _selectedClipId.value ?: return
        mutateProject { curr ->
            val updatedList = curr.videoClips.map { clip ->
                if (clip.id == selectedId) {
                    timelineManager.trimClip(clip, newStartOffsetMs, newEndOffsetMs)
                } else clip
            }
            curr.copy(videoClips = updatedList)
        }
    }

    fun updateSelectedClipVolume(volume: Float, isMuted: Boolean) {
        val selectedId = _selectedClipId.value ?: return
        mutateProject { curr ->
            val updated = curr.videoClips.map { clip ->
                if (clip.id == selectedId) {
                    clip.copy(volume = volume, isMuted = isMuted)
                } else clip
            }
            curr.copy(videoClips = updated)
        }
    }

    fun deleteSelectedClip() {
        val selectedId = _selectedClipId.value ?: return
        mutateProject { curr ->
            val updated = timelineManager.deleteClip(curr.videoClips, selectedId)
            curr.copy(videoClips = updated)
        }
        _selectedClipId.value = _project.value.videoClips.firstOrNull()?.id
    }

    fun duplicateSelectedClip() {
        val selectedId = _selectedClipId.value ?: return
        mutateProject { curr ->
            val updated = timelineManager.duplicateClip(curr.videoClips, selectedId)
            curr.copy(videoClips = updated)
        }
    }

    fun addTextOverlay(textOverlay: TextOverlay) {
        mutateProject { curr ->
            curr.copy(textOverlays = curr.textOverlays + textOverlay)
        }
    }

    fun undo() {
        val restored = undoRedoManager.undo(_project.value) ?: return
        _project.value = restored
        playerManager.setClips(restored.videoClips)
        updateUndoRedoStates()
        viewModelScope.launch {
            repository.saveProject(restored)
        }
    }

    fun redo() {
        val restored = undoRedoManager.redo(_project.value) ?: return
        _project.value = restored
        playerManager.setClips(restored.videoClips)
        updateUndoRedoStates()
        viewModelScope.launch {
            repository.saveProject(restored)
        }
    }

    fun zoomIn() {
        _zoomFactor.value = (_zoomFactor.value * 1.3f).coerceAtMost(0.2f)
    }

    fun zoomOut() {
        _zoomFactor.value = (_zoomFactor.value / 1.3f).coerceAtLeast(0.01f)
    }

    fun startExport(config: ExportConfig) {
        exporter.exportProject(_project.value, config)
    }

    private fun updateUndoRedoStates() {
        _canUndo.value = undoRedoManager.canUndo
        _canRedo.value = undoRedoManager.canRedo
    }

    override fun onCleared() {
        super.onCleared()
        playerManager.release()
    }
}
