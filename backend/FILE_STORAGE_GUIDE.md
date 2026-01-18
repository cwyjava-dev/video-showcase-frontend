# 本地文件存储配置指南

## 概述

本项目支持本地文件存储，无需依赖 AWS S3 或其他云存储服务。您可以完全自定义视频和其他文件的存储位置。

## 配置方式

### 1. 修改存储路径

编辑 `src/main/resources/application.yml`：

```yaml
file:
  storage:
    path: /data/videos        # 修改为您想要的存储路径
    url: http://localhost:8080/api/files  # 文件访问 URL
  upload:
    max-size: 104857600       # 最大文件大小（100MB）
```

### 2. Docker 部署中的存储配置

在 `docker-compose.yml` 中配置数据卷：

```yaml
backend:
  volumes:
    - video_storage:/data/videos  # Docker 卷映射
    # 或使用本地路径
    - /home/user/my_videos:/data/videos
```

### 3. 环境变量配置

启动时可通过环境变量覆盖配置：

```bash
docker run -e FILE_STORAGE_PATH=/custom/path \
           -e FILE_STORAGE_URL=http://your-domain/api/files \
           video-showcase-backend:latest
```

## 存储目录结构

```
/data/videos/
├── videos/          # 视频文件存储目录
│   ├── uuid1.mp4
│   ├── uuid2.mkv
│   └── ...
├── thumbnails/      # 缩略图存储目录
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── ...
└── uploads/         # 其他上传文件
    └── ...
```

## API 接口

### 上传视频

```bash
curl -X POST http://localhost:8080/api/files/upload/video \
  -F "file=@/path/to/video.mp4" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例：**
```json
{
  "success": true,
  "url": "http://localhost:8080/api/files/videos/uuid.mp4",
  "filename": "video.mp4",
  "size": 1024000
}
```

### 上传缩略图

```bash
curl -X POST http://localhost:8080/api/files/upload/thumbnail \
  -F "file=@/path/to/thumbnail.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 获取存储信息

```bash
curl http://localhost:8080/api/files/storage-info
```

**响应示例：**
```json
{
  "storagePath": "/data/videos",
  "storageUrl": "http://localhost:8080/api/files"
}
```

## 文件访问

上传的文件可通过以下 URL 访问：

```
http://localhost:8080/api/files/videos/uuid.mp4
http://localhost:8080/api/files/thumbnails/uuid.jpg
```

## 本地开发

### 1. 创建存储目录

```bash
mkdir -p /data/videos/videos
mkdir -p /data/videos/thumbnails
chmod -R 755 /data/videos
```

### 2. 启动应用

```bash
mvn spring-boot:run
```

### 3. 上传文件

```bash
curl -X POST http://localhost:8080/api/files/upload/video \
  -F "file=@/path/to/video.mp4"
```

## Docker 部署

### 1. 使用 Docker 卷

```bash
docker-compose up -d
```

文件将存储在 Docker 卷 `video_storage` 中。

### 2. 使用本地路径

修改 `docker-compose.yml`：

```yaml
backend:
  volumes:
    - /home/user/my_videos:/data/videos
```

然后启动：

```bash
docker-compose up -d
```

### 3. 查看存储的文件

```bash
# 如果使用 Docker 卷
docker exec video-showcase-backend ls -la /data/videos/videos/

# 如果使用本地路径
ls -la /home/user/my_videos/videos/
```

## 生产环境配置

### 1. 使用高性能存储

建议使用 SSD 或 NAS 作为存储后端：

```yaml
file:
  storage:
    path: /mnt/storage/videos  # 挂载的高性能存储
```

### 2. 配置备份

定期备份存储目录：

```bash
# 每天备份
0 2 * * * tar -czf /backup/videos-$(date +\%Y\%m\%d).tar.gz /data/videos/
```

### 3. 配置权限

```bash
# 创建专用用户
useradd -m -d /data/videos video-user

# 设置权限
chown -R video-user:video-user /data/videos
chmod -R 750 /data/videos
```

### 4. 监控磁盘空间

```bash
# 检查磁盘使用情况
du -sh /data/videos/

# 设置告警（如果磁盘使用超过 80%）
df /data/videos | awk 'NR==2 {if ($5+0 > 80) print "Disk usage alert"}'
```

## 常见问题

### Q1: 如何修改存储路径？
A: 修改 `application.yml` 中的 `file.storage.path` 或设置环境变量 `FILE_STORAGE_PATH`。

### Q2: 文件上传失败怎么办？
A: 
1. 检查存储目录是否存在且有写权限
2. 检查文件大小是否超过限制
3. 查看应用日志获取详细错误信息

### Q3: 如何清理旧文件？
A: 
```bash
# 删除 30 天前的文件
find /data/videos -type f -mtime +30 -delete
```

### Q4: 如何迁移文件到新位置？
A:
```bash
# 复制所有文件到新位置
cp -r /data/videos/* /new/location/

# 更新配置指向新位置
# 然后重启应用
```

### Q5: 支持的文件类型有哪些？
A: 任何文件类型都支持，但建议限制视频文件为常见格式（mp4, mkv, avi, mov 等）。

## 性能优化

### 1. 使用 CDN 加速

配置 CDN 来加速文件访问：

```yaml
file:
  storage:
    url: https://cdn.example.com/videos  # CDN URL
```

### 2. 启用缓存

在 Nginx 中配置缓存：

```nginx
location /api/files/ {
    proxy_pass http://backend:8080/api/files/;
    proxy_cache my_cache;
    proxy_cache_valid 200 7d;
}
```

### 3. 异步上传

对于大文件，考虑实现分块上传和异步处理。

## 安全建议

1. **限制文件类型** - 只允许特定的文件类型
2. **验证文件内容** - 检查文件头而不仅仅是扩展名
3. **隔离存储** - 将存储目录与应用代码分离
4. **访问控制** - 实现基于用户的访问控制
5. **定期备份** - 定期备份重要文件

## 支持

如有问题，请查看应用日志或提交 Issue。
