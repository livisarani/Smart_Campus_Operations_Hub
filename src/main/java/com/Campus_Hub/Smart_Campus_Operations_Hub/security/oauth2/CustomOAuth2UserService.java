package com.Campus_Hub.Smart_Campus_Operations_Hub.security.oauth2;

import com.Campus_Hub.Smart_Campus_Operations_Hub.model.User;
import com.Campus_Hub.Smart_Campus_Operations_Hub.model.enums.UserRole;
import com.Campus_Hub.Smart_Campus_Operations_Hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");
        String login = (String) oAuth2User.getAttributes().get("login");

        if ((email == null || email.isBlank()) && "github".equalsIgnoreCase(registrationId) && login != null && !login.isBlank()) {
            // GitHub can omit email unless user grants access to email addresses.
            email = login + "@users.noreply.github.com";
        }

        if ((name == null || name.isBlank()) && login != null && !login.isBlank()) {
            name = login;
        }

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        final String finalEmail = email;
        final String finalName = name;

        userRepository.findByEmail(finalEmail)
                .ifPresentOrElse(
                        existing -> {
                            if (finalName != null && !finalName.isBlank() && !finalName.equals(existing.getFullName())) {
                                existing.setFullName(finalName);
                                userRepository.save(existing);
                            }
                        },
                        () -> registerNewOAuthUser(finalEmail, finalName)
                );

        return oAuth2User;
    }

    private void registerNewOAuthUser(String email, String name) {
        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (baseUsername.isBlank()) {
            baseUsername = "user";
        }

        String candidate = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + suffix;
            suffix++;
        }

        String displayName = (name == null || name.isBlank()) ? candidate : name;

        User user = User.builder()
                .username(candidate)
                .email(email)
                .password("oauth2-" + UUID.randomUUID())
                .fullName(displayName)
                .role(UserRole.STUDENT)
                .build();

        userRepository.save(user);
        log.info("Registered new OAuth2 user: {}", email);
    }
}
