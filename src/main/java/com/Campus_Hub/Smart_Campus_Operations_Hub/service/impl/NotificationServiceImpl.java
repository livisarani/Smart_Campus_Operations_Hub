package com.Campus_Hub.Smart_Campus_Operations_Hub.service.impl;

import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.response.NotificationResponseDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.exception.ResourceNotFoundException;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.Notification;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.User;
import com.Campus_Hub.Smart_Campus_Operations_Hub.repository.NotificationRepository;
import com.Campus_Hub.Smart_Campus_Operations_Hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getNotifications(User recipient, Boolean unreadOnly, Pageable pageable) {
        Page<Notification> page = Boolean.TRUE.equals(unreadOnly)
                ? notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(recipient, pageable)
                : notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(User recipient) {
        return notificationRepository.countByRecipientAndReadFalse(recipient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(User recipient) {
        return notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(recipient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications(User recipient) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, User recipient) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User recipient) {
        List<Notification> notifications = notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(recipient);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void deleteReadNotifications(User recipient) {
        notificationRepository.deleteByRecipientAndReadTrue(recipient);
    }

    @Override
    @Transactional
    public Notification createNotification(User recipient, String message, Long relatedTicketId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .relatedTicketId(relatedTicketId)
                .read(false)
                .build();

        return notificationRepository.save(notification);
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .title(buildTitle(notification))
                .message(notification.getMessage())
                .type(buildType(notification))
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .relatedTicketId(notification.getRelatedTicketId())
                .build();
    }

    private String buildTitle(Notification notification) {
        if (notification.getRelatedTicketId() != null) {
            return "Ticket #" + notification.getRelatedTicketId();
        }
        return "System Notification";
    }

    private String buildType(Notification notification) {
        String message = notification.getMessage() == null ? "" : notification.getMessage().toLowerCase();
        if (message.contains("assigned")) {
            return "TICKET_ASSIGNED";
        }
        if (message.contains("resolved")) {
            return "TICKET_RESOLVED";
        }
        if (message.contains("comment")) {
            return "TICKET_COMMENT_ADDED";
        }
        if (message.contains("status")) {
            return "TICKET_STATUS_CHANGED";
        }
        return "SYSTEM_ANNOUNCEMENT";
    }
}