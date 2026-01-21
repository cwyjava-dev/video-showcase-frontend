package com.videoshowcase.controller;

import com.videoshowcase.dto.AuthRequest;
import com.videoshowcase.dto.AuthResponse;
import com.videoshowcase.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "用户登录、注册等接口")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新 Token")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).body(new AuthResponse());
        }
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    /**
     * 设置 RefreshToken Cookie
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        String cookieValue = "refreshToken=" + refreshToken + 
            "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800";
        response.addHeader("Set-Cookie", cookieValue);
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // 清除 RefreshToken Cookie
        String cookieValue = "refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
        response.addHeader("Set-Cookie", cookieValue);
        return ResponseEntity.ok("登出成功");
    }
}
