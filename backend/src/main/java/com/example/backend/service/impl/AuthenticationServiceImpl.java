package com.example.backend.service.impl;

import com.example.backend.dto.CaptchaDTO;
import com.example.backend.dto.RegistrationDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.dto.auth.AuthenticationResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.Role;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtProvider;
import com.example.backend.security.oauth2.OAuth2UserInfo;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.email.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Value("${hostname}")
    private String hostname;

    @Value("${recaptcha.secret}")
    private String secret;

    @Value("${recaptcha.url}")
    private String captchaUrl;

    @Override
    public AuthenticationResponse login(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            User user = (User) userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String userRole = user.getRole().name();
            String token = jwtProvider.createToken(email, userRole);

            return AuthenticationResponse.builder()
                    .user(new UserDTO(user))
                    .token(token)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }
    }

    @Override
    @Transactional
    public String registerUser(RegistrationDTO registrationDTO) {
        String url = String.format(captchaUrl, secret, registrationDTO.getCaptcha());

        CaptchaDTO captchaResponse = restTemplate.postForObject(
                url,
                Collections.emptyList(),
                CaptchaDTO.class
        );

        if (!Boolean.TRUE.equals(captchaResponse.getSuccess())) {
            throw new RuntimeException("Captcha không hợp lệ: " +
                    captchaResponse.getErrorCodes());
        }

        if (!registrationDTO.getPassword().equals(registrationDTO.getPassword2())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        if (userRepository.findByEmail(registrationDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // map DTO -> entity
        User user = new User();
        user.setFirstName(registrationDTO.getFirstName());
        user.setLastName(registrationDTO.getLastName());
        user.setEmail(registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setAddress(registrationDTO.getAddress());
        user.setPhoneNumber(registrationDTO.getPhoneNumber());
        user.setCity(registrationDTO.getCity());
        user.setRole(Role.CUSTOMER);
        user.setActive(false);
        user.setProvider(AuthProvider.LOCAL);
        user.setActivationCode(UUID.randomUUID().toString());

        userRepository.save(user);

        try {
            sendActivationEmail(user);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email");
        }

        return "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản";
    }

    @Override
    @Transactional
    public User registerOauth2User(String provider, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setFirstName(oAuth2UserInfo.getFirstName());
        user.setLastName(oAuth2UserInfo.getLastName());
        user.setActive(true);
        user.setRole(Role.CUSTOMER);
        user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateOauth2User(User user, String provider, OAuth2UserInfo oAuth2UserInfo) {
        user.setFirstName(oAuth2UserInfo.getFirstName());
        user.setLastName(oAuth2UserInfo.getLastName());
        user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public String activateUser(String code) {
        System.out.println(code);
        User user = userRepository.findByActivationCode(code)
                .orElseThrow(() -> new RuntimeException("Mã kích hoạt không hợp lệ"));

        if (Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        user.setActive(true);
        user.setActivationCode(null);
        userRepository.save(user);
        return "Kích hoạt tài khoản thành công";
    }

    @Override
    public String getEmailByPasswordResetCode(String code) {
        return userRepository.getEmailByPasswordResetCode(code).orElseThrow(() -> new RuntimeException("Mã đặt lại mật khẩu không hợp lệ"));
    }

    @Override
    @Transactional
    public String sendPasswordResetCode(String email) {
        User user = (User) userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        user.setPasswordResetCode(UUID.randomUUID().toString());
        userRepository.save(user);
        try {
            sendPasswordResetEmail(user);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email");
        }
        return "Đã gửi mã đặt lại mật khẩu. Vui lòng kiểm tra email của bạn";
    }

    @Override
    @Transactional
    public String passwordReset(String email, String password, String password2) {
        if (!password.equals(password2)) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        if (StringUtils.isEmpty(password2)) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        User user = (User) userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setPasswordResetCode(null);
        userRepository.save(user);
        return "Đặt lại mật khẩu thành công";
    }

    public void sendActivationEmail(User user) throws MessagingException {
        String subject = "Kích hoạt tài khoản";
        String activationUrl = "http://" + hostname + "/activate/" + user.getActivationCode();

        String htmlContent = "<h1>Xin chào " + user.getFirstName() + "</h1>"
                + "<p>Vui lòng nhấp vào liên kết bên dưới để kích hoạt tài khoản của bạn: </p>"
                + "<a href='" + activationUrl + "'>Kích hoạt tài khoản</a>";


        emailService.sendEmailWithHtml(user.getEmail(), subject, htmlContent);
    }

    public void sendPasswordResetEmail(User user) throws MessagingException {
        String subject = "Đặt lại mật khẩu";
        String resetUrl = "http://" + hostname + "/reset/" + user.getPasswordResetCode();

        String htmlContent = "<h1>Xin chào " + user.getFirstName() + "</h1>"
                + "<p>Bạn có thể đặt lại mật khẩu bằng cách nhấp vào liên kết bên dưới:</p>"
                + "<a href='" + resetUrl + "'>Đặt lại mật khẩu</a>";

        emailService.sendEmailWithHtml(user.getEmail(), subject, htmlContent);
    }
}
