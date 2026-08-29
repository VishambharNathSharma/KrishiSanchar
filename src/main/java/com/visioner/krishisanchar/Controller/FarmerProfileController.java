package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.Entity.FarmerProfile;
import com.visioner.krishisanchar.Repository.FarmerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@CrossOrigin(origins = "*")
public class FarmerProfileController {

    private final FarmerProfileRepository profileRepository;

    public FarmerProfileController(FarmerProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    // Removed the @PathVariable. The backend now trusts the JWT, not the URL.
    @GetMapping
    public ResponseEntity<ProfileDto> getProfile(Authentication authentication) {
        String farmerId = authentication.getName(); // Securely extracted from token

        return profileRepository.findByFarmerId(farmerId)
                .map(profile -> ResponseEntity.ok(new ProfileDto(
                        profile.getFarmerName(),
                        profile.getFarmerId(),
                        profile.getLocation(),
                        profile.getTotalLandArea(),
                        profile.getSoilType(),
                        profile.getPrimaryCrop(),
                        profile.getIrrigationSource(),
                        profile.getPhotoUrl()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // This DTO ensures the password and internal DB ID are never sent to the browser
    public record ProfileDto(
            String farmerName,
            String farmerId,
            String location,
            Double totalLandArea,
            String soilType,
            String primaryCrop,
            String irrigationSource,
            String photoUrl
    ) {}
}