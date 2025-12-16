package com.iset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String sub;
    private String email;
    @JsonProperty("email_verified")
    private Boolean emailVerified;
    private String name;
    @JsonProperty("given_name")
    private String givenName;
    @JsonProperty("family_name")
    private String familyName;
    private String preferredUsername;
    private Map<String, Object> realmAccess;
}
