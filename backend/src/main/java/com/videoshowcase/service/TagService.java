package com.videoshowcase.service;

import com.videoshowcase.entity.VideoTag;
import com.videoshowcase.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;

    public List<VideoTag> getAllTags() {
        return tagRepository.findAll();
    }

    public VideoTag getTagById(Long id) {
        return tagRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("标签不存在"));
    }

    public VideoTag createTag(VideoTag tag) {
        try {
            return tagRepository.save(tag);
        } catch (Exception e) {
            log.error("创建标签失败", e);
            throw new RuntimeException("创建标签失败: " + e.getMessage());
        }
    }

    public VideoTag updateTag(VideoTag tag) {
        try {
            if (!tagRepository.existsById(tag.getId())) {
                throw new RuntimeException("标签不存在");
            }
            return tagRepository.save(tag);
        } catch (Exception e) {
            log.error("更新标签失败", e);
            throw new RuntimeException("更新标签失败: " + e.getMessage());
        }
    }

    public void deleteTag(Long id) {
        try {
            if (!tagRepository.existsById(id)) {
                throw new RuntimeException("标签不存在");
            }
            tagRepository.deleteById(id);
        } catch (Exception e) {
            log.error("删除标签失败", e);
            throw new RuntimeException("删除标签失败: " + e.getMessage());
        }
    }
}
