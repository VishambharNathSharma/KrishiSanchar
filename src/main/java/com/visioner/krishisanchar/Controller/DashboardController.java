package com.visioner.krishisanchar.Controller;



import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.Service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @RequestHeader(value = "X-Farmer-Id") String farmerId) {

        // Fully dynamic response
        DashboardSummaryResponse response = dashboardService.generateDashBoard(farmerId);
        return ResponseEntity.ok(response);
    }
}