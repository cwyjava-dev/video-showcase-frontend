package com.videoshowcase.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置类
 * 配置静态文件服务，使得上传的文件可以通过 HTTP 访问
 */
@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.storage.path:/data/videos}")
    private String storagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置文件访问路径
        // /api/files/** -> /data/videos/**
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:" + storagePath + "/")
                .setCachePeriod(3600);  // 缓存 1 小时
        
        log.info("配置静态文件服务: /api/files/** -> file:{}/", storagePath);
    }
}
