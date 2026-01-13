import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Film, Tag, FolderOpen, ArrowLeft, Video, Plus } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useEffect } from "react";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminTags from "@/components/admin/AdminTags";

export default function AdminDashboard() {
  const { section } = useParams<{ section?: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  const { data: videos = [] } = trpc.admin.videos.list.useQuery();
  const { data: categories = [] } = trpc.admin.categories.list.useQuery();
  const { data: tags = [] } = trpc.admin.tags.list.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const currentSection = section || "overview";

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
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-elegant">
                  <Film className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">管理后台</h1>
                  <p className="text-xs text-muted-foreground">视频展示平台</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
              <span className="text-sm">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="border-border/50 sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={currentSection === "overview" ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setLocation("/admin")}
                  >
                    <Film className="w-4 h-4" />
                    概览
                  </Button>
                  <Button
                    variant={currentSection === "videos" ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setLocation("/admin/videos")}
                  >
                    <Video className="w-4 h-4" />
                    视频管理
                  </Button>
                  <Button
                    variant={currentSection === "categories" ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setLocation("/admin/categories")}
                  >
                    <FolderOpen className="w-4 h-4" />
                    分类管理
                  </Button>
                  <Button
                    variant={currentSection === "tags" ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setLocation("/admin/tags")}
                  >
                    <Tag className="w-4 h-4" />
                    标签管理
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {currentSection === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">概览</h2>
                  <p className="text-muted-foreground">管理您的视频平台内容</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50 hover:shadow-elegant transition-elegant">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        视频总数
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{videos.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        已发布: {videos.filter(v => v.status === 'published').length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:shadow-elegant transition-elegant">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        分类数量
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{categories.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:shadow-elegant transition-elegant">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        标签数量
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{tags.length}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setLocation("/admin/videos")}
                    >
                      <Plus className="w-6 h-6" />
                      <span>上传视频</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setLocation("/admin/categories")}
                    >
                      <Plus className="w-6 h-6" />
                      <span>添加分类</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setLocation("/admin/tags")}
                    >
                      <Plus className="w-6 h-6" />
                      <span>添加标签</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentSection === "videos" && <AdminVideos />}
            {currentSection === "categories" && <AdminCategories />}
            {currentSection === "tags" && <AdminTags />}
          </main>
        </div>
      </div>
    </div>
  );
}
