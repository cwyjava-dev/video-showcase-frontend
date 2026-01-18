package com.videoshowcase.service;

import com.videoshowcase.entity.Category;
import com.videoshowcase.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("分类不存在"));
    }

    public Category createCategory(Category category) {
        try {
            return categoryRepository.save(category);
        } catch (Exception e) {
            log.error("创建分类失败", e);
            throw new RuntimeException("创建分类失败: " + e.getMessage());
        }
    }

    public Category updateCategory(Category category) {
        try {
            if (!categoryRepository.existsById(category.getId())) {
                throw new RuntimeException("分类不存在");
            }
            return categoryRepository.save(category);
        } catch (Exception e) {
            log.error("更新分类失败", e);
            throw new RuntimeException("更新分类失败: " + e.getMessage());
        }
    }

    public void deleteCategory(Long id) {
        try {
            if (!categoryRepository.existsById(id)) {
                throw new RuntimeException("分类不存在");
            }
            categoryRepository.deleteById(id);
        } catch (Exception e) {
            log.error("删除分类失败", e);
            throw new RuntimeException("删除分类失败: " + e.getMessage());
        }
    }
}
