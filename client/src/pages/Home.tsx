import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Search, Film, User, LogOut, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

interface Video {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("加载分类失败:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // 加载标签
  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await apiService.getTags();
        setTags(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("加载标签失败:", error);
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, []);

  // 加载视频列表（带防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadVideos = async () => {
        if (videos.length === 0) {
          setVideosLoading(true);
        }
        try {
          const data = await apiService.getVideos({
            categoryId: selectedCategory,
            search: searchQuery || undefined,
          });
          setVideos(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
          console.error("加载视频失败:", error);
          setVideos([]);
        } finally {
          setVideosLoading(false);
        }
      };
      loadVideos();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              {toggleTheme && (
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="切换主题">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              )}
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

      {/* Hero Section */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              探索精彩视频
              <span className="block mt-2 bg-gradient-gold bg-clip-text text-transparent">
                优雅呈现每一刻
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              发现高质量的视频内容，享受流畅的观看体验
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索视频标题或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-border/30">
        <div className="container">
          {/* Categories */}
          {!categoriesLoading && categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">分类</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === undefined ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  全部
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {!tagsLoading && tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">标签</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12">
        <div className="container">
          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">暂无视频</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || selectedCategory || selectedTags.length > 0
                  ? "未找到符合条件的视频"
                  : "还没有上传任何视频"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link key={video.id} href={`/video/${video.id}`}>
                  <Card className="group overflow-hidden hover:shadow-elegant-lg transition-elegant cursor-pointer border-border/50 hover:border-primary/50">
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-elegant"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-dark">
                          <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-elegant flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs text-white">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-elegant">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{video.views || 0} 次观看</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
