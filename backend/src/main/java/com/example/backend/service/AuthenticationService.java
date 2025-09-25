package com.example.backend.service;

import com.example.backend.dto.RegistrationDTO;
import com.example.backend.dto.auth.AuthenticationResponse;
import com.example.backend.entity.User;
import com.example.backend.security.oauth2.OAuth2UserInfo;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;

import java.util.Map;

public interface AuthenticationService {
    AuthenticationResponse login(String email, String password);
    String registerUser(RegistrationDTO registrationDTO);

    User registerOauth2User(String provider, OAuth2UserInfo oAuth2UserInfo);

    User updateOauth2User(User user, String provider, OAuth2UserInfo oAuth2UserInfo);

    String activateUser(String code);

    String getEmailByPasswordResetCode(String code);

    String sendPasswordResetCode(String email);

    String passwordReset(String email, String password, String password2);
}
