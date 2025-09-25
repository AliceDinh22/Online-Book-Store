package com.example.backend.controller;

import com.example.backend.dto.PasswordResetDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final AuthenticationService authenticationService;

    @PutMapping("edit/password")
    public ResponseDTO<String> changePassword(@AuthenticationPrincipal UserPrincipal user,
                                              @Valid @RequestBody PasswordResetDTO request) {
        return ResponseDTO.<String>builder()
                .data(authenticationService.passwordReset(user.getEmail(), request.getPassword(), request.getPassword2()))
                .status(200)
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    @PutMapping("/{id}")
    public ResponseDTO<Void> updateUserInfo(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        userService.updateUserInfo(id, userDTO);
        return ResponseDTO.<Void>builder()
                .status(200)
                .message("Cập nhật thông tin người dùng thành công!")
                .build();
    }

}
