import { Link } from 'wouter';
import { Play, MoreVertical } from 'lucide-react';

interface YouTubeVideoCardProps {
  id: number;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: string;
  channelName?: string;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export default function YouTubeVideoCard({
  id,
  title,
  thumbnailUrl,
  duration,
  views,
  createdAt,
  channelName = '频道',
}: YouTubeVideoCardProps) {
  return (
    <Link href={`/video/${id}`}>
      <a className="group cursor-pointer">
        <div className="space-y-2">
          {/* Thumbnail */}
          <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Play size={48} className="text-muted-foreground" />
              </div>
            )}

            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(duration)}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>

          {/* Video info */}
          <div className="space-y-1 px-0">
            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {title}
            </h3>

            {/* Channel name */}
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {channelName}
            </p>

            {/* Views and date */}
            <p className="text-sm text-muted-foreground">
              <span>{formatViews(views)} 次观看</span>
              <span className="mx-1">•</span>
              <span>{formatDate(createdAt)}</span>
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}
