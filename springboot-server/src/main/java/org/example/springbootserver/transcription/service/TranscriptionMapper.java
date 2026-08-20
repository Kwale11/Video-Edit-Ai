package org.example.springbootserver.transcription.service;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.example.springbootserver.transcription.dto.TranscriptionResponse;
import org.springframework.stereotype.Component;

@Component
public class TranscriptionMapper {

    public TranscriptionResponse map(
            String assetId,
            long durationMs,
            String language,
            OpenAiTranscriptionClient.TranscriptionResult result
    ) {
        List<TranscriptionResponse.TranscriptSegmentDto>
                transcript = new ArrayList<>();

        List<TranscriptionResponse.SubtitleCueDto>
                subtitles = new ArrayList<>();

        List<TranscriptionResponse.ClipDto>
                clips = new ArrayList<>();

        int sceneNumber = 1;

        for (
                OpenAiTranscriptionClient.WhisperSegment segment
                : result.segments()
        ) {
            String text = segment.text() == null
                    ? ""
                    : segment.text().trim();

            long startMs = toMilliseconds(
                    segment.start()
            );

            long endMs = toMilliseconds(
                    segment.end()
            );

            if (text.isBlank() || endMs <= startMs) {
                continue;
            }

            String segmentId =
                    UUID.randomUUID().toString();

            String subtitleId =
                    UUID.randomUUID().toString();

            String clipId =
                    UUID.randomUUID().toString();

            List<TranscriptionResponse.TranscriptWordDto>
                    words = result.words()
                    .stream()
                    .filter(word ->
                            word.end() > segment.start()
                                    && word.start() < segment.end()
                    )
                    .map(word ->
                            new TranscriptionResponse
                                    .TranscriptWordDto(
                                    UUID.randomUUID().toString(),
                                    word.word().trim(),
                                    toMilliseconds(word.start()),
                                    toMilliseconds(word.end()),

                                    // Whisper 응답에 단어별 confidence가
                                    // 없으므로 null로 둡니다.
                                    null
                            )
                    )
                    .toList();

            transcript.add(
                    new TranscriptionResponse
                            .TranscriptSegmentDto(
                            segmentId,
                            assetId,
                            startMs,
                            endMs,
                            text,
                            words
                    )
            );

            subtitles.add(
                    new TranscriptionResponse.SubtitleCueDto(
                            subtitleId,
                            segmentId,
                            startMs,
                            endMs,
                            text,
                            language,
                            new TranscriptionResponse
                                    .SubtitleStyleDto(
                                    "Noto Sans KR",
                                    44,
                                    "#ffffff",
                                    "#15171d",
                                    "bottom",
                                    700
                            )
                    )
            );

            clips.add(
                    new TranscriptionResponse.ClipDto(
                            clipId,
                            assetId,
                            segmentId,
                            "장면 " + sceneNumber,
                            startMs,
                            endMs,
                            startMs,
                            endMs,
                            false,
                            false
                    )
            );

            sceneNumber++;
        }

        TranscriptionResponse.TrackDto videoTrack =
                new TranscriptionResponse.TrackDto(
                        UUID.randomUUID().toString(),
                        "video",
                        "비디오",
                        clips,
                        false,
                        false
                );

        return new TranscriptionResponse(
                assetId,
                durationMs,
                transcript,
                subtitles,
                List.of(videoTrack)
        );
    }

    private long toMilliseconds(double seconds) {
        return Math.round(seconds * 1000);
    }
}
