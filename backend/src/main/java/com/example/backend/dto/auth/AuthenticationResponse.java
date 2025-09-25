package com.example.backend.dto.auth;

import com.example.backend.dto.UserDTO;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private UserDTO user;
    private String token;
}
