# 后端代码

## 下载链接

后端代码已压缩并上传到云存储，您可以通过以下链接下载：

**[下载后端代码 (backend.tar.gz)](https://files.manuscdn.com/user_upload_by_module/session_file/310519663292706283/kmGHfIpjjSMsHaAe.gz)**

## 文件大小

约 100 KB

## 解压方式

### Linux/Mac
```bash
tar -xzf backend.tar.gz
```

### Windows
使用 7-Zip、WinRAR 或其他解压工具解压 `.tar.gz` 文件

## 主要修改

### 1. Video 实体类 (`src/main/java/com/videoshowcase/entity/Video.java`)
- 添加了 `@Transient` 的 `categoryId` 字段
- 添加了 `@PostLoad` 方法，用于从 category 对象中提取 ID
- 添加了 `@JsonProperty("categoryId")` 注解，使 JSON 序列化时包含 categoryId

### 2. VideoController (`src/main/java/com/videoshowcase/controller/VideoController.java`)
- 修改了 `createVideo` 方法，处理 categoryId 的转换
- 修改了 `updateVideo` 方法，处理 categoryId 的转换
- 添加了 CategoryService 依赖注入

## 部署步骤

1. **解压文件**
   ```bash
   tar -xzf backend.tar.gz
   cd backend
   ```

2. **编译代码**
   ```bash
   mvn clean package
   ```

3. **运行应用**
   ```bash
   java -jar target/video-showcase-backend-1.0.0.jar
   ```

   或使用 Docker：
   ```bash
   docker-compose up -d
   ```

## 功能说明

修复后，前端可以正常保存和编辑视频的分类：

- **新建视频时** - 可以选择分类，分类会正确保存到数据库
- **编辑视频时** - 分类会自动显示当前选中的分类
- **查看视频时** - 分类信息会正确返回给前端

## 注意事项

- 确保数据库中已经有分类数据
- 确保后端服务正确连接到数据库
- 前端发送的 `categoryId` 必须是有效的分类 ID
