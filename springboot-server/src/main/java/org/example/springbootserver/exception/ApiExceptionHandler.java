package org.example.springbootserver.exception;


import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MediaProcessingException.class)
    public ResponseEntity<ApiError> handleMediaProcessing(
            MediaProcessingException exception
    ) {
        return ResponseEntity.badRequest().body(
                new ApiError(
                        Instant.now(),
                        400,
                        exception.getMessage()
                )
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleUploadSize(
            MaxUploadSizeExceededException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(
                        new ApiError(
                                Instant.now(),
                                413,
                                "업로드 가능한 영상 크기를 초과했습니다."
                        )
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(
            Exception exception
    ) {
        exception.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        new ApiError(
                                Instant.now(),
                                500,
                                "영상 처리 중 서버 오류가 발생했습니다."
                        )
                );
    }

    public record ApiError(
            Instant timestamp,
            int status,
            String message
    ) {
    }
}