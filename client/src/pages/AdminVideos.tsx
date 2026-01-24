import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { Link } from 'wouter';
import { apiService } from '@/lib/api';

interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: Category;
  status?: 'DRAFT' | 'PUBLISHED';
  views: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminVideos() {
  const { t } = useTranslation();
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
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    videoType: 'LOCAL' as 'LOCAL' | 'YOUTUBE' | 'BILIBILI',
    videoFile: null as File | null,
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllVideosForAdmin();
      setVideos(Array.isArray(response) ? response : (response.content || []));
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

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
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
      if (!editingId && !formData.videoFile && !formData.videoUrl) {
        alert(t('admin.selectVideoSource'));
        return;
      }

      if (editingId) {
        const categoryId = formData.categoryId ? parseInt(formData.categoryId) : null;
        
        const videoData: any = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          videoType: formData.videoType,
        };
        
        if (categoryId) {
          videoData.category = { id: categoryId };
        }
        
        if (formData.videoUrl) {
          videoData.videoUrl = formData.videoUrl;
        }
        await apiService.updateVideo(editingId, videoData);
      } else {
        let videoUrl = formData.videoUrl;
        
        if (formData.videoFile) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.videoFile);
          
          try {
            const uploadResponse = await apiService.uploadVideo(uploadFormData);
            if (uploadResponse.success) {
              videoUrl = uploadResponse.url;
              setUploadProgress(100);
            } else {
              throw new Error(uploadResponse.message || t('admin.uploadFailed'));
            }
          } catch (error) {
            console.error('上传视频文件失败:', error);
            alert(t('admin.uploadFileFailed'));
            return;
          }
        }

        const createData: any = {
          title: formData.title,
          description: formData.description,
          videoUrl: videoUrl,
          thumbnailUrl: formData.thumbnailUrl,
          videoType: formData.videoType,
        };
        if (formData.categoryId) {
          createData.categoryId = parseInt(formData.categoryId);
        }
        await apiService.createVideo(createData);
      }
      
      setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', status: 'DRAFT', videoType: 'LOCAL', videoFile: null });
      setEditingId(null);
      setIsOpen(false);
      setUploadProgress(0);
      fetchVideos();
      alert(t('admin.saveSucess'));
    } catch (error) {
      console.error('保存视频失败:', error);
      alert(t('admin.saveFailed'));
    }
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      categoryId: video.category?.id?.toString() || '',
      status: video.status || 'DRAFT',
      videoType: (video as any).videoType || 'LOCAL',
      videoFile: null,
    });
    setEditingId(video.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('admin.confirmDelete'))) {
      try {
        await apiService.deleteVideo(id);
        fetchVideos();
        alert(t('admin.deleteSuccess'));
      } catch (error) {
        console.error('删除视频失败:', error);
        alert(t('admin.deleteFailed'));
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', status: 'DRAFT', videoType: 'LOCAL', videoFile: null });
    setUploadProgress(0);
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
              <h1 className="text-2xl font-bold">{t('admin.videos')}</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', status: 'DRAFT', videoType: 'LOCAL', videoFile: null }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.newVideo')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? t('common.edit') : t('admin.uploadVideo')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('video.title')} *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('video.title')}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('admin.description')}</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('admin.description')}
                      rows={3}
                    />
                  </div>
                  {editingId && (
                    <>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          {formData.videoType === 'LOCAL' ? 'Video URL / Link' : 'Embedded HTML / URL'}
                        </label>
                        {formData.videoType === 'LOCAL' ? (
                          <Input
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="Enter video URL or link"
                            className="mt-1"
                          />
                        ) : (
                          <>
                            <Textarea
                              value={formData.videoUrl}
                              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                              placeholder={formData.videoType === 'YOUTUBE' ? 'YouTube URL or Video ID' : 'Bilibili URL or Video ID'}
                              className="mt-1"
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              {formData.videoType === 'YOUTUBE' ? (
                                <>Supported formats: https://www.youtube.com/watch?v=VIDEO_ID or VIDEO_ID or complete iframe code</>
                              ) : (
                                <>Supported formats: https://www.bilibili.com/video/BV... or BVID or complete iframe code</>
                              )}
                            </p>
                          </>
                        )}
                        {formData.videoUrl && (
                          <p className="text-xs text-accent mt-1">
                            ✓ URL entered
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('admin.thumbnail')}</label>
                        <Input
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          placeholder={t('admin.thumbnailUrl')}
                        />
                      </div>
                    </>
                  )}
                  {!editingId && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Video Type</label>
                        <select
                          value={formData.videoType}
                          onChange={(e) => setFormData({ ...formData, videoType: e.target.value as 'LOCAL' | 'YOUTUBE' | 'BILIBILI' })}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        >
                          <option value="LOCAL">Local Video</option>
                          <option value="YOUTUBE">YouTube</option>
                          <option value="BILIBILI">Bilibili</option>
                        </select>
                      </div>
                      <div className="space-y-3 border border-border rounded-lg p-3 bg-secondary/30">
                        <p className="text-sm font-medium text-foreground">{t('admin.videoSource')}</p>
                        
                        {formData.videoType === 'LOCAL' ? (
                          <>
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                {t('admin.uploadMethod')}
                              </label>
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                placeholder={t('video.selectFile')}
                                className="mt-1"
                              />
                              {formData.videoFile && (
                                <p className="text-xs text-accent mt-1">
                                  ✓ {t('admin.selected')}: {formData.videoFile.name}
                                </p>
                              )}

                              {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-px bg-border"></div>
                              <span className="text-xs text-muted-foreground">{t('video.or')}</span>
                              <div className="flex-1 h-px bg-border"></div>
                            </div>

                            <div>
                              <label className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Video URL / Link
                              </label>
                              <Input
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                placeholder="Enter video URL or link"
                                className="mt-1"
                              />
                              {formData.videoUrl && (
                                <p className="text-xs text-accent mt-1">
                                  ✓ URL entered
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                              <LinkIcon className="w-4 h-4" />
                              Embedded HTML / URL
                            </label>
                            <Textarea
                              value={formData.videoUrl}
                              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                              placeholder={formData.videoType === 'YOUTUBE' ? 'YouTube URL or Video ID' : 'Bilibili URL or Video ID'}
                              className="mt-1"
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              {formData.videoType === 'YOUTUBE' ? (
                                <>Supported formats: https://www.youtube.com/watch?v=VIDEO_ID or VIDEO_ID or complete iframe code</>
                              ) : (
                                <>Supported formats: https://www.bilibili.com/video/BV... or BVID or complete iframe code</>
                              )}
                            </p>
                            {formData.videoUrl && (
                              <p className="text-xs text-accent mt-1">
                                ✓ URL entered
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('admin.thumbnail')}</label>
                        <Input
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          placeholder={t('admin.thumbnailUrl')}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium">{t('video.category')}</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="">-- {t('admin.selectCategory')} --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Video Type</label>
                    <select
                      value={formData.videoType}
                      onChange={(e) => setFormData({ ...formData, videoType: e.target.value as 'LOCAL' | 'YOUTUBE' | 'BILIBILI' })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="LOCAL">Local Video</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="BILIBILI">Bilibili</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="default" className="flex-1">
                      {t('common.save')}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCloseDialog}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {loading ? (
          <div className="text-center text-muted-foreground">{t('common.loading')}</div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('common.noData')}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.videos')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('video.title')}</TableHead>
                      <TableHead>{t('video.category')}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>{t('video.views')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>{getCategoryName(video.category?.id)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            video.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {video.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>{video.views}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(video)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(video.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
