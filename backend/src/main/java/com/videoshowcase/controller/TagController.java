package com.videoshowcase.controller;

import com.videoshowcase.entity.VideoTag;
import com.videoshowcase.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "标签管理", description = "视频标签相关接口")
public class TagController {
    private final TagService tagService;

    @GetMapping
    @Operation(summary = "获取所有标签")
    public ResponseEntity<List<VideoTag>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取标签详情")
    public ResponseEntity<VideoTag> getTagById(@PathVariable Long id) {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @PostMapping
    @Operation(summary = "创建标签")
    public ResponseEntity<VideoTag> createTag(@RequestBody VideoTag tag) {
        return ResponseEntity.ok(tagService.createTag(tag));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新标签")
    public ResponseEntity<VideoTag> updateTag(@PathVariable Long id, @RequestBody VideoTag tag) {
        tag.setId(id);
        return ResponseEntity.ok(tagService.updateTag(tag));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除标签")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok().build();
    }
}
