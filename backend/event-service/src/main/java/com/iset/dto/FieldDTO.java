package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Field DTO for communication with field-service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldDTO {
    private Long id;
    private String ownerKeycloakId;
    private String name;
    private String description;
    private String location;
    private String city;
    private String postalCode;
    private Integer capacity;
    private String type;
    private Double pricePerHour;
    private String facilities;
    private String photoUrl;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

