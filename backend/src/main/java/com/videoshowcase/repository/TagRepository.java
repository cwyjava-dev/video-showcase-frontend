package com.videoshowcase.repository;

import com.videoshowcase.entity.VideoTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<VideoTag, Long> {
    Optional<VideoTag> findByName(String name);
    boolean existsByName(String name);
}
