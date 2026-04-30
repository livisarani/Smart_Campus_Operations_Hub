package com.Campus_Hub.Smart_Campus_Operations_Hub.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RoleUpdateRequestDTO {
    @NotEmpty(message = "At least one role must be selected")
    private List<String> roles;
}