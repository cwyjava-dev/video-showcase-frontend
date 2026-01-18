import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { apiService } from '@/lib/api';

interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  categoryId?: number;
  views: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    categoryId: '',
    videoFile: null as File | null,
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVideos({ page: 1, size: 100 });
      setVideos(response.content || []);
    } catch (error) {
      console.error('获取视频列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateVideo(editingId, {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        });
      } else {
        // 创建新视频
        let videoUrl = formData.videoUrl;
        
        // 如果选择了文件，上传文件
        if (formData.videoFile) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.videoFile);
          
          try {
            // 这里需要后端提供文件上传接口
            // 暂时使用本地 URL
            videoUrl = URL.createObjectURL(formData.videoFile);
            setUploadProgress(100);
          } catch (error) {
            console.error('上传视频文件失败:', error);
            alert('上传视频文件失败，请检查文件大小或格式');
            return;
          }
        }

        await apiService.createVideo({
          title: formData.title,
          description: formData.description,
          videoUrl: videoUrl,
          thumbnailUrl: formData.thumbnailUrl,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        });
      }
      
      setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', videoFile: null });
      setEditingId(null);
      setIsOpen(false);
      setUploadProgress(0);
      fetchVideos();
      alert('保存成功');
    } catch (error) {
      console.error('保存视频失败:', error);
      alert('保存视频失败，请重试');
    }
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      categoryId: video.categoryId?.toString() || '',
      videoFile: null,
    });
    setEditingId(video.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个视频吗？')) {
      try {
        await apiService.deleteVideo(id);
        fetchVideos();
        alert('删除成功');
      } catch (error) {
        console.error('删除视频失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', videoFile: null });
    setUploadProgress(0);
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || `-`;
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">视频管理</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', videoFile: null }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  上传视频
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? '编辑视频' : '上传新视频'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">视频标题 *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="输入视频标题"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="输入视频描述"
                      rows={3}
                    />
                  </div>
                  {!editingId && (
                    <>
                      <div>
                        <label className="text-sm font-medium">视频文件 *</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            placeholder="选择视频文件"
                            required={!formData.videoUrl}
                          />
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {formData.videoFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            已选择: {formData.videoFile.name}
                          </p>
                        )}
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium">或输入视频链接</label>
                        <Input
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="输入视频链接（可选）"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">缩略图链接</label>
                        <Input
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          placeholder="输入缩略图链接"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium">分类</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="">-- 选择分类 --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? '更新' : '上传'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCloseDialog}>
                      取消
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container py-8 px-4 lg:px-8">
        <Card className="border-border/50 w-full">
          <CardHeader>
            <CardTitle>视频列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无视频</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>观看次数</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{video.description || '-'}</TableCell>
                        <TableCell>{getCategoryName(video.categoryId)}</TableCell>
                        <TableCell>{video.views}</TableCell>
                        <TableCell>{new Date(video.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(video)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(video.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
