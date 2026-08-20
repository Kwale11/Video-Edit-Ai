package org.example.springbootserver.transcription.dto;


import java.util.List;

public record TranscriptionResponse(
        String assetId,
        long durationMs,
        List<TranscriptSegmentDto> transcript,
        List<SubtitleCueDto> subtitles,
        List<TrackDto> tracks
) {

    public record TranscriptSegmentDto(
            String id,
            String assetId,
            long startMs,
            long endMs,
            String text,
            List<TranscriptWordDto> words
    ) {
    }

    public record TranscriptWordDto(
            String id,
            String text,
            long startMs,
            long endMs,
            Double confidence
    ) {
    }

    public record SubtitleCueDto(
            String id,
            String transcriptSegmentId,
            long startMs,
            long endMs,
            String text,
            String language,
            SubtitleStyleDto style
    ) {
    }

    public record SubtitleStyleDto(
            String fontFamily,
            int fontSize,
            String fontColor,
            String backgroundColor,
            String position,
            int fontWeight
    ) {
    }

    public record TrackDto(
            String id,
            String type,
            String name,
            List<ClipDto> clips,
            boolean locked,
            boolean hidden
    ) {
    }

    public record ClipDto(
            String id,
            String assetId,
            String transcriptSegmentId,
            String label,
            long sourceStartMs,
            long sourceEndMs,
            long timelineStartMs,
            long timelineEndMs,
            boolean muted,
            boolean deleted
    ) {
    }
}