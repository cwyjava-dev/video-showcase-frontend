package com.videoshowcase.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * 视频流媒体控制器
 * 支持 HTTP Range 请求、流式传输、缓存等优化
 */
@Slf4j
@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
@Tag(name = "视频流媒体", description = "视频流式传输、Range 请求等接口")
public class VideoStreamController {

    @Value("${file.storage.path:/data/videos}")
    private String storagePath;

    /**
     * 流式传输视频文件，支持 HTTP Range 请求
     * 用于支持视频快进、暂停、拖拽等功能
     */
    @GetMapping("/video/{filename:.+}")
    @Operation(summary = "流式传输视频文件，支持 Range 请求")
    public ResponseEntity<?> streamVideo(
            @PathVariable String filename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader
    ) {
        try {
            Path filePath = Paths.get(storagePath, "videos", filename);
            File file = filePath.toFile();

            // 安全检查：防止路径遍历攻击
            if (!file.exists() || !file.getCanonicalPath().startsWith(Paths.get(storagePath).toFile().getCanonicalPath())) {
                log.warn("尝试访问不存在或非法的文件: {}", filename);
                return ResponseEntity.notFound().build();
            }

            long fileSize = file.length();
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "video/mp4";
            }

            // 处理 Range 请求（用于支持快进、暂停等）
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return handleRangeRequest(file, rangeHeader, contentType);
            }

            // 普通请求：返回整个文件
            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // 缓存 1 天
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("视频流传输失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 处理 HTTP Range 请求
     * 支持视频快进、暂停、拖拽等功能
     */
    private ResponseEntity<?> handleRangeRequest(File file, String rangeHeader, String contentType) throws IOException {
        long fileSize = file.length();
        String[] ranges = rangeHeader.substring(6).split("-");

        long start = Long.parseLong(ranges[0]);
        long end = ranges.length > 1 && !ranges[1].isEmpty() ? Long.parseLong(ranges[1]) : fileSize - 1;

        // 验证范围
        if (start > end || start >= fileSize) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                    .build();
        }

        long contentLength = end - start + 1;
        byte[] buffer = new byte[(int) Math.min(contentLength, 1024 * 1024)]; // 最大 1MB 缓冲

        try {
            Resource resource = new FileSystemResource(file);
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                    .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(new RangeFileResource(resource, start, contentLength));
        } catch (Exception e) {
            log.error("Range 请求处理失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取视频文件信息（大小、类型等）
     */
    @GetMapping("/video-info/{filename:.+}")
    @Operation(summary = "获取视频文件信息")
    public ResponseEntity<?> getVideoInfo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(storagePath, "videos", filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "video/mp4";
            }

            return ResponseEntity.ok()
                    .body(new VideoInfo(
                            filename,
                            file.length(),
                            contentType,
                            file.lastModified()
                    ));
        } catch (Exception e) {
            log.error("获取视频信息失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 视频信息 DTO
     */
    public static class VideoInfo {
        public String filename;
        public long size;
        public String contentType;
        public long lastModified;

        public VideoInfo(String filename, long size, String contentType, long lastModified) {
            this.filename = filename;
            this.size = size;
            this.contentType = contentType;
            this.lastModified = lastModified;
        }
    }

    /**
     * 支持 Range 请求的文件资源
     */
    public static class RangeFileResource extends FileSystemResource {
        private final long start;
        private final long length;

        public RangeFileResource(Resource resource, long start, long length) {
            super(resource.getFile());
            this.start = start;
            this.length = length;
        }

        @Override
        public long contentLength() {
            return length;
        }
    }
}
