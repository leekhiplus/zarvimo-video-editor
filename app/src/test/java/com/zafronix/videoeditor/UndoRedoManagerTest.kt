package com.zafronix.videoeditor

import com.zafronix.videoeditor.data.model.Project
import com.zafronix.videoeditor.domain.history.UndoRedoManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class UndoRedoManagerTest {

    private lateinit var undoRedoManager: UndoRedoManager

    @Before
    fun setUp() {
        undoRedoManager = UndoRedoManager(maxHistorySize = 10)
    }

    @Test
    fun initialState_hasNoUndoOrRedo() {
        assertFalse(undoRedoManager.canUndo)
        assertFalse(undoRedoManager.canRedo)
    }

    @Test
    fun pushState_enablesUndo() {
        val state1 = Project(title = "State 1")
        undoRedoManager.pushState(state1)

        assertTrue(undoRedoManager.canUndo)
        assertFalse(undoRedoManager.canRedo)
    }

    @Test
    fun undo_restoresPreviousStateAndEnablesRedo() {
        val state1 = Project(title = "State 1")
        val state2 = Project(title = "State 2")

        undoRedoManager.pushState(state1)
        val restored = undoRedoManager.undo(currentState = state2)

        assertNotNull(restored)
        assertEquals("State 1", restored?.title)
        assertFalse(undoRedoManager.canUndo)
        assertTrue(undoRedoManager.canRedo)
    }

    @Test
    fun redo_reAppliesUndoneState() {
        val state1 = Project(title = "State 1")
        val state2 = Project(title = "State 2")

        undoRedoManager.pushState(state1)
        undoRedoManager.undo(currentState = state2)

        val redone = undoRedoManager.redo(currentState = state1)
        assertNotNull(redone)
        assertEquals("State 2", redone?.title)
        assertTrue(undoRedoManager.canUndo)
        assertFalse(undoRedoManager.canRedo)
    }

    @Test
    fun maxHistorySize_evictsOldestStates() {
        val smallManager = UndoRedoManager(maxHistorySize = 3)
        smallManager.pushState(Project(title = "State 1"))
        smallManager.pushState(Project(title = "State 2"))
        smallManager.pushState(Project(title = "State 3"))
        smallManager.pushState(Project(title = "State 4"))

        // Only 3 should remain
        var count = 0
        var current = Project(title = "State 5")
        while (smallManager.canUndo) {
            val prev = smallManager.undo(current)
            if (prev != null) {
                current = prev
                count++
            }
        }
        assertEquals(3, count)
        // Oldest state was State 1, so after 3 undos the last restored should be State 2
        assertEquals("State 2", current.title)
    }
}
