package com.Campus_Hub.Smart_Campus_Operations_Hub.controller;

import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.request.LoginRequestDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.request.RegisterRequestDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.response.AuthResponseDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.dto.response.UserSummaryDTO;
import com.Campus_Hub.Smart_Campus_Operations_Hub.exception.BadRequestException;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.User;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.enums.UserRole;
import com.Campus_Hub.Smart_Campus_Operations_Hub.repository.UserRepository;
import com.Campus_Hub.Smart_Campus_Operations_Hub.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody @Valid RegisterRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username is already taken: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use: " + dto.getEmail());
        }

        UserRole role = UserRole.STUDENT;
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(dto.getRole().toUpperCase());
                if (role == UserRole.ADMIN) {
                    throw new BadRequestException("Cannot self-register as ADMIN");
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + dto.getRole());
            }
        }

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .role(role)
                .build();
        User saved = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(saved.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(saved.getId())
                .username(saved.getUsername())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(toCurrentUserResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String accessToken = tokenProvider.generateTokenFromUsername(username);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", tokenProvider.generateTokenFromUsername(username));
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 86400);
        response.put("user", toCurrentUserResponse(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ===================== GET /api/auth/users =====================
    // Returns all registered users as lightweight summaries.
    // Used by the admin UI to populate the assign-technician dropdown.
    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers(
            @AuthenticationPrincipal UserDetails principal) {
        User currentUser = resolveUser(principal);
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view users list");
        }

        List<UserSummaryDTO> users = userRepository.findAll().stream()
                .map(u -> UserSummaryDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .phone(u.getPhone())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private Map<String, Object> toCurrentUserResponse(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("name", user.getFullName());
        response.put("email", user.getEmail());
        response.put("imageUrl", null);
        response.put("provider", "LOCAL");
        response.put("roles", List.of(user.getRole().name()));
        return response;
    }
}

