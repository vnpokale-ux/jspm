package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.notification.NotificationDto;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.model.Notification;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.NotificationRepository;
import com.campus.lostandfound.service.NotificationService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @Override
    @Transactional
    public void createNotification(User recipient, String title, String message, Notification.NotificationType type, Long referenceId) {
        if (recipient == null) return;

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
        log.info("Notification created for User #{}: [{}] {}", recipient.getId(), type, title);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
        return list.stream().map(NotificationDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        notificationRepository.markAllAsReadByRecipient(currentUser);
    }
}
