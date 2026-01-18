package com.videoshowcase.controller;

import com.videoshowcase.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传控制器
 * 支持视频、缩略图等文件的上传
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "文件管理", description = "文件上传、下载等接口")
public class FileUploadController {
    private final FileStorageService fileStorageService;

    /**
     * 上传视频文件
     */
    @PostMapping("/upload/video")
    @Operation(summary = "上传视频文件")
    public ResponseEntity<Map<String, Object>> uploadVideo(
        @RequestParam("file") MultipartFile file
    ) {
        try {
            String fileUrl = fileStorageService.uploadFile(file, "videos");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fileUrl);
            response.put("filename", file.getOriginalFilename());
            response.put("size", file.getSize());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("视频上传失败: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 上传缩略图
     */
    @PostMapping("/upload/thumbnail")
    @Operation(summary = "上传缩略图")
    public ResponseEntity<Map<String, Object>> uploadThumbnail(
        @RequestParam("file") MultipartFile file
    ) {
        try {
            String fileUrl = fileStorageService.uploadFile(file, "thumbnails");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fileUrl);
            response.put("filename", file.getOriginalFilename());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("缩略图上传失败: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 获取文件存储信息
     */
    @GetMapping("/storage-info")
    @Operation(summary = "获取文件存储信息")
    public ResponseEntity<Map<String, Object>> getStorageInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("storagePath", fileStorageService.getStoragePath());
        info.put("storageUrl", fileStorageService.getStorageUrl());
        return ResponseEntity.ok(info);
    }
}
