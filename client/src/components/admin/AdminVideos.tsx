import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, Film } from "lucide-react";
import { toast } from "sonner";

export default function AdminVideos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();
  const { data: videos = [] } = trpc.admin.videos.list.useQuery();
  const { data: categories = [] } = trpc.admin.categories.list.useQuery();
  const { data: tags = [] } = trpc.admin.tags.list.useQuery();

  const createMutation = trpc.admin.videos.create.useMutation({
    onSuccess: () => {
      utils.admin.videos.list.invalidate();
      setIsCreateOpen(false);
      toast.success("视频创建成功");
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.videos.update.useMutation({
    onSuccess: () => {
      utils.admin.videos.list.invalidate();
      setEditingVideo(null);
      toast.success("视频更新成功");
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.videos.delete.useMutation({
    onSuccess: () => {
      utils.admin.videos.list.invalidate();
      toast.success("视频删除成功");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const uploadVideoMutation = trpc.admin.videos.uploadVideo.useMutation();
  const uploadThumbnailMutation = trpc.admin.videos.uploadThumbnail.useMutation();

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    return new Promise<{ url: string; key: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const mutation = type === 'video' ? uploadVideoMutation : uploadThumbnailMutation;
          const result = await mutation.mutateAsync({
            fileName: file.name,
            fileData: base64,
            mimeType: file.type,
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const description = formData.get('description') as string;
      let categoryId = formData.get('categoryId') as string;
      // Convert 'none' to empty string for no category
      if (categoryId === 'none') categoryId = '';
      const status = formData.get('status') as 'draft' | 'published' | 'archived';
      const videoFile = formData.get('video') as File;
      const thumbnailFile = formData.get('thumbnail') as File;
      const selectedTags = formData.getAll('tags') as string[];

      let videoUrl = '';
      let videoKey = '';
      let thumbnailUrl = '';
      let thumbnailKey = '';
      let duration: number | undefined;
      let fileSize: number | undefined;
      let mimeType: string | undefined;

      if (videoFile && videoFile.size > 0) {
        const uploadResult = await handleFileUpload(videoFile, 'video');
        videoUrl = uploadResult.url;
        videoKey = uploadResult.key;
        fileSize = videoFile.size;
        mimeType = videoFile.type;

        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(videoFile);
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            duration = Math.floor(video.duration);
            URL.revokeObjectURL(video.src);
            resolve(null);
          };
        });
      }

      if (thumbnailFile && thumbnailFile.size > 0) {
        const uploadResult = await handleFileUpload(thumbnailFile, 'thumbnail');
        thumbnailUrl = uploadResult.url;
        thumbnailKey = uploadResult.key;
      }

      if (editingVideo) {
        await updateMutation.mutateAsync({
          id: editingVideo.id,
          title,
          slug,
          description: description || undefined,
          categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : undefined,
          status,
          tagIds: selectedTags.map(id => parseInt(id)),
          ...(videoUrl && { videoUrl, videoKey, duration, fileSize, mimeType }),
          ...(thumbnailUrl && { thumbnailUrl, thumbnailKey }),
        });
      } else {
        if (!videoUrl) {
          toast.error("请上传视频文件");
          return;
        }
        await createMutation.mutateAsync({
          title,
          slug,
          description: description || undefined,
          videoUrl,
          videoKey,
          thumbnailUrl: thumbnailUrl || undefined,
          thumbnailKey: thumbnailKey || undefined,
          duration,
          fileSize,
          mimeType,
          categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : undefined,
          status,
          tagIds: selectedTags.map(id => parseInt(id)),
        });
      }
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">视频管理</h2>
          <p className="text-muted-foreground">管理您的视频内容</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              上传视频
            </Button>
          </DialogTrigger>
          {isCreateOpen && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>上传新视频</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL别名 *</Label>
                <Input id="slug" name="slug" required placeholder="video-slug" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" name="description" rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">视频文件 *</Label>
                <Input id="video" name="video" type="file" accept="video/*" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">缩略图</Label>
                <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">分类</Label>
                <Select name="categoryId" defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无分类</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>标签</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="tags" value={tag.id.toString()} className="rounded" />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select name="status" defaultValue="published">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "上传中..." : "创建"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          )}
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {videos.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无视频</h3>
              <p className="text-sm text-muted-foreground mb-4">开始上传您的第一个视频</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                上传视频
              </Button>
            </CardContent>
          </Card>
        ) : (
          videos.map((video) => (
            <Card key={video.id} className="border-border/50 hover:shadow-elegant transition-elegant">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{video.viewCount || 0} 观看</span>
                          <span>·</span>
                          <span>{new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
                          <span>·</span>
                          <Badge variant={video.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                            {video.status === 'published' ? '已发布' : video.status === 'draft' ? '草稿' : '已归档'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除视频 "{video.title}" 吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate({ id: video.id })}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
        {editingVideo && (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑视频</DialogTitle>
          </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">标题 *</Label>
                <Input id="edit-title" name="title" defaultValue={editingVideo.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slug">URL别名 *</Label>
                <Input id="edit-slug" name="slug" defaultValue={editingVideo.slug} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">描述</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingVideo.description || ''} rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-video">更换视频文件（可选）</Label>
                <Input id="edit-video" name="video" type="file" accept="video/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">更换缩略图（可选）</Label>
                <Input id="edit-thumbnail" name="thumbnail" type="file" accept="image/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">分类</Label>
                <Select name="categoryId" defaultValue={editingVideo.categoryId?.toString() || 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无分类</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">状态</Label>
                <Select name="status" defaultValue={editingVideo.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingVideo(null)}>
                  取消
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
        </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
