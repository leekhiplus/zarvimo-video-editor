package com.zafronix.videoeditor

import com.zafronix.videoeditor.data.model.VideoClip
import com.zafronix.videoeditor.domain.timeline.TimelineManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

class TimelineManagerTest {

    private lateinit var timelineManager: TimelineManager

    @Before
    fun setUp() {
        timelineManager = TimelineManager()
    }

    @Test
    fun calculateTotalDuration_sumsAllEffectiveDurations() {
        val clips = listOf(
            VideoClip(name = "Clip 1", uri = "uri1", sourceDurationMs = 5000L, startOffsetMs = 0L, endOffsetMs = 5000L),
            VideoClip(name = "Clip 2", uri = "uri2", sourceDurationMs = 4000L, startOffsetMs = 1000L, endOffsetMs = 4000L) // 3000ms
        )

        val total = timelineManager.calculateTotalDuration(clips)
        assertEquals(8000L, total)
    }

    @Test
    fun findClipAtTimestamp_locatesCorrectClipAndOffset() {
        val clip1 = VideoClip(id = "1", name = "Clip 1", uri = "uri1", sourceDurationMs = 5000L, startOffsetMs = 0L, endOffsetMs = 5000L)
        val clip2 = VideoClip(id = "2", name = "Clip 2", uri = "uri2", sourceDurationMs = 5000L, startOffsetMs = 500L, endOffsetMs = 4500L) // 4000ms
        val clips = listOf(clip1, clip2)

        // At 2000ms, should be clip1 at offset 2000
        val res1 = timelineManager.findClipAtTimestamp(clips, 2000L)
        assertNotNull(res1)
        assertEquals("1", res1?.first?.id)
        assertEquals(2000L, res1?.second)

        // At 6000ms, should be clip2 at offset (6000 - 5000 + 500) = 1500
        val res2 = timelineManager.findClipAtTimestamp(clips, 6000L)
        assertNotNull(res2)
        assertEquals("2", res2?.first?.id)
        assertEquals(1500L, res2?.second)
    }

    @Test
    fun trimClip_adjustsInAndOutOffsetsCorrectly() {
        val clip = VideoClip(name = "Clip", uri = "uri", sourceDurationMs = 10000L, startOffsetMs = 0L, endOffsetMs = 10000L)
        val trimmed = timelineManager.trimClip(clip, 2000L, 8000L)

        assertEquals(2000L, trimmed.startOffsetMs)
        assertEquals(8000L, trimmed.endOffsetMs)
        assertEquals(6000L, trimmed.effectiveDurationMs)
    }

    @Test
    fun splitClipAtOffset_splitsIntoTwoClips() {
        val clip = VideoClip(name = "Clip", uri = "uri", sourceDurationMs = 10000L, startOffsetMs = 1000L, endOffsetMs = 9000L)
        // Duration is 8000ms. Split at 3000ms from start (absolute 4000ms)
        val result = timelineManager.splitClipAtOffset(clip, 3000L)

        assertNotNull(result)
        val (first, second) = result!!
        assertEquals(1000L, first.startOffsetMs)
        assertEquals(4000L, first.endOffsetMs)

        assertEquals(4000L, second.startOffsetMs)
        assertEquals(9000L, second.endOffsetMs)
    }

    @Test
    fun splitClipAtOffset_failsNearBoundaries() {
        val clip = VideoClip(name = "Clip", uri = "uri", sourceDurationMs = 10000L, startOffsetMs = 0L, endOffsetMs = 5000L)
        val result = timelineManager.splitClipAtOffset(clip, 50L) // too close to start
        assertNull(result)
    }

    @Test
    fun deleteClip_removesClipAndUpdatesIndices() {
        val clip1 = VideoClip(id = "1", name = "Clip 1", uri = "uri1", sourceDurationMs = 5000L, orderIndex = 0)
        val clip2 = VideoClip(id = "2", name = "Clip 2", uri = "uri2", sourceDurationMs = 5000L, orderIndex = 1)
        val clip3 = VideoClip(id = "3", name = "Clip 3", uri = "uri3", sourceDurationMs = 5000L, orderIndex = 2)

        val remaining = timelineManager.deleteClip(listOf(clip1, clip2, clip3), "2")
        assertEquals(2, remaining.size)
        assertEquals("1", remaining[0].id)
        assertEquals(0, remaining[0].orderIndex)
        assertEquals("3", remaining[1].id)
        assertEquals(1, remaining[1].orderIndex)
    }

    @Test
    fun reorderClips_movesClipCorrectly() {
        val clip1 = VideoClip(id = "1", name = "Clip 1", uri = "uri1", sourceDurationMs = 5000L, orderIndex = 0)
        val clip2 = VideoClip(id = "2", name = "Clip 2", uri = "uri2", sourceDurationMs = 5000L, orderIndex = 1)
        val clip3 = VideoClip(id = "3", name = "Clip 3", uri = "uri3", sourceDurationMs = 5000L, orderIndex = 2)

        val reordered = timelineManager.reorderClips(listOf(clip1, clip2, clip3), 0, 2)
        assertEquals("2", reordered[0].id)
        assertEquals("3", reordered[1].id)
        assertEquals("1", reordered[2].id)
        assertEquals(0, reordered[0].orderIndex)
        assertEquals(1, reordered[1].orderIndex)
        assertEquals(2, reordered[2].orderIndex)
    }
}
