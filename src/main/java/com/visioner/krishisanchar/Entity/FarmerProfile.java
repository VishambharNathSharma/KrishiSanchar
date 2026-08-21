package com.visioner.krishisanchar.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.redis.connection.stream.StreamInfo;

@Entity
@Table(name = "farmer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmerName;

    @Column(nullable = false,unique = true)
    private String farmerId;

    private boolean isRegistered;

    private boolean aadhaarLink;

    private String location;

    private Double totalLandArea;

    private String soilType;

    private String primaryCrop;

    private String irrigationSource;

    private String registeredSince;
}
