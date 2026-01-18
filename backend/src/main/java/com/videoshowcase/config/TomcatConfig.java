package com.videoshowcase.config;

import org.apache.coyote.http11.Http11NioProtocol;
import org.springframework.boot.web.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Tomcat 配置类
 * 用于设置最大上传文件大小
 */
@Configuration
public class TomcatConfig {

    /**
     * 配置 Tomcat 连接器，设置最大上传文件大小
     */
    @Bean
    public TomcatConnectorCustomizer tomcatConnectorCustomizer() {
        return connector -> {
            if (connector.getProtocolHandler() instanceof Http11NioProtocol) {
                Http11NioProtocol protocol = (Http11NioProtocol) connector.getProtocolHandler();
                // 设置最大上传文件大小为 500MB
                protocol.setMaxPostSize(536870912);
                protocol.setMaxHttpHeaderSize(8192);
            }
        };
    }
}
