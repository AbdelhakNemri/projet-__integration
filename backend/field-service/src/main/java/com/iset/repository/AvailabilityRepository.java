package com.iset.repository;

import com.iset.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByFieldId(Long fieldId);

    List<Availability> findByFieldIdAndDayOfWeek(Long fieldId, Integer dayOfWeek);

    List<Availability> findByFieldIdAndIsAvailableTrue(Long fieldId);
}
