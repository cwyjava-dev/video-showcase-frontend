# MySQL 字符编码问题修复指南

## 问题描述
数据库中的分类（categories）和标签（tags）显示为乱码，原因是 MySQL 数据库和表的字符编码不是 UTF-8。

## 修复方案

### 1. 数据库层面修复
已在 `init.sql` 中添加字符编码配置：
```sql
-- 创建数据库时指定字符编码
CREATE DATABASE IF NOT EXISTS video_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建表时指定字符编码
CREATE TABLE IF NOT EXISTS categories (
    ...
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. MySQL 容器配置修复
已在 `docker-compose.yml` 中添加 MySQL 启动参数：
```yaml
mysql:
  command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --default-character-set=utf8mb4
```

### 3. Spring Boot 应用配置修复
已在 `application.yml` 和 `docker-compose.yml` 中添加 JDBC 连接参数：
```
jdbc:mysql://mysql:3306/video_showcase?useSSL=false&serverTimezone=UTC&characterEncoding=utf8mb4&useUnicode=true
```

## 重新部署步骤

### 方式一：完全重新初始化（推荐）
```bash
# 停止所有容器并删除数据卷
docker-compose down -v

# 重新启动（会使用新的 init.sql 脚本）
docker-compose up -d

# 查看日志确保启动成功
docker-compose logs -f
```

### 方式二：保留现有数据的修复
如果需要保留现有数据，可以在 MySQL 容器中执行以下命令：

```bash
# 进入 MySQL 容器
docker exec -it video-showcase-mysql mysql -uroot -proot_password

# 在 MySQL 命令行中执行
ALTER DATABASE video_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE videos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE video_tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 验证修复

### 1. 检查数据库字符编码
```bash
docker exec -it video-showcase-mysql mysql -uroot -proot_password -e "SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='video_showcase';"
```

### 2. 检查表字符编码
```bash
docker exec -it video-showcase-mysql mysql -uroot -proot_password -e "SELECT TABLE_NAME, TABLE_COLLATION FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='video_showcase';"
```

### 3. 验证数据显示
访问前端应用并登录，检查分类和标签是否正确显示中文字符。

## 关键文件修改

| 文件 | 修改内容 |
|------|--------|
| `init.sql` | 添加 UTF-8 字符编码配置到数据库和所有表 |
| `application.yml` | 添加 `characterEncoding=utf8mb4&useUnicode=true` 到 JDBC URL |
| `docker-compose.yml` | 添加 MySQL 启动参数和环境变量配置 |

## 技术细节

- **utf8mb4**：MySQL 的完整 UTF-8 实现，支持 4 字节字符（包括 emoji）
- **utf8mb4_unicode_ci**：通用的 Unicode 排序规则，不区分大小写
- **characterEncoding=utf8mb4**：Java JDBC 驱动程序使用的字符编码
- **useUnicode=true**：启用 Unicode 支持

## 常见问题

### Q: 为什么要用 utf8mb4 而不是 utf8？
A: MySQL 的 `utf8` 实际上只支持 3 字节字符，不能存储 emoji 等 4 字节字符。`utf8mb4` 是真正的 UTF-8 实现。

### Q: 修改后旧数据还是乱码怎么办？
A: 需要重新导入数据或使用 `ALTER TABLE ... CONVERT TO CHARACTER SET` 命令重新转换字符编码。

### Q: 如何确保新插入的数据也是 UTF-8？
A: 只要数据库、表和连接字符编码都设置为 utf8mb4，新插入的数据就会自动使用正确的编码。
