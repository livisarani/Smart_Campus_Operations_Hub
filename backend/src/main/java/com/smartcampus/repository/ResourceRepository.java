package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByResourceNameContainingIgnoreCase(String resourceName);

    boolean existsByAvailabilityStartLessThanAndAvailabilityEndGreaterThan(
            LocalDateTime newEnd,
            LocalDateTime newStart
    );

    @Query("""
            SELECT COUNT(r) > 0
            FROM Resource r
            WHERE r.id <> :id
            AND r.availabilityStart < :newEnd
            AND r.availabilityEnd > :newStart
            """)
    boolean existsOverlappingAvailabilityExceptCurrent(
            @Param("id") Long id,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd
    );
}