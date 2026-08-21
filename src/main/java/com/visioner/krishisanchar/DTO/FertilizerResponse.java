package com.visioner.krishisanchar.DTO;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FertilizerResponse {
    private String recommendedApplication;
    private String Urea;
    private String Mop;
    private String Dap;
    private List<String> applicationSchedule;
}
