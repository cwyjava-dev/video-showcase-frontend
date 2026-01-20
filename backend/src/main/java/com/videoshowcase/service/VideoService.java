package com.videoshowcase.service;

import com.videoshowcase.dto.VideoDto;
import com.videoshowcase.entity.Video;
import com.videoshowcase.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.videoshowcase.entity.VideoTag;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepository;

    /**
     * 获取所有视频
     */
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    /**
     * 获取已发布的视频（分页）
     */
    public Page<Video> getPublishedVideos(Pageable pageable) {
        return videoRepository.findByStatus(Video.VideoStatus.PUBLISHED, pageable);
    }

    /**
     * 根据 ID 获取视频
     */
    public Video getVideoById(Long id) {
        return videoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("视频不存在"));
    }

    /**
     * 增加视频观看次数
     */
    @Transactional
    public void incrementViews(Long videoId) {
        Video video = getVideoById(videoId);
        video.setViews(video.getViews() + 1);
        videoRepository.save(video);
    }

    /**
     * 搜索视频（不分页）
     */
    public List<Video> searchVideos(String keyword) {
        return videoRepository.findAll().stream()
            .filter(v -> v.getTitle() != null && v.getTitle().toLowerCase().contains(keyword.toLowerCase()))
            .collect(Collectors.toList());
    }

    /**
     * 搜索视频（分页）
     */
    public Page<Video> searchVideos(String keyword, Pageable pageable) {
        return videoRepository.findByStatusAndTitleContainingIgnoreCase(
            Video.VideoStatus.PUBLISHED, keyword, pageable
        );
    }

    /**
     * 创建视频
     */
    public Video createVideo(Video video) {
        try {
            if (video.getViews() == null) {
                video.setViews(0L);
            }
            if (video.getStatus() == null) {
                video.setStatus(Video.VideoStatus.DRAFT);
            }
            return videoRepository.save(video);
        } catch (Exception e) {
            log.error("创建视频失败", e);
            throw new RuntimeException("创建视频失败: " + e.getMessage());
        }
    }

    /**
     * 更新视频
     */
    public Video updateVideo(Video video) {
        try {
            if (!videoRepository.existsById(video.getId())) {
                throw new RuntimeException("视频不存在");
            }
            Video existingVideo = videoRepository.findById(video.getId())
                .orElseThrow(() -> new RuntimeException("视频不存在"));
            
            // 只更新允许修改的字段
            if (video.getTitle() != null) {
                existingVideo.setTitle(video.getTitle());
            }
            if (video.getDescription() != null) {
                existingVideo.setDescription(video.getDescription());
            }
            if (video.getCategory() != null) {
                existingVideo.setCategory(video.getCategory());
            }
            if (video.getThumbnailUrl() != null) {
                existingVideo.setThumbnailUrl(video.getThumbnailUrl());
            }
            if (video.getStatus() != null) {
                existingVideo.setStatus(video.getStatus());
            }
            if (video.getTags() != null) {
                existingVideo.setTags(video.getTags());
            }
            
            existingVideo.setUpdatedAt(new java.util.Date());
            return videoRepository.save(existingVideo);
        } catch (Exception e) {
            log.error("更新视频失败", e);
            throw new RuntimeException("更新视频失败: " + e.getMessage());
        }
    }

    /**
     * 删除视频
     */
    public void deleteVideo(Long id) {
        try {
            if (!videoRepository.existsById(id)) {
                throw new RuntimeException("视频不存在");
            }
            videoRepository.deleteById(id);
        } catch (Exception e) {
            log.error("删除视频失败", e);
            throw new RuntimeException("删除视频失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有视频（不管状态）
     */
    public List<Video> getAllPublishedVideos() {
        return videoRepository.findAll();
    }

    /**
     * 获取视频的所有标签
     */
    public List<VideoTag> getVideoTags(Long videoId) {
        Video video = getVideoById(videoId);
        return video.getTags();
    }
}
