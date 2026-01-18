import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Film, User, Calendar, Eye, LogOut } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";

interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: string;
  status: "published" | "draft" | "archived";
  fileSize?: number;
  mimeType?: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载视频详情
  useEffect(() => {
    const loadVideo = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getVideoById(parseInt(id));
        setVideo(data);
        
        // 增加观看次数
        await apiService.incrementVideoViews(parseInt(id));
      } catch (err) {
        console.error("加载视频失败:", err);
        setError("视频加载失败");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideo();
  }, [id]);

  // 加载视频标签
  useEffect(() => {
    const loadTags = async () => {
      if (!video?.id) return;
      
      try {
        const data = await apiService.getVideoTags(video.id);
        setTags(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("加载标签失败:", err);
      }
    };
    
    loadTags();
  }, [video?.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">视频未找到</h2>
            <p className="text-muted-foreground mb-6">抱歉，您访问的视频不存在或已被删除。</p>
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-elegant">
                  <Film className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent group-hover:scale-105 transition-elegant">
                  视频展示平台
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {user?.role === "ADMIN" && (
                    <Link href="/admin">
                      <Button variant="outline" className="gap-2">
                        <User className="w-4 h-4" />
                        管理后台
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user?.displayName || user?.username}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button asChild className="gradient-gold">
                  <a href={getLoginUrl()}>登录</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            </div>
          </div>
        ) : video ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden shadow-elegant-lg border-border/50">
                <div className="aspect-video bg-black">
                  <video
                    controls
                    className="w-full h-full"
                    poster={video.thumbnailUrl || undefined}
                    src={video.videoUrl}
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              </Card>

              {/* Video Info */}
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h1 className="text-3xl font-bold">{video.title}</h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{video.views || 0} 次观看</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(video.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {video.duration && (
                      <div className="flex items-center gap-2">
                        <span>时长: {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {video.description && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="font-semibold mb-2">视频简介</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {video.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">视频信息</h3>
                  <div className="space-y-3 text-sm">
                    {video.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">文件大小</span>
                        <span>{(video.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                    {video.mimeType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">格式</span>
                        <span>{video.mimeType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状态</span>
                      <Badge variant={video.status === 'published' ? 'default' : 'secondary'}>
                        {video.status === 'published' ? '已发布' : video.status === 'draft' ? '草稿' : '已归档'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
