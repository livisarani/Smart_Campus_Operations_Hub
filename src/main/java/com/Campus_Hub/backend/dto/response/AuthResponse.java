package com.Campus_Hub.backend.dto.response;

import com.Campus_Hub.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserResponse user;

    @Data
    @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String imageUrl;
        private Set<Role> roles;
        private String provider;
    }
}
