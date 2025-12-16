package com.iset.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Keycloak Admin Client Configuration
 * Provides admin access to Keycloak for user management
 */
@Configuration
public class KeycloakAdminConfig {

    @Value("${keycloak.auth-server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${keycloak.realm:sports-arena}")
    private String realm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String clientId;

    @Value("${keycloak.admin.username:admin}")
    private String username;

    @Value("${keycloak.admin.password:admin}")
    private String password;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Admin client uses master realm
                .grantType(OAuth2Constants.PASSWORD)
                .clientId(clientId)
                .username(username)
                .password(password)
                .build();
    }
}
