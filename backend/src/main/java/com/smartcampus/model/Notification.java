package com.smartcampus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    // The user this notification belongs to
    private String userId;

    private String message;

    private NotificationType type;

    // ID of the related booking or ticket
    private String entityId;

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        BOOKING_CANCELLED,
        TICKET_UPDATED,
        NEW_COMMENT
    }
}