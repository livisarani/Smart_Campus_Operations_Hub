package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ResourceDTO {

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Availability start date and time is required")
    @Future(message = "Availability start must be a future date and time")
    private LocalDateTime availabilityStart;

    @NotNull(message = "Availability end date and time is required")
    @Future(message = "Availability end must be a future date and time")
    private LocalDateTime availabilityEnd;

    @NotNull(message = "Resource status is required")
    private ResourceStatus status;

    private String description;

    public ResourceDTO() {
    }

    public String getResourceName() {
        return resourceName;
    }

    public ResourceType getType() {
        return type;
    }

    public int getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public LocalDateTime getAvailabilityStart() {
        return availabilityStart;
    }

    public LocalDateTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setAvailabilityStart(LocalDateTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public void setAvailabilityEnd(LocalDateTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}