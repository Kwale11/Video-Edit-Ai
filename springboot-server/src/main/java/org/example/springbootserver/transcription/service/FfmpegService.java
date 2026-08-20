package org.example.springbootserver.transcription.service;


import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.example.springbootserver.exception.MediaProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FfmpegService {

    private final String ffmpegPath;
    private final String ffprobePath;

    public FfmpegService(
            @Value("${app.ffmpeg-path}")
            String ffmpegPath,

            @Value("${app.ffprobe-path}")
            String ffprobePath
    ) {
        this.ffmpegPath = ffmpegPath;
        this.ffprobePath = ffprobePath;
    }

    public Path extractAudio(
            Path videoFile,
            Path outputDirectory
    ) {
        Path outputFile = outputDirectory.resolve("audio.mp3");
        //resolve()는 경로 뒤에 다른 경로를 붙이는 메서드.
        runCommand(List.of(
                ffmpegPath,
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                videoFile.toAbsolutePath().toString(),

                // 영상 스트림은 제외합니다.
                "-vn",

                // STT 용량과 처리량을 줄이기 위한 설정입니다.
                "-ac",
                "1",
                "-ar",
                "16000",
                "-b:a",
                "64k",

                outputFile.toAbsolutePath().toString()
        ));

        return outputFile;
    }

    public long probeDurationMs(Path videoFile) {
        String output = runCommand(List.of(
                ffprobePath,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                videoFile.toAbsolutePath().toString()
        ));

        try {
            double durationSeconds =
                    Double.parseDouble(output.trim());

            return Math.round(durationSeconds * 1000);
        } catch (NumberFormatException exception) {
            throw new MediaProcessingException(
                    "영상 길이를 분석하지 못했습니다.",
                    exception
            );
        }
    }

    private String runCommand(List<String> command) {
        try {
            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true)
                    .start();

            CompletableFuture<String> outputFuture =
                    CompletableFuture.supplyAsync(() -> {
                        try {
                            return new String(
                                    process
                                            .getInputStream()
                                            .readAllBytes(),
                                    StandardCharsets.UTF_8
                            );
                        } catch (IOException exception) {
                            return "";
                        }
                    });

            boolean finished = process.waitFor(
                    10,
                    TimeUnit.MINUTES
            );

            if (!finished) {
                process.destroyForcibly();

                throw new MediaProcessingException(
                        "영상 처리 제한 시간을 초과했습니다."
                );
            }

            String output = outputFuture.join();

            if (process.exitValue() != 0) {
                throw new MediaProcessingException(
                        "FFmpeg 실행에 실패했습니다: "
                                + output
                );
            }

            return output;
        } catch (IOException exception) {
            throw new MediaProcessingException(
                    "FFmpeg를 실행할 수 없습니다. "
                            + "설치와 PATH를 확인하세요.",
                    exception
            );
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new MediaProcessingException(
                    "영상 처리 작업이 중단되었습니다.",
                    exception
            );
        }
    }
}