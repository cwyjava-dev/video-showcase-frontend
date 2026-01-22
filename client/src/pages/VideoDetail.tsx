import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Share2, MoreVertical, Loader2 } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import YouTubeHeader from "@/components/YouTubeHeader";
import YouTubeSidebar from "@/components/YouTubeSidebar";

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

interface Category {
  id: number;
  name: string;
}

export default function VideoDetail() {
  const params = useParams();
  const videoId = params?.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("加载分类失败:", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!videoId) return;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getVideoById(videoId);
        setVideo(data);

        // 加载相关视频
        const relatedData = await apiService.getVideos({ size: 20 });
        const related = Array.isArray(relatedData)
          ? relatedData.filter((v: Video) => v.id !== videoId)
          : (relatedData.data || []).filter((v: Video) => v.id !== videoId);
        setRelatedVideos(related.slice(0, 10));
      } catch (err) {
        console.error("加载视频失败:", err);
        setError("加载视频失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <YouTubeHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-accent" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <YouTubeHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-foreground">{error || "视频不存在"}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleMenuToggle = () => {
    // 在桌面版本上切换折叠状态，在移动版本上切换打开状态
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleRelatedVideoClick = (relatedVideoId: number) => {
    navigate(`/video/${relatedVideoId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <YouTubeHeader onMenuClick={handleMenuToggle} />

      <div className="flex flex-1 overflow-hidden">
        <YouTubeSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          categories={categories}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main video section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Video player - 自適应大小 */}
                <div className="w-full bg-black rounded-lg overflow-hidden">
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-auto"
                      autoPlay
                    />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-black rounded-lg">
                      <p className="text-muted-foreground">视频不可用</p>
                    </div>
                  )}
                </div>

                {/* Video info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {video.title}
                    </h1>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span>{video.views.toLocaleString()} 次观看</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(video.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <ThumbsUp size={18} />
                          <span>赞</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Share2 size={18} />
                          <span>分享</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <MoreVertical size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <div className="bg-card p-4 rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {video.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Related videos */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  推荐视频
                </h2>
                <div className="space-y-3">
                  {relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo.id}
                      className="group cursor-pointer"
                      onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                    >
                      <div className="flex gap-2">
                        <div className="relative w-32 aspect-video bg-secondary rounded flex-shrink-0">
                          {relatedVideo.thumbnailUrl ? (
                            <img
                              src={relatedVideo.thumbnailUrl}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover rounded group-hover:brightness-75 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary rounded">
                              <span className="text-xs text-muted-foreground">
                                无缩略图
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                            {relatedVideo.title}
                          </h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {relatedVideo.views.toLocaleString()} 次观看
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(relatedVideo.createdAt).toLocaleDateString(
                              "zh-CN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
