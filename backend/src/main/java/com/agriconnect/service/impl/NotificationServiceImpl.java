package com.agriconnect.service.impl;

import com.agriconnect.constant.NotificationStatus;
import com.agriconnect.constant.NotificationType;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.response.NotificationResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.entity.Notification;
import com.agriconnect.entity.User;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.NotificationMapper;
import com.agriconnect.repository.NotificationRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> listMine(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(notificationRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable).map(notificationMapper::toResponse));
    }

    @Override
    public NotificationResponse markRead(Long notificationId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        boolean owner = notification.getUser().getId().equals(currentUser.getId());
        boolean admin = currentUserProvider.hasRole(currentUser, RoleName.ADMIN);
        if (!owner && !admin) {
            throw new UnauthorizedException("You are not allowed to update this notification");
        }
        notification.setStatus(NotificationStatus.READ);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllRead() {
        User currentUser = currentUserProvider.getCurrentUser();
        notificationRepository.findByUserAndStatus(currentUser, NotificationStatus.UNREAD)
                .forEach(notification -> notification.setStatus(NotificationStatus.READ));
    }

    @Override
    public void createSystemNotification(User user, String title, String message, NotificationType type, String relatedEntityType, String relatedEntityId) {
        if (user == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);
        notificationRepository.save(notification);
    }
}
