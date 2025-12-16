package com.Server.GateWay.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtTokenFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Skip authentication for public endpoints
        String path = request.getURI().getPath();
        if (path.contains("/auth/login") || path.contains("/auth/health")) {
            return chain.filter(exchange);
        }

        // Get the Authorization header - pass it as-is to downstream services
        // Each microservice will validate the JWT token independently
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Token is present and properly formatted
            // Downstream services will validate it against Keycloak
            return chain.filter(exchange);
        }

        // Continue even without token - services will handle authorization
        return chain.filter(exchange);
    }
}
