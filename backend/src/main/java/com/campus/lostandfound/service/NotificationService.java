package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.notification.NotificationDto;
import com.campus.lostandfound.model.Notification;
import com.campus.lostandfound.model.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User recipient, String title, String message, Notification.NotificationType type, Long referenceId);
    List<NotificationDto> getMyNotifications();
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
}
