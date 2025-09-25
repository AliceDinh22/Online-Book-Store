package com.example.backend.security.oauth2;

import java.util.Map;

public class GithubOAuth2UserInfo extends OAuth2UserInfo {
    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return attributes.get("id").toString();
    }

    @Override
    public String getFirstName() {
        return attributes.get("name").toString();
    }

    @Override
    public String getLastName() {
        return "";
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }
}
