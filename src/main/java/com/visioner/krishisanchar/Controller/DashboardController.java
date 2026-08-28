package com.visioner.krishisanchar.Controller;



import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.Security.JwtAuthenticationFilter;
import com.visioner.krishisanchar.Service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    private final JwtAuthenticationFilter jwtAuthFilter;


    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService,JwtAuthenticationFilter jwtAuthFilter) {
        this.dashboardService = dashboardService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            Authentication authentication) {

        String farmerId = authentication.getName();
        DashboardSummaryResponse response = dashboardService.generateDashBoard(farmerId);
        return ResponseEntity.ok(response);
    }
}