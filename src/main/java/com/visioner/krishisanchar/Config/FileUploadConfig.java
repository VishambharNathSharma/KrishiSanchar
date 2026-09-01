package com.visioner.krishisanchar.Config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

@Configuration
public class FileUploadConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();

        // Set maximum file size to 15MB
        factory.setMaxFileSize(DataSize.ofMegabytes(15));

        // Set maximum total request size to 15MB
        factory.setMaxRequestSize(DataSize.ofMegabytes(15));

        return factory.createMultipartConfig();
    }
}