package com.videoshowcase.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 本地文件存储服务
 * 支持视频、缩略图等文件的上传和存储
 */
@Slf4j
@Service
public class FileStorageService {

    @Value("${file.storage.path:/data/videos}")
    private String storagePath;

    @Value("${file.storage.url:http://localhost:8080/api/files}")
    private String storageUrl;

    @Value("${file.upload.max-size:104857600}")
    private long maxFileSize;

    /**
     * 初始化存储目录
     */
    public void initStorageDirectory() {
        try {
            Path path = Paths.get(storagePath);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("存储目录已创建: {}", storagePath);
            }
        } catch (IOException e) {
            log.error("创建存储目录失败: {}", e.getMessage());
            throw new RuntimeException("无法创建存储目录");
        }
    }

    /**
     * 上传文件
     */
    public String uploadFile(MultipartFile file, String fileType) {
        try {
            // 验证文件大小
            if (file.getSize() > maxFileSize) {
                throw new RuntimeException("文件大小超过限制: " + maxFileSize + " 字节");
            }

            // 创建子目录
            String subDir = fileType; // video, thumbnail, etc.
            Path dirPath = Paths.get(storagePath, subDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID() + "." + extension;

            // 保存文件
            Path filePath = dirPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            log.info("文件上传成功: {}", filePath);

            // 返回访问 URL
            return storageUrl + "/" + subDir + "/" + filename;
        } catch (IOException e) {
            log.error("文件上传失败: {}", e.getMessage());
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 删除文件
     */
    public void deleteFile(String fileUrl) {
        try {
            // 从 URL 中提取文件路径
            String relativePath = fileUrl.replace(storageUrl + "/", "");
            Path filePath = Paths.get(storagePath, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("文件已删除: {}", filePath);
            }
        } catch (IOException e) {
            log.error("文件删除失败: {}", e.getMessage());
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "unknown";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 获取存储路径
     */
    public String getStoragePath() {
        return storagePath;
    }

    /**
     * 获取存储 URL 前缀
     */
    public String getStorageUrl() {
        return storageUrl;
    }
}
