import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      console.error('Failed to fetch users:', error);
      alert(t('admin.fetchUsersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.email) {
        alert(t('admin.usernameEmailRequired'));
        return;
      }

      if (editingId) {
        // 编辑用户
        await apiService.updateUser(editingId, {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
        });
        alert(t('admin.userUpdateSuccess'));
      } else {
        // 创建新用户
        if (!formData.password) {
          alert(t('admin.passwordRequired'));
          return;
        }
        await apiService.createUser({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password,
          role: formData.role,
        });
        alert(t('admin.userCreateSuccess'));
      }
      
      setFormData({ username: '', email: '', displayName: '', password: '', role: 'USER' });
      setEditingId(null);
      setIsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(t('admin.saveUserFailed'));
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
    if (confirm(t('admin.confirmDeleteUser'))) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
        alert(t('admin.userDeleteSuccess'));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(t('admin.deleteUserFailed'));
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        alert(t('admin.passwordCannotBeEmpty'));
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert(t('admin.passwordMismatch'));
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert(t('admin.passwordTooShort'));
        return;
      }

      // 调用更新用户密码的 API
      await apiService.updateUser(passwordData.userId, {
        password: passwordData.newPassword,
      });
      
      alert(t('admin.passwordChangeSuccess'));
      setPasswordData({ userId: 0, newPassword: '', confirmPassword: '' });
      setIsPasswordOpen(false);
      // 如果修改的是当前用户的密码，则退出登录
      // 这样用户需要重新登录
      window.location.href = '/login';
      fetchUsers();
    } catch (error) {
      console.error('Failed to change password:', error);
      alert(t('admin.changePasswordFailed'));
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
              <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => { setEditingId(null); setFormData({ username: '', email: '', displayName: '', password: '', role: 'USER' }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.newUser')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? t('admin.editUser') : t('admin.newUser')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('admin.username')} *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder={t('admin.enterUsername')}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('admin.email')} *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('admin.enterEmail')}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('admin.displayName')}</label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder={t('admin.enterDisplayName')}
                    />
                  </div>
                  {!editingId && (
                    <div>
                      <label className="text-sm font-medium">{t('admin.password')} *</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t('admin.enterPassword')}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">{t('admin.role')} *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="USER">{t('admin.regularUser')}</option>
                      <option value="ADMIN">{t('admin.administrator')}</option>
                    </select>
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

      {/* 修改密码对话框 */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.changePassword')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('admin.newPassword')} *</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder={t('admin.enterNewPassword')}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('admin.confirmPassword')} *</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder={t('admin.confirmNewPassword')}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="default" className="flex-1">
                {t('admin.change')}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPasswordOpen(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container py-8 px-4 lg:px-8">
        <Card className="border-border/50 w-full">
          <CardHeader>
            <CardTitle>{t('admin.userList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.username')}</TableHead>
                      <TableHead>{t('admin.email')}</TableHead>
                      <TableHead>{t('admin.displayName')}</TableHead>
                      <TableHead>{t('admin.role')}</TableHead>
                      <TableHead>{t('admin.createdAt')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
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
                            {user.role === 'ADMIN' ? t('admin.administrator') : t('admin.regularUser')}
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
                            title={t('admin.changePassword')}
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
