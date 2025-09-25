package com.example.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetDTO {
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password2;
}
