package com.agriconnect.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "agriconnect")
public record AppProperties(
        Cors cors,
        Admin admin
) {

    public record Cors(
            String allowedOrigin
    ) {
    }

    public record Admin(
            String defaultEmail,
            String defaultPassword
    ) {
    }
}
