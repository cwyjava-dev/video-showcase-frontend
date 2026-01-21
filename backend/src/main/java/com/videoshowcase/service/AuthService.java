package com.videoshowcase.service;

import com.videoshowcase.dto.AuthRequest;
import com.videoshowcase.dto.AuthResponse;
import com.videoshowcase.dto.UserDto;
import com.videoshowcase.entity.User;
import com.videoshowcase.repository.UserRepository;
import com.videoshowcase.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(AuthRequest request) {
        Optional<User> user = userRepository.findByUsername(request.getUsername());
        if (user.isEmpty() || !passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        User foundUser = user.get();
        String token = jwtTokenProvider.generateToken(String.valueOf(foundUser.getId()), foundUser.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(String.valueOf(foundUser.getId()));

        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(UserDto.fromEntity(foundUser))
            .build();
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User newUser = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .email(request.getUsername() + "@example.com")
            .displayName(request.getUsername())
            .role(User.UserRole.USER)
            .build();

        User savedUser = userRepository.save(newUser);
        String token = jwtTokenProvider.generateToken(String.valueOf(savedUser.getId()), savedUser.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(String.valueOf(savedUser.getId()));

        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(UserDto.fromEntity(savedUser))
            .build();
    }

    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return UserDto.fromEntity(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("RefreshToken 无效");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(Long.parseLong(userId))
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        String newAccessToken = jwtTokenProvider.generateToken(String.valueOf(user.getId()), user.getUsername());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(String.valueOf(user.getId()));

        return AuthResponse.builder()
            .token(newAccessToken)
            .refreshToken(newRefreshToken)
            .user(UserDto.fromEntity(user))
            .build();
    }
}
