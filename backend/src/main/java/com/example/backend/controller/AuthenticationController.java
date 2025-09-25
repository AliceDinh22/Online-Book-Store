package com.example.backend.controller;

import com.example.backend.dto.PasswordResetDTO;
import com.example.backend.dto.RegistrationDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.dto.auth.AuthenticationRequest;
import com.example.backend.dto.auth.AuthenticationResponse;
import com.example.backend.entity.StoreInfo;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.StoreInfoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final StoreInfoService storeInfoService;

    @PostMapping("/login")
    public ResponseDTO<AuthenticationResponse> login(@RequestBody @Valid AuthenticationRequest request) {
        return ResponseDTO.<AuthenticationResponse>builder()
                .data(authenticationService.login(request.getEmail(), request.getPassword()))
                .status(200)
                .message("Đăng nhập thành công!")
                .build();
    }

    @GetMapping("/forgot/{email}")
    public ResponseDTO<String> sendPasswordResetCode(@PathVariable String email) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.sendPasswordResetCode(email))
                .status(200)
                .message("Gửi mã đặt lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.")
                .build();
    }

    @GetMapping("/reset/{code}")
    public ResponseDTO<String> getEmailByPasswordResetCode(@PathVariable String code) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.getEmailByPasswordResetCode(code))
                .status(200)
                .message("Lấy email thành công!")
                .build();
    }

    @PostMapping("reset")
    public ResponseDTO<String> passwordReset(@RequestBody @Valid PasswordResetDTO request) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.passwordReset(request.getEmail(), request.getPassword(), request.getPassword2()))
                .status(200)
                .message("Đặt lại mật khẩu thành công!")
                .build();
    }

    @PostMapping("/register")
    public ResponseDTO<String> register(@RequestBody @Valid RegistrationDTO user) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.registerUser(user))
                .status(200)
                .message("Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản!")
                .build();
    }

    @GetMapping("/activate/{code}")
    public ResponseDTO<String> activate(@PathVariable String code) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.activateUser(code))
                .status(200)
                .message("Kích hoạt tài khoản thành công!")
                .build();
    }

    @GetMapping("/store/latest")
    public ResponseDTO<StoreInfo> getLatestStoreInfo() {
        return ResponseDTO.<StoreInfo>builder()
                .data(storeInfoService.getLatestStoreInfo())
                .status(200)
                .message("Lấy thông tin cửa hàng mới nhất thành công!")
                .build();
    }
}
