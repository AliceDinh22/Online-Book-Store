package com.example.backend.security.oauth2;

import java.util.Map;

public class FacebookOAuth2UserInfo extends OAuth2UserInfo{
    public FacebookOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }
    @Override
    public String getId() {
        return attributes.get("id").toString();
    }

    @Override
    public String getFirstName() {
        return attributes.get("first_name").toString();
    }

    @Override
    public String getLastName() {
        return attributes.get("last_name").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }
}
