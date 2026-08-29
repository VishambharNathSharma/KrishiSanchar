package com.visioner.krishisanchar.model.mongo;

import org.springframework.data.annotation.Id; // Changed from jakarta.persistence.Id
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "history_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryLog {

    @Id
    private String id;
    private String farmerId;
    private String activityType;
    private String inputParameters;
    private String resultAction;
    private LocalDateTime createdAt;
}