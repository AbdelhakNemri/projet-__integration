package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDTO {
    private Long id;
    private String keycloakId;
    private String email;
    private String nom;
    private String prenom;
    private String poste;
    private String photo;
    private String tel;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean enabled;
}
