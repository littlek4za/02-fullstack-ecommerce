package com.myapp.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationManager;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;

@Configuration
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, Auth0AuthenticationEntryPoint auth0EntryPoint) throws Exception {

        // protect endpoint /api/order
        http.authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/orders/**")
                        .authenticated()
                        .anyRequest()
                        .permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable);

        // Set ContentNegotiationManager to look at Accept header
        ContentNegotiationManager manager = new ContentNegotiationManager(
                new HeaderContentNegotiationStrategy()
        );
        http.setSharedObject(ContentNegotiationManager.class, manager);

        // Use custom 401 JSON response
        http.exceptionHandling(exception ->
                exception.authenticationEntryPoint(auth0EntryPoint)
        );

        return http.build();

    }
}
