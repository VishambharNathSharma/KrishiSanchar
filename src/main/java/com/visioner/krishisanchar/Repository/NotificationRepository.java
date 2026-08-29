package com.visioner.krishisanchar.Repository;

import com.visioner.krishisanchar.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification,Long> {

    List<Notification> findTop5ByFarmerIdOrderByCreatedAtDesc(String farmerId);

    long countByFarmerIdAndIsReadFalse(String farmerId);

}
