package com.teumteum.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * [임시] 인증(JWT) 구현 전까지 모든 요청을 허용한다.
 * TODO(김용현): JWT 인증 필터 추가 후 회원 전용(/api/courses 등)·관리자(/api/admin/**) 경로를 막는다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)         // JWT(무상태) 방식이라 CSRF 불필요
                .formLogin(AbstractHttpConfigurer::disable)    // 기본 로그인 화면 끄기
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()              // [임시] 전부 허용
                );
        return http.build();
    }
}
