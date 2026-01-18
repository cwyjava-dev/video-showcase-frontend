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
        return ResponseEntity.ok(videoService.getAllVideos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取视频详情")
    public ResponseEntity<Video> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.getVideoById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "搜索视频")
    public ResponseEntity<List<Video>> searchVideos(@RequestParam String keyword) {
        return ResponseEntity.ok(videoService.searchVideos(keyword));
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

    @GetMapping("/{id}/tags")
    @Operation(summary = "\u83b7\u53d6\u89c6\u9891\u7684\u6240\u6709\u6807\u7b7e")
    public ResponseEntity<List<VideoTag>> getVideoTags(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.getVideoTags(id));
    }
}
