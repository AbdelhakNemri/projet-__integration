package com.iset.client;

import com.iset.dto.WeatherResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "weather-client", url = "https://api.open-meteo.com/v1")
public interface WeatherClient {

    @GetMapping("/forecast")
    WeatherResponse getWeather(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @RequestParam("current_weather") boolean currentWeather);
}
