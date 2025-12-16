package com.iset.service;

import com.iset.dto.LoginRequest;
import com.iset.dto.TokenResponse;
import com.iset.dto.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Login with Keycloak
     */
    public TokenResponse login(LoginRequest request) {
        try {
            // Build form data
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", "web-frontend");
            body.add("grant_type", "password");
            body.add("username", request.getUsername());
            body.add("password", request.getPassword());

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(body, headers);

            TokenResponse response = restTemplate.postForObject(
                "http://localhost:8080/realms/sports-arena/protocol/openid-connect/token",
                httpEntity,
                TokenResponse.class
            );
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Login échoué: " + e.getMessage(), e);
        }
    }

    /**
     * Get current authenticated user from JWT
     */
    public UserInfo getCurrentUser() {
        try {
            Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            UserInfo user = new UserInfo();
            user.setId(jwt.getClaimAsString("sub"));
            user.setEmail(jwt.getClaimAsString("email"));
            user.setUsername(jwt.getClaimAsString("preferred_username"));
            user.setName(jwt.getClaimAsString("name"));
            user.setFirstName(jwt.getClaimAsString("given_name"));
            user.setLastName(jwt.getClaimAsString("family_name"));
            
            // Get roles
            Object realmAccess = jwt.getClaim("realm_access");
            if (realmAccess instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) ((java.util.Map<?, ?>) realmAccess).get("roles");
                if (roles != null) {
                    user.setRoles(roles);
                }
            }

            return user;
        } catch (Exception e) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
    }

    /**
     * Get user ID
     */
    public String getUserId() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getClaimAsString("sub");
    }
}
