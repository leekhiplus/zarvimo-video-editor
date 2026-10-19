package com.zafronix.videoeditor.domain.timeline

import com.zafronix.videoeditor.data.model.VideoClip
import java.util.UUID

class TimelineManager {

    /**
     * Calculates the total composition duration in milliseconds.
     */
    fun calculateTotalDuration(clips: List<VideoClip>): Long {
        return clips.sumOf { it.effectiveDurationMs }
    }

    /**
     * Resolves which clip and what internal clip offset corresponds to a global timeline timestamp.
     */
    fun findClipAtTimestamp(clips: List<VideoClip>, timelineMs: Long): Pair<VideoClip, Long>? {
        if (clips.isEmpty()) return null
        val clampedTime = timelineMs.coerceIn(0L, calculateTotalDuration(clips))

        var accumulated = 0L
        for (clip in clips) {
            val clipDuration = clip.effectiveDurationMs
            if (clampedTime >= accumulated && clampedTime < accumulated + clipDuration) {
                val offsetInsideClip = (clampedTime - accumulated) + clip.startOffsetMs
                return Pair(clip, offsetInsideClip)
            }
            accumulated += clipDuration
        }
        val lastClip = clips.last()
        return Pair(lastClip, lastClip.endOffsetMs)
    }

    /**
     * Trims a clip's in-point and out-point with boundary validation.
     */
    fun trimClip(
        clip: VideoClip,
        newStartOffsetMs: Long,
        newEndOffsetMs: Long,
        minDurationMs: Long = 100L
    ): VideoClip {
        val validStart = newStartOffsetMs.coerceIn(0L, clip.sourceDurationMs - minDurationMs)
        val validEnd = newEndOffsetMs.coerceIn(validStart + minDurationMs, clip.sourceDurationMs)
        return clip.copy(
            startOffsetMs = validStart,
            endOffsetMs = validEnd
        )
    }

    /**
     * Splits a clip at a relative offset within the clip (measured from clip.startOffsetMs).
     * Returns a pair of [FirstPart, SecondPart], or null if the split point is too close to boundaries.
     */
    fun splitClipAtOffset(
        clip: VideoClip,
        offsetMsFromStart: Long,
        minSliceMs: Long = 200L
    ): Pair<VideoClip, VideoClip>? {
        val splitAbsoluteMs = clip.startOffsetMs + offsetMsFromStart
        if (splitAbsoluteMs <= clip.startOffsetMs + minSliceMs ||
            splitAbsoluteMs >= clip.endOffsetMs - minSliceMs
        ) {
            return null
        }

        val firstClip = clip.copy(
            id = UUID.randomUUID().toString(),
            endOffsetMs = splitAbsoluteMs
        )
        val secondClip = clip.copy(
            id = UUID.randomUUID().toString(),
            startOffsetMs = splitAbsoluteMs,
            orderIndex = clip.orderIndex + 1
        )
        return Pair(firstClip, secondClip)
    }

    /**
     * Reorders a clip by moving it from fromIndex to toIndex.
     */
    fun reorderClips(clips: List<VideoClip>, fromIndex: Int, toIndex: Int): List<VideoClip> {
        if (fromIndex !in clips.indices || toIndex !in clips.indices || fromIndex == toIndex) {
            return clips
        }
        val mutable = clips.toMutableList()
        val item = mutable.removeAt(fromIndex)
        mutable.add(toIndex, item)
        return mutable.mapIndexed { index, clip -> clip.copy(orderIndex = index) }
    }

    /**
     * Removes a clip and updates indices.
     */
    fun deleteClip(clips: List<VideoClip>, clipId: String): List<VideoClip> {
        return clips.filterNot { it.id == clipId }
            .mapIndexed { index, clip -> clip.copy(orderIndex = index) }
    }

    /**
     * Appends a new clip to the end of the timeline.
     */
    fun addClip(clips: List<VideoClip>, newClip: VideoClip): List<VideoClip> {
        val clipWithIndex = newClip.copy(orderIndex = clips.size)
        return clips + clipWithIndex
    }

    /**
     * Duplicates a clip and inserts it immediately after.
     */
    fun duplicateClip(clips: List<VideoClip>, clipId: String): List<VideoClip> {
        val targetIndex = clips.indexOfFirst { it.id == clipId }
        if (targetIndex == -1) return clips
        val original = clips[targetIndex]
        val duplicate = original.copy(
            id = UUID.randomUUID().toString(),
            name = "${original.name} (Copy)"
        )
        val mutable = clips.toMutableList()
        mutable.add(targetIndex + 1, duplicate)
        return mutable.mapIndexed { index, clip -> clip.copy(orderIndex = index) }
    }
}
