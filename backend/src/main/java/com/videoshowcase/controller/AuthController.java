package com.videoshowcase.controller;

import com.videoshowcase.dto.AuthRequest;
import com.videoshowcase.dto.AuthResponse;
import com.videoshowcase.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "用户登录、注册等接口")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("登出成功");
    }
}
