# 🔌 端口配置说明

本文档说明了 Docker 部署中各服务的端口配置。

---

## 📊 端口映射表

| 服务 | 容器内部端口 | 主机映射端口 | 用途 | 访问地址 |
|------|------------|-----------|------|---------|
| MySQL | 3306 | **5506** | 数据库 | `localhost:5506` |
| 前端 | 3000 | **3003** | React 应用 | `http://localhost:3003` |
| 后端 | 8080 | 8080 | Spring Boot API | `http://localhost:8080/api` |
| Nginx | 80 | 80 | HTTP 反向代理 | `http://localhost` |
| Nginx | 443 | 443 | HTTPS 反向代理 | `https://localhost` |

---

## 🔧 配置文件位置

### docker-compose.yml

```yaml
services:
  mysql:
    ports:
      - "5506:3306"  # MySQL 端口映射

  frontend:
    ports:
      - "3003:3000"  # 前端端口映射
```

### nginx.conf

```nginx
upstream frontend {
    server frontend:3000;  # 容器内部端口
}
```

---

## 📝 修改端口步骤

### 1. 修改 MySQL 端口

编辑 `docker-compose.yml`：

```yaml
mysql:
  ports:
    - "5506:3306"  # 改为您需要的端口
```

### 2. 修改前端端口

编辑 `docker-compose.yml`：

```yaml
frontend:
  ports:
    - "3003:3000"  # 改为您需要的端口
```

### 3. 重启服务

```bash
# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

---

## 🌐 访问应用

### 使用新端口访问

```bash
# 前端应用
http://localhost:3003

# 后端 API
http://localhost:8080/api

# Swagger 文档
http://localhost:8080/api/swagger-ui.html

# 数据库连接
mysql -h localhost -P 5506 -u root -p
```

---

## ⚠️ 注意事项

### 1. 容器内部端口不变

容器内部的端口（冒号后面的数字）不应该改变：
- MySQL 容器内部始终是 3306
- 前端容器内部始终是 3000
- 后端容器内部始终是 8080

### 2. 主机端口可自定义

主机映射端口（冒号前面的数字）可以根据需要修改：
- 避免与其他应用冲突
- 确保有足够的权限（1024 以下需要 root）

### 3. 环境变量配置

如果修改了端口，需要更新相应的环境变量：

```yaml
frontend:
  environment:
    - VITE_API_URL=http://localhost:8080/api
    - VITE_FRONTEND_PORT=3003
```

---

## 🔍 检查端口占用

### Linux/Mac

```bash
# 查看特定端口
lsof -i :3003
lsof -i :5506
lsof -i :8080

# 查看所有监听端口
netstat -tuln | grep LISTEN
```

### Windows

```bash
# 查看特定端口
netstat -ano | findstr :3003
netstat -ano | findstr :5506

# 查看所有监听端口
netstat -ano | findstr LISTENING
```

---

## 🚀 快速参考

### 启动服务

```bash
cd /home/ubuntu/video-showcase
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 进入容器

```bash
# 进入前端容器
docker-compose exec frontend sh

# 进入 MySQL 容器
docker-compose exec mysql bash
```

---

## 📞 常见问题

### Q: 为什么要改端口？

A: 避免与本地其他应用冲突。例如，如果您的系统已经在 3000 端口运行其他应用，就需要改为其他端口。

### Q: 改了端口后前端无法连接后端？

A: 确保 `VITE_API_URL` 环境变量指向正确的后端地址：
```yaml
environment:
  - VITE_API_URL=http://localhost:8080/api
```

### Q: 如何在生产环境使用不同的端口？

A: 创建 `docker-compose.prod.yml` 文件，覆盖端口配置：
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

**当前配置：** MySQL 5506 | 前端 3003 | 后端 8080
