package com.iset.client;

import com.iset.dto.FieldDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign Client for Field Service
 * US10: Reserve field for event
 */
@FeignClient(name = "field-service")
public interface FieldServiceClient {

    @GetMapping("/fields/{id}")
    FieldDTO getFieldById(@PathVariable Long id);

    @GetMapping("/fields/health")
    String health();
}

