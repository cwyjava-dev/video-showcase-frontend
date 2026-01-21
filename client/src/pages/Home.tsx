import { apiService } from "@/lib/api";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import YouTubeHeader from "@/components/YouTubeHeader";
import YouTubeSidebar from "@/components/YouTubeSidebar";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { Loader2 } from "lucide-react";

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

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videosLoading, setVideosLoading] = useState(false); // 初始化为 false，不显示加载动画
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); // 延迟显示加载动画
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据窗口宽度计算网格列数
  const getGridColumns = () => {
    if (windowWidth < 600) return 1;
    if (windowWidth < 980) return 2;
    if (windowWidth < 2000) return 3;
    return 4;
  };

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

  // 加载视频列表（带防抖和延迟加载动画）
  useEffect(() => {
    setVideosLoading(true); // 标记为加载中
    setShowLoadingSpinner(false); // 先不显示加载动画
    
    // 延迟 1 秒后才显示加载动画
    const spinnerTimer = setTimeout(() => {
      setShowLoadingSpinner(true);
    }, 1000);

    // 防抖延迟
    const timer = setTimeout(() => {
      const loadVideos = async () => {
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
          setShowLoadingSpinner(false); // 加载完成，隐藏加载动画
        }
      };
      loadVideos();
    }, 300); // 防抖延迟 300ms

    return () => {
      clearTimeout(timer);
      clearTimeout(spinnerTimer);
    };
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMenuToggle = () => {
    // 在桌面版本上切换折叠状态，在移动版本上切换打开状态
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <YouTubeHeader
        onMenuClick={handleMenuToggle}
        onSearch={handleSearch}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <YouTubeSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          selectedCategory={selectedCategory}
          categories={categories}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full h-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page title */}
            {searchQuery && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  搜索结果："{searchQuery}"
                </h1>
              </div>
            )}

            {selectedCategory && !searchQuery && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h1>
              </div>
            )}

            {/* Videos grid */}
            {showLoadingSpinner ? (
              // 显示加载动画（仅当加载时间超过 1 秒）
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={48} className="animate-spin text-accent" />
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              </div>
            ) : videosLoading ? (
              // 加载中但不显示加载动画（1 秒内快速返回）
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}>
                {/* 空占位符，等待数据返回 */}
              </div>
            ) : videos.length > 0 ? (
              // 显示视频列表
              <div 
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                }}
              >
                {videos.map((video) => (
                  <YouTubeVideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    thumbnailUrl={video.thumbnailUrl}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    channelName="频道"
                  />
                ))}
              </div>
            ) : (
              // 显示"没有找到视频"
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">没有找到视频</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    尝试使用其他搜索条件或浏览其他分类
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
