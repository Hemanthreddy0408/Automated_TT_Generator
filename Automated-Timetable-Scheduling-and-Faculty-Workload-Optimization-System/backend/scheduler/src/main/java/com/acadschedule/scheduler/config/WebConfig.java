package com.acadschedule.scheduler.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig.java
 * Configures global MVC properties. Note: CORS mapping is now primarily
 * handled in SecurityConfig.java for centralized security policy management.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // We are handling CORS in SecurityConfig.java for better consistency with Spring Security
    }
}
