# 🐳 Docker 部署指南

本指南将帮助您使用 Docker 和 Docker Compose 部署视频展示平台。

---

## 📋 前置要求

- ✅ 已安装 Docker（版本 20.10+）
- ✅ 已安装 Docker Compose（版本 1.29+）
- ✅ 至少 2GB 可用内存
- ✅ 至少 5GB 可用磁盘空间

### 检查 Docker 安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version

# 测试 Docker 是否正常工作
docker run hello-world
```

---

## 🚀 快速开始（3 步）

### 第 1 步：克隆或下载项目

```bash
# 如果从 GitHub 克隆
git clone <your-github-repo-url>
cd video-showcase

# 或者直接进入项目目录
cd /path/to/video-showcase
```

### 第 2 步：启动所有服务

```bash
# 构建并启动所有容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 第 3 步：访问应用

```
前端应用: http://localhost:3000
后端 API: http://localhost:8080/api
Swagger 文档: http://localhost:8080/api/swagger-ui.html
Nginx: http://localhost:80
```

---

## 📊 Docker Compose 服务详解

### 1. MySQL 数据库

```yaml
mysql:
  - 端口: 3306
  - 用户名: root
  - 密码: root_password
  - 数据库: video_showcase
  - 数据卷: mysql_data
```

**连接数据库：**

```bash
# 进入 MySQL 容器
docker-compose exec mysql mysql -u root -p

# 输入密码: root_password

# 查看数据库
SHOW DATABASES;
USE video_showcase;
SHOW TABLES;
```

### 2. 前端应用

```yaml
frontend:
  - 端口: 3000
  - 框架: React 19 + Vite
  - 构建: 多阶段 Docker 构建
```

### 3. 后端应用

```yaml
backend:
  - 端口: 8080
  - 框架: Spring Boot 3.1
  - 数据库: MySQL
```

### 4. Nginx 反向代理

```yaml
nginx:
  - 端口: 80 (HTTP)
  - 端口: 443 (HTTPS - 可选)
  - 功能: 反向代理、负载均衡、SSL/TLS
```

---

## 🛠️ 常用命令

### 启动和停止

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 停止并删除所有数据（谨慎使用）
docker-compose down -v

# 重启特定服务
docker-compose restart frontend
docker-compose restart backend
docker-compose restart mysql
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mysql

# 实时查看日志
docker-compose logs -f

# 查看最后 100 行日志
docker-compose logs --tail=100
```

### 进入容器

```bash
# 进入前端容器
docker-compose exec frontend sh

# 进入后端容器
docker-compose exec backend bash

# 进入 MySQL 容器
docker-compose exec mysql bash
```

### 构建和更新

```bash
# 重新构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 只构建特定服务
docker-compose build frontend
```

### 查看状态

```bash
# 查看容器状态
docker-compose ps

# 查看容器详细信息
docker-compose ps -a

# 查看网络
docker network ls

# 查看卷
docker volume ls
```

---

## 🔧 配置说明

### 环境变量

编辑 `docker-compose.yml` 中的环境变量：

```yaml
environment:
  - NODE_ENV=production
  - VITE_API_URL=http://localhost:8080/api
  - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/video_showcase
  - JWT_SECRET=your-secret-key-change-this
```

### 端口映射

| 服务 | 容器端口 | 主机端口 | 用途 |
|------|---------|---------|------|
| MySQL | 3306 | 3306 | 数据库 |
| 前端 | 3000 | 3000 | React 应用 |
| 后端 | 8080 | 8080 | Spring Boot API |
| Nginx | 80 | 80 | HTTP 反向代理 |
| Nginx | 443 | 443 | HTTPS 反向代理 |

### 数据卷

```yaml
volumes:
  mysql_data:
    # MySQL 数据持久化
    # 位置: /var/lib/docker/volumes/video-showcase_mysql_data/_data
```

---

## 🌐 网络配置

所有服务都连接到 `video-showcase-network` 网络：

```bash
# 查看网络
docker network inspect video-showcase_video-showcase-network

# 容器间通信
# 前端可以访问后端: http://backend:8080
# 后端可以访问数据库: mysql://mysql:3306
```

---

## 📝 日志和监控

### 查看容器资源使用

```bash
# 实时监控
docker stats

# 查看特定容器
docker stats video-showcase-frontend
```

### 查看容器事件

```bash
# 查看所有事件
docker events

# 查看特定容器事件
docker events --filter container=video-showcase-frontend
```

---

## 🔒 安全建议

### 1. 更改默认密码

编辑 `docker-compose.yml`：

```yaml
environment:
  MYSQL_ROOT_PASSWORD: your-secure-password
  JWT_SECRET: your-long-random-secret-key
```

### 2. 配置 SSL/TLS

取消注释 `nginx.conf` 中的 HTTPS 部分，并添加证书文件。

### 3. 限制容器资源

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4. 使用环境文件

创建 `.env` 文件：

```bash
MYSQL_ROOT_PASSWORD=secure_password
MYSQL_DATABASE=video_showcase
JWT_SECRET=your-secret-key
NODE_ENV=production
```

在 `docker-compose.yml` 中引用：

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
```

---

## 🐛 故障排查

### 问题 1：容器无法启动

```bash
# 查看错误日志
docker-compose logs <service-name>

# 检查容器状态
docker-compose ps

# 重启容器
docker-compose restart <service-name>
```

### 问题 2：数据库连接失败

```bash
# 检查 MySQL 是否运行
docker-compose ps mysql

# 进入 MySQL 容器测试
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# 检查网络连接
docker-compose exec frontend ping mysql
```

### 问题 3：端口被占用

```bash
# 查看占用的端口
lsof -i :3000
lsof -i :8080
lsof -i :3306

# 修改 docker-compose.yml 中的端口映射
# 例如: "3001:3000" 将容器的 3000 端口映射到主机的 3001 端口
```

### 问题 4：内存不足

```bash
# 检查可用内存
free -h

# 清理 Docker 资源
docker system prune -a

# 限制容器内存使用
docker-compose down
# 编辑 docker-compose.yml 添加资源限制
docker-compose up -d
```

---

## 📈 性能优化

### 1. 多阶段构建

前端 Dockerfile 已使用多阶段构建，减少镜像大小。

### 2. 缓存优化

```bash
# 使用构建缓存
docker-compose build --no-cache

# 查看镜像大小
docker images
```

### 3. 日志轮转

在 `docker-compose.yml` 中配置：

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🚢 生产部署

### 1. 使用生产配置

```bash
# 创建 docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. 配置反向代理

使用 Nginx 或 Traefik 作为反向代理。

### 3. 设置监控和告警

使用 Prometheus、Grafana 等工具进行监控。

### 4. 定期备份

```bash
# 备份 MySQL 数据
docker-compose exec mysql mysqldump -u root -p video_showcase > backup.sql

# 备份数据卷
docker run --rm -v video-showcase_mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz -C /data .
```

---

## 📞 获取帮助

- 查看 Docker 官方文档：https://docs.docker.com/
- 查看 Docker Compose 文档：https://docs.docker.com/compose/
- 查看项目 README：./README.md

---

**祝您部署顺利！** 🎉
