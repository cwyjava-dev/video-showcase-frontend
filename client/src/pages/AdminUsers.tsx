import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 这里需要后端提供获取用户列表的 API
      // 暂时使用模拟数据
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          displayName: '管理员',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 这里需要后端提供创建/更新用户的 API
      console.log('保存用户:', formData);
      setFormData({ username: '', email: '', displayName: '', role: 'USER' });
      setEditingId(null);
      setIsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('保存用户失败:', error);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
    });
    setEditingId(user.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个用户吗？')) {
      try {
        // 这里需要后端提供删除用户的 API
        console.log('删除用户:', id);
        fetchUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ username: '', email: '', displayName: '', role: 'USER' });
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
              <h1 className="text-2xl font-bold">用户管理</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setFormData({ username: '', email: '', displayName: '', role: 'USER' }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建用户
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? '编辑用户' : '新建用户'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">用户名 *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="输入用户名"
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">邮箱 *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="输入邮箱"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">显示名称</label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="输入显示名称"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">角色 *</label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'USER' | 'ADMIN' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">普通用户</SelectItem>
                        <SelectItem value="ADMIN">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? '更新' : '创建'}
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

      <div className="container py-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无用户</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>显示名称</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.displayName || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
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
