package com.Campus_Hub.Smart_Campus_Operations_Hub.controller;

import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.request.RoleUpdateRequestDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.exception.BadRequestException;
import com.Campus_Hub.Smart_Campus_Operations_Hub.exception.ResourceNotFoundException;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.User;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.enums.UserRole;
import com.Campus_Hub.Smart_Campus_Operations_Hub.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class RoleController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}/roles")
    public ResponseEntity<Map<String, Object>> getUserRoles(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<Map<String, Object>> updateRoles(
            @PathVariable Long id,
            @RequestBody @Valid RoleUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        String requestedRole = request.getRoles().get(0);
        try {
            user.setRole(UserRole.valueOf(requestedRole.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + requestedRole);
        }

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private Map<String, Object> toResponse(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getFullName());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("provider", "LOCAL");
        response.put("roles", List.of(user.getRole().name()));
        response.put("imageUrl", null);
        return response;
    }
}