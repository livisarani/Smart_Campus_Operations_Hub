package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    public Resource createResource(ResourceDTO dto) {
        validateAvailability(dto.getAvailabilityStart(), dto.getAvailabilityEnd());

        boolean hasOverlap = resourceRepository.existsByAvailabilityStartLessThanAndAvailabilityEndGreaterThan(
                dto.getAvailabilityEnd(),
                dto.getAvailabilityStart()
        );

        if (hasOverlap) {
            throw new RuntimeException("This availability window overlaps with an existing resource availability.");
        }

        Resource resource = new Resource();

        resource.setResourceName(dto.getResourceName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityStart(dto.getAvailabilityStart());
        resource.setAvailabilityEnd(dto.getAvailabilityEnd());
        resource.setAvailabilityWindow(
                formatAvailabilityWindow(dto.getAvailabilityStart(), dto.getAvailabilityEnd())
        );
        resource.setStatus(dto.getStatus());
        resource.setDescription(dto.getDescription());

        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + id));
    }

    public List<Resource> searchResources(
            String name,
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity
    ) {
        if (name != null && !name.isBlank()) {
            return resourceRepository.findByResourceNameContainingIgnoreCase(name);
        }

        if (type != null) {
            return resourceRepository.findByType(type);
        }

        if (status != null) {
            return resourceRepository.findByStatus(status);
        }

        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }

        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }

        return resourceRepository.findAll();
    }

    public Resource updateResource(Long id, ResourceDTO dto) {
        validateAvailability(dto.getAvailabilityStart(), dto.getAvailabilityEnd());

        Resource existingResource = getResourceById(id);

        boolean hasOverlap = resourceRepository.existsOverlappingAvailabilityExceptCurrent(
                id,
                dto.getAvailabilityStart(),
                dto.getAvailabilityEnd()
        );

        if (hasOverlap) {
            throw new RuntimeException("This availability window overlaps with an existing resource availability.");
        }

        existingResource.setResourceName(dto.getResourceName());
        existingResource.setType(dto.getType());
        existingResource.setCapacity(dto.getCapacity());
        existingResource.setLocation(dto.getLocation());
        existingResource.setAvailabilityStart(dto.getAvailabilityStart());
        existingResource.setAvailabilityEnd(dto.getAvailabilityEnd());
        existingResource.setAvailabilityWindow(
                formatAvailabilityWindow(dto.getAvailabilityStart(), dto.getAvailabilityEnd())
        );
        existingResource.setStatus(dto.getStatus());
        existingResource.setDescription(dto.getDescription());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }

    private void validateAvailability(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();

        if (start == null || end == null) {
            throw new RuntimeException("Availability start and end date/time are required.");
        }

        if (start.isBefore(now)) {
            throw new RuntimeException("Availability start date/time cannot be in the past.");
        }

        if (end.isBefore(now)) {
            throw new RuntimeException("Availability end date/time cannot be in the past.");
        }

        if (!end.isAfter(start)) {
            throw new RuntimeException("Availability end date/time must be after start date/time.");
        }
    }

    private String formatAvailabilityWindow(LocalDateTime start, LocalDateTime end) {
        return start.format(DISPLAY_FORMAT) + " - " + end.format(DISPLAY_FORMAT);
    }
}