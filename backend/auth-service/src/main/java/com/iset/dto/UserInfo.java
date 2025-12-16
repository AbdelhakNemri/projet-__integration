package com.iset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String id;
    private String email;
    private String username;
    private String name;
    private String firstName;
    private String lastName;
    private List<String> roles;
}
