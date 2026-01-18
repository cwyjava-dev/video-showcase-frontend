import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

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
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 视频管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  视频管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  管理视频内容、上传新视频、编辑视频信息
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/videos">进入视频管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 分类管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📁 分类管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  创建和管理视频分类，组织内容结构
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/categories">进入分类管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 标签管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏷️ 标签管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  创建和管理视频标签，方便内容分类
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/tags">进入标签管理</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 用户管理 */}
            <Card className="border-border/50 hover:shadow-elegant-lg transition-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👥 用户管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  管理平台用户、权限和账户信息
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/users">进入用户管理</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 快速统计 */}
          <Card className="mt-8 border-border/50">
            <CardHeader>
              <CardTitle>平台统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">-</div>
                  <p className="text-sm text-muted-foreground mt-2">总视频数</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">-</div>
                  <p className="text-sm text-muted-foreground mt-2">总用户数</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">-</div>
                  <p className="text-sm text-muted-foreground mt-2">总分类数</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">-</div>
                  <p className="text-sm text-muted-foreground mt-2">总标签数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
