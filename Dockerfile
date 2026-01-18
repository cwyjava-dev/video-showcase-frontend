# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括 devDependencies）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 运行阶段 - 使用 Node.js 提供静态文件
FROM node:22-alpine

WORKDIR /app

# 安装 serve（用于提供静态文件）
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist/public ./dist

# 暴露端口
EXPOSE 3003

# 启动应用 - 使用 serve 提供静态文件
# serve 会自动处理 SPA 路由，将所有请求重定向到 index.html
CMD ["serve", "-s", "dist", "-l", "3003"]
