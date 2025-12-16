package com.iset.repository;

import com.iset.entity.FieldReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FieldReviewRepository extends JpaRepository<FieldReview, Long> {

    List<FieldReview> findByFieldId(Long fieldId);

    List<FieldReview> findByReviewerKeycloakId(String reviewerKeycloakId);

    @Query("SELECT AVG(r.rating) FROM FieldReview r WHERE r.field.id = :fieldId")
    Double getAverageRatingByFieldId(@Param("fieldId") Long fieldId);

    @Query("SELECT COUNT(r) FROM FieldReview r WHERE r.field.id = :fieldId")
    Integer getReviewCountByFieldId(@Param("fieldId") Long fieldId);
}
