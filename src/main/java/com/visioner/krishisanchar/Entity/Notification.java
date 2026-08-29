package com.visioner.krishisanchar.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmerId;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String iconType;

    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
