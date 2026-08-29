package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.Entity.Notification;
import com.visioner.krishisanchar.Repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository){
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getRecentNotifications(Authentication authentication){
        String farmerId = authentication.getName();

        List<Notification> alerts = notificationRepository.findTop5ByFarmerIdOrderByCreatedAtDesc(farmerId);

        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
        return ResponseEntity.ok().build();
    }
}
