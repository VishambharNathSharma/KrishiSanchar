package com.visioner.krishisanchar.Repository;

import com.visioner.krishisanchar.Entity.FarmerProfile;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, Long> {
    Optional<FarmerProfile> findByFarmerId(String farmerId);
    Optional<FarmerProfile> findByUserId(String userId);
}
