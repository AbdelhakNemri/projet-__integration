package com.iset.repository;

import com.iset.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {

    Optional<Field> findByName(String name);

    Optional<Field> findById(Long id);

    List<Field> findByOwnerKeycloakId(String ownerKeycloakId);

    List<Field> findByEnabledTrue();

    List<Field> findByCity(String city);

    List<Field> findByType(String type);

    @Query("SELECT f FROM Field f WHERE f.enabled = true AND LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Field> searchFields(@Param("searchTerm") String searchTerm);

    boolean existsByName(String name);
}
