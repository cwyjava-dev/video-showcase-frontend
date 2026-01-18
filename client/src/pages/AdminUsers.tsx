import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, ArrowLeft, Key } from 'lucide-react';
import { Link } from 'wouter';
import { apiService } from '@/lib/api';

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
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [passwordData, setPasswordData] = useState({
    userId: 0,
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      alert('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.email) {
        alert('用户名和邮箱不能为空');
        return;
      }

      if (editingId) {
        // 编辑用户
        await apiService.updateUser(editingId, {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
        });
        alert('用户更新成功');
      } else {
        // 创建新用户
        if (!formData.password) {
          alert('新建用户必须设置密码');
          return;
        }
        await apiService.createUser({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password,
          role: formData.role,
        });
        alert('用户创建成功');
      }
      
      setFormData({ username: '', email: '', displayName: '', password: '', role: 'USER' });
      setEditingId(null);
      setIsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('保存用户失败:', error);
      alert('保存用户失败，请检查输入');
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName || '',
      password: '',
      role: user.role,
    });
    setEditingId(user.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个用户吗？')) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
        alert('用户删除成功');
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        alert('新密码不能为空');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert('密码长度至少为 6 位');
        return;
      }

      // 调用更新用户密码的 API
      await apiService.updateUser(passwordData.userId, {
        password: passwordData.newPassword,
      });
      
      alert('密码修改成功，请重新登录');
      setPasswordData({ userId: 0, newPassword: '', confirmPassword: '' });
      setIsPasswordOpen(false);
      // 如果修改的是当前用户的密码，则退出登录
      // 这样用户需要重新登录
      window.location.href = '/login';
      fetchUsers();
    } catch (error) {
      console.error('修改密码失败:', error);
      alert('修改密码失败');
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ username: '', email: '', displayName: '', password: '', role: 'USER' });
  };

  const openPasswordDialog = (user: User) => {
    setPasswordData({ userId: user.id, newPassword: '', confirmPassword: '' });
    setIsPasswordOpen(true);
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
                <Button onClick={() => { setEditingId(null); setFormData({ username: '', email: '', displayName: '', password: '', role: 'USER' }); }}>
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
                  {!editingId && (
                    <div>
                      <label className="text-sm font-medium">密码 *</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="输入密码（至少 6 位）"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">角色 *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="USER">普通用户</option>
                      <option value="ADMIN">管理员</option>
                    </select>
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

      {/* 修改密码对话框 */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">新密码 *</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="输入新密码（至少 6 位）"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">确认密码 *</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                修改
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPasswordOpen(false)}>
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container py-8 px-4 lg:px-8">
        <Card className="border-border/50 w-full">
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
                            variant="outline"
                            onClick={() => openPasswordDialog(user)}
                            title="修改密码"
                          >
                            <Key className="w-4 h-4" />
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
