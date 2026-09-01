package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.apache.commons.lang3.StringUtils.capitalize;

@Service
public class MlBridgeService {
    private final RestClient restClient;
    private FertilizerAdviceService fertilizerAdviceService;
    private WeatherService weatherService;
    private final CropAdviceService cropAdviceService;
    public MlBridgeService(@Value("${ml.service.url:http://localhost:8000}") String mlUrl,FertilizerAdviceService fertilizerAdviceService,CropAdviceService cropAdviceService) {
        this.restClient = RestClient.builder()
                .baseUrl(mlUrl)
                .requestFactory(new SimpleClientHttpRequestFactory())
                .build();
        this.fertilizerAdviceService = fertilizerAdviceService;
        this.cropAdviceService = cropAdviceService;
    }

    public CropPredictionResponse predictCrop(CropInput input, Double areaAcres, String location){
        CropPredictionResponse mlResponse = restClient.post()
                .uri("/predict/crop")
                .contentType(MediaType.APPLICATION_JSON)
                .body(input)
                .retrieve()
                .body(CropPredictionResponse.class);

        if (mlResponse == null) {
            throw new RuntimeException("No response received from crop ML service");
        }

        CropAdviceResponse advice = cropAdviceService.generateAdvice(mlResponse.recommendedCrop(), areaAcres, location);

        return new CropPredictionResponse(
                mlResponse.recommendedCrop(),
                mlResponse.confidence(),
                advice.estimatedProfit(),
                advice.growingTips()
        );
    }

    public FertilizerPredictionResponse predictFertilizer(
            FertilizerInputDto input) {

        FertilizerPredictionResponse mlResponse =
                restClient.post()
                        .uri("/Fertilizer_recommendation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(input)
                        .retrieve()
                        .body(FertilizerPredictionResponse.class);

        if (mlResponse == null) {
            throw new RuntimeException(
                    "No response received from fertilizer ML service"
            );
        }

        FertilizerAdviceResponse advice =
                fertilizerAdviceService.generateAdvice(
                        input.crop(),
                        input.soilType(),
                        mlResponse.recommendedFertilizer()
                );

        return new FertilizerPredictionResponse(
                mlResponse.recommendedFertilizer(),
                advice.explanation(),
                advice.application(),
                advice.bestTime(),
                advice.precautions()
        );
    }
    public YieldPredictionResponse predictYield(YieldInputDto input){
        return restClient.post()
                .uri("/predict/yield")
                .contentType(MediaType.APPLICATION_JSON)
                .body(input)
                .retrieve()
                .body(YieldPredictionResponse.class);
    }

    public DiseasePredictionResponse predictDisease(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        return restClient.post()
                .uri("/predict/disease")
                .contentType(MediaType.MULTIPART_FORM_DATA)   // <-- fix
                .body(body)
                .retrieve()
                .body(DiseasePredictionResponse.class);
    }

}
