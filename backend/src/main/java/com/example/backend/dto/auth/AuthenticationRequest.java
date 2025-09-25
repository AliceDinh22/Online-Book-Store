package com.example.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
public class AuthenticationRequest {
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    @Email(message = "Sai định dạng email")
    private String email;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String password;
}
