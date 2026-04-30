package com.Campus_Hub.Smart_Campus_Operations_Hub.service;

import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.response.NotificationResponseDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.Notification;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    Page<NotificationResponseDTO> getNotifications(User recipient, Boolean unreadOnly, Pageable pageable);

    long countUnread(User recipient);

    List<Notification> getUnreadNotifications(User recipient);

    List<Notification> getAllNotifications(User recipient);

    Notification markAsRead(Long notificationId, User recipient);

    void markAllAsRead(User recipient);

    void deleteReadNotifications(User recipient);

    Notification createNotification(User recipient, String message, Long relatedTicketId);
}