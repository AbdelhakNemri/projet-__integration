package com.iset.controller;

import com.iset.dto.LoginRequest;
import com.iset.dto.RegisterRequest;
import com.iset.dto.TokenResponse;
import com.iset.dto.UserInfo;
import com.iset.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login - Returns JWT Token
     * Public endpoint - anyone can login
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            TokenResponse token = authService.login(request);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get Keycloak registration URL
     * Frontend should redirect user to this URL to register
     */
    @GetMapping("/register-url")
    public ResponseEntity<String> getRegistrationUrl() {
        // Use kc_action=register to force registration page
        String registrationUrl = "http://localhost:8080/realms/sports-arena/protocol/openid-connect/auth?" +
                "client_id=web-frontend&" +
                "response_type=code&" +
                "redirect_uri=http://localhost:4200&" +
                "scope=openid%20profile%20email&" +
                "kc_action=register";
        return ResponseEntity.ok("{\"registrationUrl\":\"" + registrationUrl + "\"}");
    }

    /**
     * Get authenticated user
     * Requires valid token
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfo> getCurrentUser() {
        try {
            UserInfo user = authService.getCurrentUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running");
    }
}
