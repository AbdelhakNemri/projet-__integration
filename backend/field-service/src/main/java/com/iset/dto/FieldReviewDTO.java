package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldReviewDTO {

    private Long id;
    private Long fieldId;
    private String reviewerKeycloakId;
    private String reviewerEmail;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
}
