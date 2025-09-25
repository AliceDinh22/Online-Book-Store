package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
public class RegistrationDTO {
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String captcha;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String email;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String firstName;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String lastName;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
    )
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String password;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
    )
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String password2;


    @Pattern(regexp = "^[0-9]{9,11}$", message = "Sai định dạng số điện thoại")
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String phoneNumber;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String address;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String city;
}
