package org.example.springbootserver.transcription.api;


import org.example.springbootserver.transcription.dto.TranscriptionResponse;
import org.example.springbootserver.transcription.service.TranscriptionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/transcriptions")
public class TranscriptionController {

    private final TranscriptionService transcriptionService;

    public TranscriptionController(
            TranscriptionService transcriptionService
    ) {
        this.transcriptionService =
                transcriptionService;
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public TranscriptionResponse transcribe(
            @RequestPart("file")
            MultipartFile file,

            @RequestParam(
                    name = "language",
                    defaultValue = "ko"
            )
            String language
    ) {
        return transcriptionService.transcribe(
                file,
                language
        );
    }
}
