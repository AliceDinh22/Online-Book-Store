package com.example.backend.security.oauth2;

import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.Role;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        OAuth2User oAuth2User = super.loadUser(userRequest);
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserFactory.getOAuth2User(provider, oAuth2User.getAttributes());
        User user = (User) userRepository.findByEmail(oAuth2UserInfo.getEmail()).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(oAuth2UserInfo.getEmail());
            user.setFirstName(oAuth2UserInfo.getFirstName());
            user.setLastName(oAuth2UserInfo.getLastName());
            user.setActive(true);
            user.setRole(Role.CUSTOMER);
            user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
        } else {
            user.setFirstName(oAuth2UserInfo.getFirstName());
            user.setLastName(oAuth2UserInfo.getLastName());
            user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
        }

        userRepository.save(user);

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }
}
