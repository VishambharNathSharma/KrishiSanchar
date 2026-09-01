package com.visioner.krishisanchar.DTO;

import java.util.List;

public record CropAdviceResponse(
        String estimatedProfit,
        List<String> growingTips
) {}