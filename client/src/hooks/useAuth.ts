import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 认证 Hook
 * 管理用户认证状态
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setState({
            user,
            token,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: '初始化认证失败',
        }));
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await apiService.login(username, password);
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // 注册
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await apiService.register(username, email, password);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : '注册失败';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw error;
      }
    },
    []
  );

  // 登出
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '登出失败';
      setState((prev) => ({
        ...prev,
        error: message,
      }));
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.user && !!state.token,
  };
}
