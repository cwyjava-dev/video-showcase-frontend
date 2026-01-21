import { useState } from 'react';
import { Link } from 'wouter';
import { Search, Menu, User, LogOut, Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { getLoginUrl } from '@/const';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface YouTubeHeaderProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function YouTubeHeader({ onMenuClick, onSearch }: YouTubeHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>
          
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="text-xl font-bold text-accent">▶ 视频</div>
            </a>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder="搜索视频..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-l-full bg-input border-input text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="px-6 bg-secondary hover:bg-secondary/80 text-foreground rounded-r-full transition-colors border border-border border-l-0"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <User size={24} className="text-foreground" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-semibold text-foreground">{user.displayName || user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link href="/admin">
                      <a className="flex items-center gap-3 px-4 py-2 hover:bg-secondary text-foreground transition-colors">
                        <Settings size={18} />
                        <span>{t('admin.dashboard')}</span>
                      </a>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary text-foreground transition-colors border-t border-border"
                  >
                    <LogOut size={18} />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={getLoginUrl()}>
              <a>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">
                  {t('common.login')}
                </Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
