package com.visioner.krishisanchar;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class KrishisancharApplication {

	public static void main(String[] args) {
		SpringApplication.run(KrishisancharApplication.class, args);
	}
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder()
                .requestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory());
    }
}
