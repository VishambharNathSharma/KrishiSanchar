package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.Entity.FarmerProfile;
import com.visioner.krishisanchar.Repository.FarmerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/v1/profile")
@CrossOrigin(origins = "*")
public class FarmerProfileController {
    private final FarmerProfileRepository profileRepository;


    public FarmerProfileController(FarmerProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }
    @GetMapping("/{farmerId}")
    public ResponseEntity<FarmerProfile> getProfile(@PathVariable String farmerId) {
        return profileRepository.findByFarmerId(farmerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // Real dynamic behavior: 404 if missing
    }

}
