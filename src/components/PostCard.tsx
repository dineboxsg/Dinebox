import { ArrowRight, Clock } from 'lucide-react';
import type { Post, Restaurant } from '@/lib/types';
import { navigate } from '@/lib/router';

const postTypeLabels: Record<string, string> = {
  update: 'Update',
  deal: 'Deal',
  new_menu: 'New Menu',
  new_dish: 'New Dish',
  event: 'Event',
  promotion: 'Promotion',
  announcement: 'Announcement',
  collaboration: 'Collaboration',
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

interface PostCardProps {
  post: Post;
  restaurant?: Restaurant;
  variant?: 'large' | 'compact';
}

export function PostCard({ post, restaurant, variant = 'large' }: PostCardProps) {
  const rest = restaurant || post.restaurant;
  if (!rest) return null;

  if (variant === 'compact') {
    return (
      <div className="flex gap-3 p-3 rounded-2xl hover:bg-cream/50 transition-all">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream flex-shrink-0">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cream" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-orange">{postTypeLabels[post.type]}</span>
          <h4 className="font-medium text-charcoal truncate">{post.title}</h4>
          <p className="text-xs text-muted-text truncate">{rest.name}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => navigate(`/d/${rest.slug}`)} className="flex items-center gap-3 group/rest">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-cream flex-shrink-0 ring-2 ring-cream">
            {rest.logo_url ? (
              <img src={rest.logo_url} alt={rest.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-charcoal flex items-center justify-center">
                <span className="text-white font-serif text-sm">{rest.name[0]}</span>
              </div>
            )}
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-charcoal text-sm group-hover/rest:text-orange transition-colors">{rest.name}</h4>
            <p className="text-xs text-muted-text">{rest.location} · {timeAgo(post.published_at || post.created_at)}</p>
          </div>
        </button>
        <span className="ml-auto badge bg-cream text-charcoal">
          {postTypeLabels[post.type]}
        </span>
      </div>

      {/* Content */}
      <button onClick={() => navigate(`/d/${rest.slug}`)} className="block text-left w-full">
        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal mb-2 group-hover:text-charcoal-700 transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-text text-sm leading-relaxed mb-4 line-clamp-2">{post.description}</p>
      </button>

      {/* Image */}
      {post.image_url && (
        <button onClick={() => navigate(`/d/${rest.slug}`)} className="block w-full mb-4">
          <div className="rounded-2xl overflow-hidden bg-cream aspect-[16/10]">
            <img
              src={post.image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </button>
      )}

      {/* CTA */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/d/${rest.slug}`)} className="btn-ghost text-charcoal hover:text-orange">
          View Restaurant
          <ArrowRight className="w-4 h-4" />
        </button>
        {post.cta_text && post.cta_url && (
          <a
            href={post.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            {post.cta_text}
          </a>
        )}
      </div>
    </article>
  );
}
