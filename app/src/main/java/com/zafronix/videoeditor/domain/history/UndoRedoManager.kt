package com.zafronix.videoeditor.domain.history

import com.zafronix.videoeditor.data.model.Project
import java.util.ArrayDeque

class UndoRedoManager(private val maxHistorySize: Int = 30) {
    private val undoStack = ArrayDeque<Project>()
    private val redoStack = ArrayDeque<Project>()

    val canUndo: Boolean
        get() = undoStack.isNotEmpty()

    val canRedo: Boolean
        get() = redoStack.isNotEmpty()

    /**
     * Saves the current project state before an operation is executed.
     */
    fun pushState(currentState: Project) {
        if (undoStack.size >= maxHistorySize) {
            undoStack.removeLast()
        }
        undoStack.push(currentState)
        redoStack.clear()
    }

    /**
     * Reverts to the previous state. Returns the restored Project state or null if cannot undo.
     */
    fun undo(currentState: Project): Project? {
        if (undoStack.isEmpty()) return null
        val previousState = undoStack.pop()
        redoStack.push(currentState)
        return previousState
    }

    /**
     * Re-applies the undone state. Returns the redone Project state or null if cannot redo.
     */
    fun redo(currentState: Project): Project? {
        if (redoStack.isEmpty()) return null
        val nextState = redoStack.pop()
        undoStack.push(currentState)
        return nextState
    }

    fun clear() {
        undoStack.clear()
        redoStack.clear()
    }
}
