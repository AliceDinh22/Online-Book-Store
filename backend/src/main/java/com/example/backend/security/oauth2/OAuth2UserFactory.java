package com.example.backend.security.oauth2;

import com.example.backend.enums.AuthProvider;
import lombok.SneakyThrows;

import java.util.Map;

public class OAuth2UserFactory {
    public static OAuth2UserInfo getOAuth2User(String registrationId, Map<String, Object> attributes) {
        String provider = registrationId.toUpperCase();

        return switch (provider) {
            case "GOOGLE" -> new GoogleOAuth2UserInfo(attributes);
            case "FACEBOOK" -> new FacebookOAuth2UserInfo(attributes);
            case "GITHUB" -> new GithubOAuth2UserInfo(attributes);
            default -> throw new IllegalArgumentException("Provider '" + registrationId + "' không được hỗ trợ");
        };
    }

}
