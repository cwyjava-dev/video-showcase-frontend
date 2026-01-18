# Video Showcase Backend

Spring Boot 后端服务，为视频展示平台提供 RESTful API。

## 技术栈

- **框架**: Spring Boot 3.2
- **数据库**: MySQL 8.0
- **认证**: JWT (JJWT 0.12.3)
- **API 文档**: Swagger/OpenAPI
- **构建**: Maven
- **容器**: Docker

## 快速开始

### 本地开发

1. **安装依赖**
```bash
mvn clean install
```

2. **配置数据库**
修改 `application.yml` 中的数据库配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:5506/video_showcase
    username: root
    password: root_password
```

3. **启动应用**
```bash
mvn spring-boot:run
```

应用将在 `http://localhost:8080` 启动。

### Docker 部署

1. **构建镜像**
```bash
docker build -t video-showcase-backend:latest .
```

2. **运行容器**
```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:5506/video_showcase \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root_password \
  video-showcase-backend:latest
```

### Docker Compose 部署

```bash
docker-compose up -d
```

## API 文档

启动应用后，访问 Swagger UI：
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs

## 主要 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 视频
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/{id}` - 获取视频详情
- `POST /api/videos/{id}/views` - 增加观看次数
- `GET /api/videos/search?keyword=xxx` - 搜索视频

### 分类
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/{id}` - 获取分类详情

### 标签
- `GET /api/tags` - 获取所有标签
- `GET /api/tags/{id}` - 获取标签详情

## 默认凭证

- **用户名**: admin
- **密码**: admin123

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SPRING_DATASOURCE_URL` | 数据库连接字符串 | jdbc:mysql://localhost:5506/video_showcase |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名 | root |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 | root_password |
| `JWT_SECRET` | JWT 密钥 | your-secret-key-... |
| `JWT_EXPIRATION` | Token 过期时间（毫秒） | 86400000 |

## 项目结构

```
src/main/java/com/videoshowcase/
├── config/           # 配置类
├── controller/       # 控制器
├── entity/           # 数据库实体
├── repository/       # 数据访问层
├── service/          # 业务逻辑层
├── security/         # 安全相关
├── dto/              # 数据传输对象
├── exception/        # 异常处理
└── util/             # 工具类
```

## 常见问题

### 1. JWT Token 验证失败
确保 `application.yml` 中的 `jwt.secret` 足够长（至少 32 个字符）。

### 2. 数据库连接失败
检查 MySQL 是否运行，以及连接字符串是否正确。

### 3. Swagger UI 无法访问
确保应用已启动，访问 http://localhost:8080/api/swagger-ui.html

## 许可证

MIT License
