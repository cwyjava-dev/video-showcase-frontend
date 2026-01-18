import axios, { AxiosInstance } from 'axios';

/**
 * API 服务类
 * 用于与 Spring Boot 后端通信
 */
class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 从环境变量或默认值获取 API 地址
    // 在 Docker 中，使用 http://backend:8080/api
    // 在本地开发中，使用 http://localhost:8080/api
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      this.baseURL = apiUrl;
    } else {
      // 判断是否是 Docker 环境
      const isDocker = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      if (isDocker) {
        // 在 Docker 中，使用主机 IP 地址
        this.baseURL = `http://${window.location.hostname}:8080/api`;
      } else {
        // 本地开发
        this.baseURL = 'http://localhost:8080/api';
      }
    }
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器 - 添加 JWT Token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器 - 处理错误
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token 过期，清除本地存储并重定向到登录
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== 认证相关 ====================

  /**
   * 用户登录
   */
  async login(username: string, password: string) {
    try {
      const response = await this.api.post('/auth/login', {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || '登录失败',
      };
    }
  }

  /**
   * 用户注册
   */
  async register(username: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  /**
   * 用户登出
   */
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return this.api.post('/auth/logout');
  }

  // ==================== 视频相关 ====================

  /**
   * 获取视频列表
   */
  async getVideos(params?: {
    page?: number;
    size?: number;
    categoryId?: number;
    search?: string;
  }) {
    const response = await this.api.get('/videos', { params });
    return response.data;
  }

  /**
   * 获取视频详情
   */
  async getVideoById(id: number) {
    const response = await this.api.get(`/videos/${id}`);
    return response.data;
  }

  /**
   * 创建视频
   */
  async createVideo(data: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    categoryId?: number;
    tags?: number[];
  }) {
    const response = await this.api.post('/videos', data);
    return response.data;
  }

  /**
   * 更新视频
   */
  async updateVideo(
    id: number,
    data: {
      title?: string;
      description?: string;
      categoryId?: number;
      tags?: number[];
    }
  ) {
    const response = await this.api.put(`/videos/${id}`, data);
    return response.data;
  }

  /**
   * 删除视频
   */
  async deleteVideo(id: number) {
    const response = await this.api.delete(`/videos/${id}`);
    return response.data;
  }

  /**
   * 增加视频观看次数
   */
  async incrementVideoViews(id: number) {
    const response = await this.api.post(`/videos/${id}/views`);
    return response.data;
  }

  /**
   * 点赞视频
   */
  async likeVideo(id: number) {
    const response = await this.api.post(`/videos/${id}/like`);
    return response.data;
  }

  /**
   * 获取视频的标签
   */
  async getVideoTags(videoId: number) {
    const response = await this.api.get(`/videos/${videoId}/tags`);
    return response.data;
  }

  // ==================== 分类相关 ====================

  /**
   * 获取所有分类
   */
  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data;
  }

  /**
   * 创建分类（仅管理员）
   */
  async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
  }) {
    const response = await this.api.post('/categories', data);
    return response.data;
  }

  /**
   * 更新分类（仅管理员）
   */
  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
      color?: string;
    }
  ) {
    const response = await this.api.put(`/categories/${id}`, data);
    return response.data;
  }

  /**
   * 删除分类（仅管理员）
   */
  async deleteCategory(id: number) {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data;
  }

  // ==================== 标签相关 ====================

  /**
   * 获取所有标签
   */
  async getTags() {
    const response = await this.api.get('/tags');
    return response.data;
  }

  /**
   * 创建标签（仅管理员）
   */
  async createTag(data: {
    name: string;
    description?: string;
    color?: string;
  }) {
    const response = await this.api.post('/tags', data);
    return response.data;
  }

  /**
   * 更新标签（仅管理员）
   */
  async updateTag(
    id: number,
    data: {
      name?: string;
      description?: string;
      color?: string;
    }
  ) {
    const response = await this.api.put(`/tags/${id}`, data);
    return response.data;
  }

  /**
   * 删除标签（仅管理员）
   */
  async deleteTag(id: number) {
    const response = await this.api.delete(`/tags/${id}`);
    return response.data;
  }

  // ==================== 用户管理 ====================

  /**
   * 获取所有用户
   */
  async getUsers() {
    const response = await this.api.get('/users');
    return response.data;
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  /**
   * 创建用户（仅管理员）
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  /**
   * 更新用户（仅管理员）
   */
  async updateUser(
    id: number,
    data: {
      email?: string;
      displayName?: string;
      password?: string;
      role?: 'USER' | 'ADMIN';
    }
  ) {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  /**
   * 删除用户（仅管理员）
   */
  async deleteUser(id: number) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // ==================== 文件上传 ====================

  /**
   * 上传文件
   */
  async uploadFile(file: File, type: 'video' | 'thumbnail' = 'video') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// 导出单例
export const apiService = new ApiService();

// 导出类型
export type { AxiosInstance };
