package com.videoshowcase.repository;

import com.videoshowcase.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    Page<Video> findByStatusAndTitleContainingIgnoreCase(Video.VideoStatus status, String title, Pageable pageable);
    Page<Video> findByStatus(Video.VideoStatus status, Pageable pageable);
    Page<Video> findByCategoryId(Long categoryId, Pageable pageable);
    List<Video> findByStatus(Video.VideoStatus status);
}
