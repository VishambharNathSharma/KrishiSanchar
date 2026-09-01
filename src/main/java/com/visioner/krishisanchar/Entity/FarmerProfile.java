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

    @Column(nullable = false, unique = true)
    private String userId; // Matches 'Email or Phone Number' from your signup form

    @Column(nullable = false)
    private String password;

    private Boolean isRegistered;

    private Boolean aadhaarLink;

    @Column(name = "photo_url")
    private String photoUrl;

    private String location;

    private Double totalLandArea;

    private String soilType;

    private String primaryCrop;

    private String irrigationSource;

    private String registeredSince;
}
