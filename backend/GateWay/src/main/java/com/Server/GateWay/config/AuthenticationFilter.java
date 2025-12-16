package com.Server.GateWay.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip authentication for public endpoints
        if (path.contains("/auth/login") ||
                path.contains("/auth/register-url") ||
                path.contains("/auth/health")) {
            return chain.filter(exchange);
        }

        // Get Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Token is present, pass it along to the downstream services
            // The token will be in the Authorization header for resource servers to
            // validate
            return chain.filter(exchange);
        }

        // If no token and route requires auth, request continues anyway
        // Each microservice will validate the token
        return chain.filter(exchange);
    }
}
