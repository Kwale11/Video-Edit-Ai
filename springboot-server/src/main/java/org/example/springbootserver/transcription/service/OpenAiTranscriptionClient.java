package org.example.springbootserver.transcription.service;


import java.nio.file.Path;
import java.util.List;

import org.example.springbootserver.exception.MediaProcessingException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class OpenAiTranscriptionClient {

    private final RestClient openAiRestClient;

    public OpenAiTranscriptionClient(
            RestClient openAiRestClient
    ) {
        this.openAiRestClient = openAiRestClient;
    }

    public TranscriptionResult transcribe(
            Path audioFile,
            String language
    ) {
        MultipartBodyBuilder body =
                new MultipartBodyBuilder();

        body.part(
                        "file",
                        new FileSystemResource(audioFile)
                )
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        "audio/mpeg"
                );

        body.part("model", "whisper-1");
        body.part("response_format", "verbose_json");

        body.part(
                "timestamp_granularities[]",
                "segment"
        );

        body.part(
                "timestamp_granularities[]",
                "word"
        );

        if (language != null && !language.isBlank()) {
            body.part("language", language);
        }

        try {
            WhisperApiResponse response =
                    openAiRestClient
                            .post()
                            .uri("/v1/audio/transcriptions")
                            .contentType(
                                    MediaType.MULTIPART_FORM_DATA
                            )
                            .body(body.build())
                            .retrieve()
                            .body(WhisperApiResponse.class);

            if (response == null) {
                throw new MediaProcessingException(
                        "STT 서버에서 빈 응답을 반환했습니다."
                );
            }

            return new TranscriptionResult(
                    response.text(),
                    response.language(),
                    response.duration(),
                    response.segments() == null
                            ? List.of()
                            : response.segments(),
                    response.words() == null
                            ? List.of()
                            : response.words()
            );
//        } catch (RestClientResponseException exception) {
//            throw new MediaProcessingException(
//                    "STT 요청에 실패했습니다. 상태 코드: "
//                            + exception.getStatusCode(),
//                    exception
//            );
//        }
        }catch (RestClientResponseException exception) {

            System.out.println(
                    "OpenAI 상태 코드: "
                            + exception.getStatusCode()
            );

            System.out.println(
                    "OpenAI 응답: "
                            + exception.getResponseBodyAsString()
            );

            throw new MediaProcessingException(
                    "STT 요청에 실패했습니다.",
                    exception
            );
        }
    }

    public record TranscriptionResult(
            String text,
            String detectedLanguage,
            Double duration,
            List<WhisperSegment> segments,
            List<WhisperWord> words
    ) {
    }

    public record WhisperApiResponse(
            String text,
            String language,
            Double duration,
            List<WhisperSegment> segments,
            List<WhisperWord> words
    ) {
    }

    public record WhisperSegment(
            Integer id,
            double start,
            double end,
            String text
    ) {
    }

    public record WhisperWord(
            String word,
            double start,
            double end
    ) {
    }
}