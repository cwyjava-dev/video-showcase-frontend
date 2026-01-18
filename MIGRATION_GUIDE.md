# 🔄 从 Node.js 后端迁移到 Spring Boot 后端

本指南说明如何将前端项目从 tRPC + Node.js 后端迁移到使用 Spring Boot 后端。

---

## 📝 变更说明

### 移除的内容

- ✗ `server/` 目录（Node.js tRPC 后端）
- ✗ `drizzle/` 目录（Drizzle ORM 数据库配置）
- ✗ tRPC 相关依赖
- ✗ Express 依赖
- ✗ 数据库相关依赖（mysql2, drizzle-orm, drizzle-kit）

### 新增的内容

- ✅ `client/src/lib/api.ts` - Axios API 服务类
- ✅ `client/src/hooks/useAuth.ts` - 认证 Hook
- ✅ 简化的 `package.json` 脚本

---

## 🔧 迁移步骤

### 1. 更新 package.json

已自动更新以下内容：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run"
  }
}
```

### 2. 安装依赖

```bash
cd /home/ubuntu/video-showcase
pnpm install
```

### 3. 更新 API 调用

#### 旧方式（tRPC）

```typescript
const { data } = trpc.videos.useQuery();
```

#### 新方式（Axios）

```typescript
import { apiService } from '@/lib/api';

// 获取视频列表
const videos = await apiService.getVideos();

// 创建视频
await apiService.createVideo({
  title: '视频标题',
  videoUrl: 'https://...',
});
```

### 4. 更新认证逻辑

#### 旧方式

```typescript
const { user } = useAuth();
```

#### 新方式

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

---

## 📚 API 服务方法

### 认证相关

```typescript
// 登录
await apiService.login(username, password);

// 注册
await apiService.register(username, email, password);

// 获取当前用户
await apiService.getCurrentUser();

// 登出
await apiService.logout();
```

### 视频相关

```typescript
// 获取视频列表
await apiService.getVideos({ page: 1, size: 10 });

// 获取视频详情
await apiService.getVideoById(1);

// 创建视频
await apiService.createVideo({ title, videoUrl });

// 更新视频
await apiService.updateVideo(id, { title, description });

// 删除视频
await apiService.deleteVideo(id);

// 增加观看次数
await apiService.incrementVideoViews(id);

// 点赞视频
await apiService.likeVideo(id);
```

### 分类相关

```typescript
// 获取所有分类
await apiService.getCategories();

// 创建分类
await apiService.createCategory({ name, description });

// 更新分类
await apiService.updateCategory(id, { name });

// 删除分类
await apiService.deleteCategory(id);
```

### 标签相关

```typescript
// 获取所有标签
await apiService.getTags();

// 创建标签
await apiService.createTag({ name });

// 更新标签
await apiService.updateTag(id, { name });

// 删除标签
await apiService.deleteTag(id);
```

### 文件上传

```typescript
// 上传视频
await apiService.uploadFile(videoFile, 'video');

// 上传缩略图
await apiService.uploadFile(thumbnailFile, 'thumbnail');
```

---

## 🔐 认证配置

### 环境变量

在 `.env` 或 `docker-compose.yml` 中配置：

```bash
VITE_API_URL=http://localhost:8080/api
```

### Token 管理

Token 自动保存到 `localStorage`：

```typescript
// 自动添加到请求头
// Authorization: Bearer <token>

// 登出时自动清除
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## 🚀 启动应用

### 开发模式

```bash
pnpm dev
```

访问：http://localhost:5173

### 生产构建

```bash
pnpm build
pnpm preview
```

### Docker 部署

```bash
docker-compose up -d
```

访问：http://localhost:3003

---

## 📋 迁移检查清单

- [ ] 已删除 `server/` 目录
- [ ] 已删除 `drizzle/` 目录
- [ ] 已更新 `package.json`
- [ ] 已安装新依赖：`pnpm install`
- [ ] 已更新 API 调用代码
- [ ] 已更新认证逻辑
- [ ] 已配置 `VITE_API_URL` 环境变量
- [ ] 已测试前端应用
- [ ] 已确保 Spring Boot 后端正常运行
- [ ] 已验证前后端通信

---

## 🔍 常见问题

### Q: 如何处理 CORS 问题？

A: 确保 Spring Boot 后端配置了 CORS：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3003"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        // ...
    }
}
```

### Q: 如何处理 Token 过期？

A: API 服务已自动处理：

```typescript
// 响应拦截器会自动处理 401 错误
// 清除 Token 并重定向到登录页面
```

### Q: 如何添加新的 API 端点？

A: 在 `client/src/lib/api.ts` 中添加方法：

```typescript
async getNewData() {
  const response = await this.api.get('/new-endpoint');
  return response.data;
}
```

### Q: 如何处理错误？

A: 使用 try-catch：

```typescript
try {
  await apiService.login(username, password);
} catch (error) {
  console.error('登录失败:', error);
}
```

---

## 📞 后续步骤

1. **完成 Spring Boot 后端开发** - 实现所有必要的 API 端点
2. **更新前端页面** - 替换所有 tRPC 调用为 Axios 调用
3. **测试集成** - 全面测试前后端集成
4. **部署** - 使用 Docker Compose 部署到生产环境

---

**迁移完成！现在您的前端项目已准备好与 Spring Boot 后端集成。** 🎉
