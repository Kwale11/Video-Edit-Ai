package org.example.springbootserver.transcription.service;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Stream;

import org.example.springbootserver.exception.MediaProcessingException;
import org.example.springbootserver.transcription.dto.TranscriptionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TranscriptionService {

    private static final long OPENAI_FILE_LIMIT_BYTES =
            25L * 1024L * 1024L;

    private final FfmpegService ffmpegService;

    private final OpenAiTranscriptionClient
            transcriptionClient;

    private final TranscriptionMapper
            transcriptionMapper;

    public TranscriptionService(
            FfmpegService ffmpegService,
            OpenAiTranscriptionClient transcriptionClient,
            TranscriptionMapper transcriptionMapper
    ) {
        this.ffmpegService = ffmpegService;
        this.transcriptionClient = transcriptionClient;
        this.transcriptionMapper = transcriptionMapper;
    }

    public TranscriptionResponse transcribe(
            MultipartFile videoFile,
            String language
    ) {
        validateVideo(videoFile);

        Path workDirectory = null;

        try {
            workDirectory = Files.createTempDirectory(
                    "vrew-transcription-"
            );

            Path savedVideo =
                    workDirectory.resolve("input-video");

            videoFile.transferTo(savedVideo);

            long durationMs =
                    ffmpegService.probeDurationMs(
                            savedVideo
                    );

            Path audioFile =
                    ffmpegService.extractAudio(
                            savedVideo,
                            workDirectory
                    );

            validateAudioSize(audioFile);

            OpenAiTranscriptionClient.TranscriptionResult
                    sttResult =
                    transcriptionClient.transcribe(
                            audioFile,
                            language
                    );

            String assetId =
                    UUID.randomUUID().toString();

            return transcriptionMapper.map(
                    assetId,
                    durationMs,
                    language,
                    sttResult
            );
        } catch (IOException exception) {
            throw new MediaProcessingException(
                    "업로드 파일을 처리하지 못했습니다.",
                    exception
            );
        } finally {
            deleteDirectoryQuietly(workDirectory);
        }
    }

    private void validateVideo(
            MultipartFile videoFile
    ) {
        if (
                videoFile == null
                        || videoFile.isEmpty()
        ) {
            throw new MediaProcessingException(
                    "영상 파일이 비어 있습니다."
            );
        }

        String contentType =
                videoFile.getContentType();

        if (
                contentType == null
                        || !contentType.startsWith("video/")
        ) {
            throw new MediaProcessingException(
                    "지원하지 않는 파일입니다. "
                            + "영상 파일을 업로드하세요."
            );
        }
    }

    private void validateAudioSize(Path audioFile)
            throws IOException {
        long size = Files.size(audioFile);

        if (size > OPENAI_FILE_LIMIT_BYTES) {
            throw new MediaProcessingException(
                    "추출한 오디오가 25MB를 초과했습니다. "
                            + "긴 영상 분할 처리가 필요합니다."
            );
        }
    }

    private void deleteDirectoryQuietly(
            Path directory
    ) {
        if (
                directory == null
                        || !Files.exists(directory)
        ) {
            return;
        }

        try (
                Stream<Path> paths =
                        Files.walk(directory)
        ) {
            paths.sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // 임시 파일 정리 실패는 무시합니다.
                        }
                    });
        } catch (IOException ignored) {
            // 임시 디렉터리 정리 실패는 무시합니다.
        }
    }
}