package com.example.backend.security.oauth2;

import java.util.Map;

public class GoogleOAuth2UserInfo extends OAuth2UserInfo{
    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return attributes.get("sub").toString();
    }

    @Override
    public String getFirstName() {
        return attributes.get("given_name").toString();
    }

    @Override
    public String getLastName() {
        return attributes.get("family_name").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }
}
