import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Share2, MoreVertical, Loader2 } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import YouTubeHeader from "@/components/YouTubeHeader";
import YouTubeSidebar from "@/components/YouTubeSidebar";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import DOMPurify from "dompurify";

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
  videoType?: "LOCAL" | "YOUTUBE" | "BILIBILI";
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
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 提取 YouTube 视频 ID 或返回完整 iframe
  const extractYouTubeId = (input: string): string | null => {
    // 如果是完整的 iframe 代码，直接返回 null 以使用 iframe 渲染
    if (input.includes('<iframe')) {
      return null;
    }
    
    // 提取 YouTube URL 中的视频 ID
    const urlRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const urlMatch = input.match(urlRegex);
    if (urlMatch) return urlMatch[1];
    
    // 如果是纯的视频 ID（没有 / 或 ? 的字符串），直接返回
    if (!/[/?&=]/.test(input) && input.length > 0) {
      return input;
    }
    
    return null;
  };

  // 提取 Bilibili 视频 ID 或返回完整 iframe
  const extractBilibiliId = (input: string): string | null => {
    // 如果是完整的 iframe 代码，直接返回 null 以使用 iframe 渲染
    if (input.includes('<iframe')) {
      return null;
    }
    
    // 提取 Bilibili URL 中的视频 ID
    const urlRegex = /(?:bilibili\.com\/video\/)([^/?]+)|(?:b23\.tv\/)([^/?]+)/;
    const urlMatch = input.match(urlRegex);
    if (urlMatch) return urlMatch[1] || urlMatch[2];
    
    // 如果是纯的 BV ID（BV 开头），直接返回
    if (input.startsWith('BV') || input.startsWith('bv')) {
      return input;
    }
    
    return null;
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              {/* Main video section */}
              <div className="space-y-4">
                {/* Video player container - responsive with proper aspect ratio */}
                <div className="w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {!user ? (
                    <div className="text-center space-y-4">
                      <p className="text-foreground text-lg">请登录后观看视频</p>
                      <Button
                        onClick={() => window.location.href = '/login'}
                        className="gap-2"
                      >
                        登录
                      </Button>
                    </div>
                  ) : video.videoType === "YOUTUBE" && video.videoUrl ? (
                    video.videoUrl.includes('<iframe') ? (
                      <div className="w-full h-full flex items-center justify-center bg-black" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(video.videoUrl, { ALLOWED_TAGS: ['iframe'], ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'style'] }) }} />
                    ) : (
                      <iframe
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        src={`https://www.youtube.com/embed/${extractYouTubeId(video.videoUrl)}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : video.videoType === "BILIBILI" && video.videoUrl ? (
                    video.videoUrl.includes('<iframe') ? (
                      <div className="w-full h-full flex items-center justify-center bg-black" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(video.videoUrl, { ALLOWED_TAGS: ['iframe'], ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'style'] }) }} />
                    ) : (
                      <iframe
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        src={`https://player.bilibili.com/player.html?bvid=${extractBilibiliId(video.videoUrl)}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : video.videoType === "LOCAL" && video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                    />
                  ) : (
                    <div className="text-center">
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

              {/* Related videos section */}
              <div>
                <h2 className="text-lg font-bold mb-4">相关视频</h2>
                <div className="space-y-3">
                  {relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo.id}
                      className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                    >
                      {relatedVideo.thumbnailUrl && (
                        <img
                          src={relatedVideo.thumbnailUrl}
                          alt={relatedVideo.title}
                          className="w-24 h-14 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {relatedVideo.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {relatedVideo.views.toLocaleString()} 次观看
                        </p>
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
