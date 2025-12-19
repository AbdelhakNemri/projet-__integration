package com.iset.dto;

import lombok.Data;
import java.util.List;

@Data
public class WeatherResponse {
    private double latitude;
    private double longitude;
    private CurrentWeather current_weather;

    @Data
    public static class CurrentWeather {
        private double temperature;
        private double windspeed;
        private int weathercode;
        private String time;
    }
}
