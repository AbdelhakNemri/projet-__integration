package com.iset.config;

import feign.form.spring.SpringFormEncoder;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public SpringFormEncoder feignFormEncoder(HttpMessageConverters httpMessageConverters) {
        return new SpringFormEncoder(new SpringEncoder(() -> httpMessageConverters));
    }
}
