package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class MlBridgeService {
    private final RestClient restClient;
    
    public MlBridgeService(@Value("${ml.service.url}") String mlUrl) {
        this.restClient = RestClient.builder().baseUrl(mlUrl).build();
    }

    public CropPredictionResponse predictCrop(CropInput input){
        return restClient.post()
                .uri("/predict/crop")
                .contentType(MediaType.APPLICATION_JSON)
                .body(input)
                .retrieve()
                .body(CropPredictionResponse.class);
    }

    public FertilizerPredictionResponse predictFertilizer(FertilizerInputDto input){
        return restClient.post()
                .uri("predict/fertilizer")
                .contentType(MediaType.APPLICATION_JSON)
                .body(input)
                .retrieve()
                .body(FertilizerPredictionResponse.class);
    }

    public YieldPredictionResponse predictYield(YieldInputDto input){
        return restClient.post()
                .uri("predict/yield")
                .contentType(MediaType.APPLICATION_JSON)
                .body(input)
                .retrieve()
                .body(YieldPredictionResponse.class);
    }

    public DiseasePredictionResponse predictDisease(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
        @Override
                public String getFilename(){
            return file.getOriginalFilename();
        }
    });
        return restClient.post()
                .uri("/predict/disease")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(DiseasePredictionResponse.class);
    }

}
