package com.agriconnect.controller;

import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.NotificationResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.service.NotificationService;
import com.agriconnect.util.ResponseFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> listMine(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Notifications fetched", notificationService.listMine(pageable)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(ResponseFactory.success("Notification marked as read", notificationService.markRead(notificationId)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ResponseFactory.success("All notifications marked as read", null));
    }
}
