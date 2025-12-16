package com.iset.service;

import com.iset.dto.FieldDTO;
import com.iset.entity.Field;
import com.iset.repository.FieldRepository;
import com.iset.repository.FieldReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FieldService {

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private FieldReviewRepository fieldReviewRepository;

    /**
     * Créer un terrain (OWNER only)
     */
    public FieldDTO createField(FieldDTO fieldDTO) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String ownerKeycloakId = jwt.getClaimAsString("sub");

        Field field = new Field();
        field.setOwnerKeycloakId(ownerKeycloakId);
        field.setName(fieldDTO.getName());
        field.setDescription(fieldDTO.getDescription());
        field.setLocation(fieldDTO.getLocation());
        field.setCity(fieldDTO.getCity());
        field.setPostalCode(fieldDTO.getPostalCode());
        field.setCapacity(fieldDTO.getCapacity());
        field.setType(fieldDTO.getType());
        field.setPricePerHour(fieldDTO.getPricePerHour() != null ? 
            BigDecimal.valueOf(fieldDTO.getPricePerHour()) : null);
        field.setFacilities(fieldDTO.getFacilities());
        field.setPhotoUrl(fieldDTO.getPhotoUrl());
        field.setEnabled(true);
        field.setCreatedAt(LocalDateTime.now());

        Field saved = fieldRepository.save(field);
        return mapToDTO(saved);
    }

    /**
     * Récupérer un terrain par ID
     */
    public FieldDTO getFieldById(Long id) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé: " + id));
        return mapToDTO(field);
    }

    /**
     * Lister tous les terrains disponibles
     */
    public List<FieldDTO> getAllAvailableFields() {
        return fieldRepository.findByEnabledTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lister les terrains par ville
     */
    public List<FieldDTO> getFieldsByCity(String city) {
        return fieldRepository.findByCity(city)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lister les terrains de l'owner authentifié
     */
    public List<FieldDTO> getMyFields() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String ownerKeycloakId = jwt.getClaimAsString("sub");

        return fieldRepository.findByOwnerKeycloakId(ownerKeycloakId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mettre à jour un terrain (OWNER only)
     */
    public FieldDTO updateField(Long id, FieldDTO fieldDTO) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String ownerKeycloakId = jwt.getClaimAsString("sub");

        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé: " + id));

        if (!field.getOwnerKeycloakId().equals(ownerKeycloakId)) {
            throw new RuntimeException("Non autorisé à modifier ce terrain");
        }

        if (fieldDTO.getName() != null) {
            field.setName(fieldDTO.getName());
        }
        if (fieldDTO.getDescription() != null) {
            field.setDescription(fieldDTO.getDescription());
        }
        if (fieldDTO.getLocation() != null) {
            field.setLocation(fieldDTO.getLocation());
        }
        if (fieldDTO.getCity() != null) {
            field.setCity(fieldDTO.getCity());
        }
        if (fieldDTO.getPostalCode() != null) {
            field.setPostalCode(fieldDTO.getPostalCode());
        }
        if (fieldDTO.getCapacity() != null) {
            field.setCapacity(fieldDTO.getCapacity());
        }
        if (fieldDTO.getType() != null) {
            field.setType(fieldDTO.getType());
        }
        if (fieldDTO.getPricePerHour() != null) {
            field.setPricePerHour(BigDecimal.valueOf(fieldDTO.getPricePerHour()));
        }
        if (fieldDTO.getFacilities() != null) {
            field.setFacilities(fieldDTO.getFacilities());
        }
        if (fieldDTO.getPhotoUrl() != null) {
            field.setPhotoUrl(fieldDTO.getPhotoUrl());
        }

        field.setUpdatedAt(LocalDateTime.now());
        Field saved = fieldRepository.save(field);
        return mapToDTO(saved);
    }

    /**
     * Supprimer un terrain (ADMIN only)
     */
    public void deleteField(Long id) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé: " + id));
        field.setEnabled(false);
        fieldRepository.save(field);
    }

    /**
     * Rechercher des terrains par ville
     */
    public List<FieldDTO> searchFieldsByCity(String city) {
        return fieldRepository.findByCity(city)
                .stream()
                .filter(Field::getEnabled)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Rechercher des terrains par type
     */
    public List<FieldDTO> searchFieldsByType(String type) {
        return fieldRepository.findByType(type)
                .stream()
                .filter(Field::getEnabled)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Recherche générale de terrains (nom, description, ville, type)
     */
    public List<FieldDTO> searchFields(String query) {
        String searchTerm = query.toLowerCase();
        return fieldRepository.findByEnabledTrue()
                .stream()
                .filter(field -> 
                    (field.getName() != null && field.getName().toLowerCase().contains(searchTerm)) ||
                    (field.getDescription() != null && field.getDescription().toLowerCase().contains(searchTerm)) ||
                    (field.getCity() != null && field.getCity().toLowerCase().contains(searchTerm)) ||
                    (field.getType() != null && field.getType().toLowerCase().contains(searchTerm))
                )
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calculer la note moyenne d'un terrain
     */
    public void updateAverageRating(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé"));

        var reviews = fieldReviewRepository.findByFieldId(fieldId);
        if (reviews.isEmpty()) {
            field.setAverageRating(0.0);
            field.setReviewCount(0);
        } else {
            double average = reviews.stream()
                    .mapToInt(r -> r.getRating())
                    .average()
                    .orElse(0.0);
            field.setAverageRating(Math.round(average * 100.0) / 100.0);
            field.setReviewCount(reviews.size());
        }

        fieldRepository.save(field);
    }

    /**
     * Convertir Field en FieldDTO
     */
    private FieldDTO mapToDTO(Field field) {
        return new FieldDTO(
                field.getId(),
                field.getOwnerKeycloakId(),
                field.getName(),
                field.getDescription(),
                field.getLocation(),
                field.getCity(),
                field.getPostalCode(),
                field.getCapacity(),
                field.getType(),
                field.getPricePerHour() != null ? field.getPricePerHour().doubleValue() : null,
                field.getFacilities(),
                field.getPhotoUrl(),
                field.getAverageRating(),
                field.getReviewCount(),
                field.getEnabled(),
                field.getCreatedAt(),
                field.getUpdatedAt()
        );
    }
}
