package com.videoshowcase.service;

import com.videoshowcase.entity.User;
import com.videoshowcase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public User createUser(User user) {
        try {
            // 检查用户名是否已存在
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                throw new RuntimeException("用户名已存在");
            }
            // 检查邮箱是否已存在
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("邮箱已存在");
            }
            // 密码加密
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("创建用户失败", e);
            throw new RuntimeException("创建用户失败: " + e.getMessage());
        }
    }

    public User updateUser(Long id, com.videoshowcase.dto.UserUpdateRequest updateRequest) {
        try {
            if (!userRepository.existsById(id)) {
                throw new RuntimeException("用户不存在");
            }
            
            // 获取现有用户信息
            User existingUser = userRepository.findById(id).get();
            
            // 只更新非 null 的字段
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty()) {
                existingUser.setEmail(updateRequest.getEmail());
            }
            
            if (updateRequest.getDisplayName() != null && !updateRequest.getDisplayName().isEmpty()) {
                existingUser.setDisplayName(updateRequest.getDisplayName());
            }
            
            if (updateRequest.getRole() != null) {
                existingUser.setRole(updateRequest.getRole());
            }
            
            // 如果提供了新密码，进行加密
            if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
            }
            
            return userRepository.save(existingUser);
        } catch (Exception e) {
            log.error("更新用户失败", e);
            throw new RuntimeException("更新用户失败: " + e.getMessage());
        }
    }

    public void deleteUser(Long id) {
        try {
            if (!userRepository.existsById(id)) {
                throw new RuntimeException("用户不存在");
            }
            userRepository.deleteById(id);
        } catch (Exception e) {
            log.error("删除用户失败", e);
            throw new RuntimeException("删除用户失败: " + e.getMessage());
        }
    }

    public Long getUserCount() {
        return userRepository.count();
    }
}
