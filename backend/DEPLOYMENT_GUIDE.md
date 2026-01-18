# Spring Boot 后端部署指南

## 系统要求

### 本地开发
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Docker 部署
- Docker 20.10+
- Docker Compose 2.0+

## 本地开发

### 1. 启动 MySQL
```bash
docker run -d \
  -p 5506:3306 \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=video_showcase \
  -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql \
  mysql:8.0
```

### 2. 构建项目
```bash
mvn clean install
```

### 3. 启动应用
```bash
mvn spring-boot:run
```

应用将在 http://localhost:8080 启动。

## Docker Compose 部署

### 快速启动
```bash
docker-compose up -d
```

### 查看日志
```bash
docker-compose logs -f backend
```

### 停止服务
```bash
docker-compose down
```

## 默认凭证

- **用户名**: admin
- **密码**: admin123

## API 文档

启动应用后访问：
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/v3/api-docs

## 主要 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 视频
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/{id}` - 获取视频详情
- `GET /api/videos/search?keyword=xxx` - 搜索视频

### 分类和标签
- `GET /api/categories` - 获取所有分类
- `GET /api/tags` - 获取所有标签

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SPRING_DATASOURCE_URL` | 数据库连接字符串 | jdbc:mysql://localhost:5506/video_showcase |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名 | root |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 | root_password |
| `JWT_SECRET` | JWT 密钥 | your-secret-key-... |

## 常见问题

### Q: 数据库连接失败怎么办？
A: 检查 MySQL 是否运行，以及连接字符串是否正确。

### Q: 如何查看应用日志？
A: 使用 `docker-compose logs -f backend` 查看日志。

### Q: 如何备份数据库？
A: 使用 `docker exec video-showcase-mysql mysqldump -u root -proot_password video_showcase > backup.sql`
