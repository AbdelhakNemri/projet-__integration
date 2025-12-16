package com.iset.client;

import com.iset.config.FeignConfig;
import com.iset.dto.TokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
    name = "keycloak-auth",
    url = "http://localhost:8080/realms/sports-arena/protocol/openid-connect",
    configuration = FeignConfig.class
)
public interface KeycloakClient {

    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse getToken(
        @RequestParam("client_id") String clientId,
        @RequestParam("grant_type") String grantType,
        @RequestParam("username") String username,
        @RequestParam("password") String password
    );
}
