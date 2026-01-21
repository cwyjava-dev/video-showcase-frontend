import { useState } from 'react';
import { Link } from 'wouter';
import { Home, Compass, Clock, ThumbsUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedCategory?: number;
  categories?: Array<{ id: number; name: string }>;
  onCategorySelect?: (categoryId: number | undefined) => void;
}

export default function YouTubeSidebar({
  isOpen,
  onClose,
  selectedCategory,
  categories = [],
  onCategorySelect,
}: YouTubeSidebarProps) {
  const [showCategories, setShowCategories] = useState(false);

  const menuItems = [
    { icon: Home, label: '首页', href: '/', id: 'home' },
    { icon: Compass, label: '探索', href: '#', id: 'explore' },
    { icon: Clock, label: '历史记录', href: '#', id: 'history' },
    { icon: ThumbsUp, label: '顶过的视频', href: '#', id: 'liked' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 w-64 bg-background border-r border-border overflow-y-auto transition-transform duration-300 z-40',
          'lg:relative lg:top-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="p-3 space-y-2">
          {/* Main menu items */}
          {menuItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <a
                className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                onClick={() => {
                  if (item.id === 'home') {
                    onCategorySelect?.(undefined);
                  }
                  onClose?.();
                }}
              >
                <item.icon size={24} />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            </Link>
          ))}

          {/* Divider */}
          <div className="h-px bg-border my-4" />

          {/* Categories section */}
          {categories.length > 0 && (
            <div>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
              >
                <span className="text-sm font-medium">分类</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'transition-transform',
                    showCategories && 'rotate-180'
                  )}
                />
              </button>

              {showCategories && (
                <div className="space-y-1 mt-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategorySelect?.(category.id);
                        onClose?.();
                      }}
                      className={cn(
                        'w-full text-left px-6 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === category.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-secondary'
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
