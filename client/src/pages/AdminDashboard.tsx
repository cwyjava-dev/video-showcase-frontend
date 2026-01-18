import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, ArrowLeft, Video, FolderOpen, Tag, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState({
    videoCount: 0,
    userCount: 0,
    categoryCount: 0,
    tagCount: 0,
  });

  useEffect(() => {
    // 等待 auth 初始化完成后再检查权限
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchStats();
    }
  }, [isLoading, isAuthenticated]);

  const fetchStats = async () => {
    try {
      const [videos, categories, tags] = await Promise.all([
        apiService.getVideos({ page: 1, size: 1 }),
        apiService.getCategories(),
        apiService.getTags(),
      ]);
      setStats({
        videoCount: videos?.totalElements || 0,
        userCount: 1, // 暂时设为 1，后端需要提供用户统计 API
        categoryCount: categories?.length || 0,
        tagCount: tags?.length || 0,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 初始化中或权限不足，显示加载状态或返回 null
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
                  <Film className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">管理后台</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-12 px-4 lg:px-8">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 视频管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Film className="w-6 h-6" />
                  视频管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-base">
                  管理视频内容、上传新视频、编辑视频信息
                </p>
                <Button asChild className="w-full h-10 text-base">
                  <Link href="/admin/videos">进入视频管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 分类管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FolderOpen className="w-6 h-6" />
                  分类管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-base">
                  创建和管理视频分类，组织内容结构
                </p>
                <Button asChild className="w-full h-10 text-base" variant="outline">
                  <Link href="/admin/categories">进入分类管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 标签管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Tag className="w-6 h-6" />
                  标签管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-base">
                  创建和管理视频标签，方便内容分类
                </p>
                <Button asChild className="w-full h-10 text-base" variant="outline">
                  <Link href="/admin/tags">进入标签管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 用户管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Users className="w-6 h-6" />
                  用户管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-base">
                  管理平台用户、权限和账户信息
                </p>
                <Button asChild className="w-full h-10 text-base" variant="outline">
                  <Link href="/admin/users">进入用户管理</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 快速统计 */}
          <Card className="mt-8 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">平台统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="flex justify-center mb-3">
                    <Video className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{stats.videoCount}</div>
                  <p className="text-base text-muted-foreground mt-3">总视频数</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="flex justify-center mb-3">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{stats.userCount}</div>
                  <p className="text-base text-muted-foreground mt-3">总用户数</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="flex justify-center mb-3">
                    <FolderOpen className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{stats.categoryCount}</div>
                  <p className="text-base text-muted-foreground mt-3">总分类数</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="flex justify-center mb-3">
                    <Tag className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{stats.tagCount}</div>
                  <p className="text-base text-muted-foreground mt-3">总标签数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
