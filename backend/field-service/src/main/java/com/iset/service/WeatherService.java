package com.iset.service;

import com.iset.client.WeatherClient;
import com.iset.dto.WeatherResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    private final WeatherClient weatherClient;

    @CircuitBreaker(name = "weatherService", fallbackMethod = "getWeatherFallback")
    public WeatherResponse getWeatherData(double lat, double lon) {
        return weatherClient.getWeather(lat, lon, true);
    }

    public WeatherResponse getWeatherFallback(double lat, double lon, Throwable t) {
        log.error("Error fetching weather data for lat: {}, lon: {}. Fallback triggered. Error: {}", lat, lon,
                t.getMessage());
        WeatherResponse fallbackResponse = new WeatherResponse();
        fallbackResponse.setLatitude(lat);
        fallbackResponse.setLongitude(lon);

        WeatherResponse.CurrentWeather errorWeather = new WeatherResponse.CurrentWeather();
        errorWeather.setTemperature(0.0);
        errorWeather.setWindspeed(0.0);
        errorWeather.setWeathercode(-1); // Custom code for unavailable weather
        errorWeather.setTime("N/A");

        fallbackResponse.setCurrent_weather(errorWeather);
        return fallbackResponse;
    }
}
