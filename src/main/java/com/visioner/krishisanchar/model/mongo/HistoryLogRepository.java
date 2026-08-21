package com.visioner.krishisanchar.model.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoryLogRepository extends MongoRepository<HistoryLog,String> {
    List<HistoryLog> findByFarmerIdOrderByCreatedAtDesc(String farmerId);

}
