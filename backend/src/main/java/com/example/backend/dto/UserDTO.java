package com.example.backend.dto;

import com.example.backend.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String firstName;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String lastName;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    @Email(message = "Sai định dạng email")
    private String email;

    @Pattern(regexp = "^[0-9]{9,11}$", message = "Sai định dạng số điện thoại")
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String phoneNumber;

    private String address;
    private String city;

    private Boolean active = true;

    private String provider;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private String role;

    private List<Long> orderIds;
    private List<Long> reviewIds;

    public UserDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
        this.city = user.getCity();
        this.active = user.getActive();
        this.provider = user.getProvider().name();
        this.role = user.getRole().name();
    }
}
