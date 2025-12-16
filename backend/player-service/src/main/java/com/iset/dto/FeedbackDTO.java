package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long playerId;
    private Long giverId;
    private String giverEmail;
    private String content;
    private int rating;
    private LocalDateTime createdAt;
}
