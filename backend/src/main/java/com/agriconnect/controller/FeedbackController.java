package com.agriconnect.controller;

import com.agriconnect.dto.request.FeedbackRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.FeedbackResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.service.FeedbackService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(@Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Feedback submitted", feedbackService.submit(request)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<FeedbackResponse>>> listMine(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("My feedback fetched", feedbackService.listMine(pageable)));
    }
}
