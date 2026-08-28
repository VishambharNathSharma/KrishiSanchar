package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.Entity.FarmerProfile;
import com.visioner.krishisanchar.Repository.FarmerProfileRepository;
import com.visioner.krishisanchar.Service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final FarmerProfileRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(FarmerProfileRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService){
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody FarmerProfile user) {
        if (repository.findByFarmerId(user.getFarmerId()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setFarmerId("KS-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        repository.save(user);

        String token = jwtService.generateToken(user.getFarmerId());

        return ResponseEntity.ok(Map.of("token", token, "farmerId", user.getFarmerId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> credentials) {
        Optional<FarmerProfile> userOpt = repository.findByUserId(credentials.get("userId"));

        if (userOpt.isPresent()) {
            FarmerProfile user = userOpt.get();

            if (passwordEncoder.matches(credentials.get("password"), user.getPassword())) {
                String token = jwtService.generateToken(user.getFarmerId());
                return ResponseEntity.ok(Map.of("token", token, "farmerId", user.getFarmerId()));
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
