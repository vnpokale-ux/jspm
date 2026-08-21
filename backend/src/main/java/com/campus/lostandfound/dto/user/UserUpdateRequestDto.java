package com.campus.lostandfound.dto.user;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequestDto {
    private String firstName;
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;
}
