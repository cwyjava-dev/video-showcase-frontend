package com.videoshowcase.controller;

import com.videoshowcase.entity.Video;
import com.videoshowcase.entity.User;
import com.videoshowcase.service.VideoService;
import com.videoshowcase.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.videoshowcase.entity.VideoTag;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Tag(name = "视频管理", description = "视频相关接口")
public class VideoController {
    private final VideoService videoService;

    @GetMapping
    @Operation(summary = "获取视频列表")
    public ResponseEntity<List<Video>> getAllVideos() {
        List<Video> videos = videoService.getAllVideos();
        // 转换 videoUrl 为流媒体 URL
        videos.forEach(video -> {
            if (video.getVideoUrl() != null && video.getVideoUrl().contains("/api/files/videos/")) {
                video.setVideoUrl(video.getVideoUrl().replace("/api/files/videos/", "/api/stream/video/"));
            }
        });
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/search")
    @Operation(summary = "搜索视频")
    public ResponseEntity<List<Video>> searchVideos(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) Long categoryId) {
        // 如果关键字为空，返回所有已发布的视频
        List<Video> videos;
        if (keyword == null || keyword.trim().isEmpty()) {
            videos = videoService.getAllPublishedVideos();
        } else {
            videos = videoService.searchVideos(keyword.trim());
        }
        
        // 如果指定了分类，按分类筛选
        if (categoryId != null) {
            videos = videos.stream()
                .filter(v -> v.getCategory() != null && v.getCategory().getId().equals(categoryId))
                .collect(java.util.stream.Collectors.toList());
        }
        
        // 转换 videoUrl 为流媒体 URL
        videos.forEach(video -> {
            if (video.getVideoUrl() != null && video.getVideoUrl().contains("/api/files/videos/")) {
                video.setVideoUrl(video.getVideoUrl().replace("/api/files/videos/", "/api/stream/video/"));
            }
        });
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/published/all")
    @Operation(summary = "\u83b7\u53d6\u6240\u6709\u5df2\u53d1\u5e03\u7684\u89c6\u9891")
    public ResponseEntity<List<Video>> getAllPublishedVideos() {
        return ResponseEntity.ok(videoService.getAllPublishedVideos());
    }

    @GetMapping("/{id}/tags")
    @Operation(summary = "\u83b7\u53d6\u89c6\u9891\u7684\u6240\u6709\u6807\u7b7e")
    public ResponseEntity<List<VideoTag>> getVideoTags(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.getVideoTags(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "\u83b7\u53d6\u89c6\u9891\u8be6\u60c5")
    public ResponseEntity<Video> getVideoById(@PathVariable Long id) {
        Video video = videoService.getVideoById(id);
        // \u8f6c\u6362 videoUrl \u4e3a\u6d41\u5a92\u4f53 URL
        if (video.getVideoUrl() != null && video.getVideoUrl().contains("/api/files/videos/")) {
            String filename = video.getVideoUrl().substring(video.getVideoUrl().lastIndexOf("/") + 1);
            video.setVideoUrl(video.getVideoUrl().replace("/api/files/videos/", "/api/stream/video/"));
        }
        return ResponseEntity.ok(video);
    }

    @PostMapping("/{id}/views")
    @Operation(summary = "增加观看次数")
    public ResponseEntity<String> incrementViews(@PathVariable Long id) {
        videoService.incrementViews(id);
        return ResponseEntity.ok("观看次数已增加");
    }

    @PostMapping
    @Operation(summary = "创建视频")
    public ResponseEntity<Video> createVideo(@RequestBody Video video, Authentication authentication) {
        // 从认证信息中获取当前用户
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = new User();
            user.setId(principal.getId());
            video.setCreatedBy(user);
        }
        return ResponseEntity.ok(videoService.createVideo(video));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新视频")
    public ResponseEntity<Video> updateVideo(@PathVariable Long id, @RequestBody Video video) {
        video.setId(id);
        return ResponseEntity.ok(videoService.updateVideo(video));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "\u524a\u9664\u89c6\u9891")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.ok().build();
    }
}
