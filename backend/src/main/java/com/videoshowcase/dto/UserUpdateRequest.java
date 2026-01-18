package com.videoshowcase.dto;

import com.videoshowcase.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserUpdateRequest {
    private String email;
    private String displayName;
    private String password;
    private User.UserRole role;
}
