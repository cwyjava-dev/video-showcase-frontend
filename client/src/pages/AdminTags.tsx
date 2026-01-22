import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { apiService } from '@/lib/api';

interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export default function AdminTags() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4F46E5',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTags();
      const data = Array.isArray(response) ? response : (response?.data || []);
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateTag(editingId, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
      } else {
        await apiService.createTag({
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
      }
      setFormData({ name: '', description: '', color: '#4F46E5' });
      setEditingId(null);
      setIsOpen(false);
      fetchTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  const handleEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#4F46E5',
    });
    setEditingId(tag.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('admin.confirmDeleteTag'))) {
      try {
        await apiService.deleteTag(id);
        fetchTags();
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#4F46E5' });
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
              <h1 className="text-2xl font-bold">{t('admin.tags')}</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', color: '#4F46E5' }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.newTag')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? t('admin.editTag') : t('admin.newTag')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('admin.tagName')} *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('admin.enterTagName')}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('admin.description')}</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('admin.enterDescription')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('admin.color')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#4F46E5"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="default" className="flex-1">
                      {editingId ? t('common.update') : t('common.create')}
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

      <div className="container py-8 px-4 lg:px-8">
        <Card className="border-border/50 w-full">
          <CardHeader>
            <CardTitle>{t('admin.tagList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name')}</TableHead>
                      <TableHead>{t('admin.description')}</TableHead>
                      <TableHead>{t('admin.color')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{tag.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-border"
                              style={{ backgroundColor: tag.color || '#4F46E5' }}
                            />
                            <span className="text-sm">{tag.color || '#4F46E5'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(tag)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(tag.id)}
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
