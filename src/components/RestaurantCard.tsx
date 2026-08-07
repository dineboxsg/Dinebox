import { TrendingUp, Star, BadgeCheck } from 'lucide-react';
import type { Restaurant, RankingScore } from '@/lib/types';
import { navigate } from '@/lib/router';
import { DEFAULT_RESTAURANT_LOGO } from '@/lib/restaurant-logo';
import { CardShell } from '@/components/CardShell';

interface RestaurantCardProps {
  restaurant: Restaurant;
  ranking?: RankingScore | null;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function RestaurantCard({ restaurant, ranking, variant = 'default' }: RestaurantCardProps) {
  const score = ranking?.score ?? restaurant.rating * 10;

  const cardContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-cream">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <img src={restaurant.logo_url || DEFAULT_RESTAURANT_LOGO} alt={restaurant.name} loading="lazy" className="h-full w-full object-contain bg-white p-8" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        {restaurant.verified && (
          <div className="absolute left-3 top-3 badge bg-white/90 backdrop-blur text-charcoal">
            <BadgeCheck className="h-3.5 w-3.5 text-orange" />
            <span className="text-xs">Verified</span>
          </div>
        )}
        {ranking && ranking.rank <= 10 && (
          <div className="absolute right-3 top-3 badge bg-orange text-white">
            <TrendingUp className="h-3 w-3" />
            <span>Trending</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="truncate font-serif text-xl font-semibold text-white">{restaurant.name}</h3>
          <p className="mt-0.5 truncate text-sm text-white/80">{restaurant.cuisine} · {restaurant.location}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full bg-orange/10 px-2.5 py-1">
            <span className="text-sm font-bold text-charcoal">{Math.round(score)}</span>
            <span className="text-xs text-muted-text">DineBox Score</span>
          </div>
          {restaurant.rating > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-sm text-muted-text">
              <Star className="h-4 w-4 fill-orange text-orange" />
              <span className="font-medium text-charcoal">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {restaurant.rating > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-text">
            <span className="rounded-full bg-warm-white px-2.5 py-1 text-xs font-medium text-charcoal/70">{restaurant.cuisine}</span>
            <span className="text-xs">{restaurant.location}</span>
          </div>
        )}
      </div>
    </>
  );

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => navigate(`/r/${restaurant.slug}`)}
        className="group w-72 flex-shrink-0 text-left"
      >
        <CardShell>{cardContent}</CardShell>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/r/${restaurant.slug}`)}
      className="group w-full text-left"
    >
      <CardShell>{cardContent}</CardShell>
    </button>
  );
}

export function RestaurantCardSmall({ restaurant, ranking }: { restaurant: Restaurant; ranking?: RankingScore | null }) {
  return (
    <button
      onClick={() => navigate(`/r/${restaurant.slug}`)}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream/50 transition-all w-full text-left"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream flex-shrink-0">
        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <img src={restaurant.logo_url || DEFAULT_RESTAURANT_LOGO} alt={restaurant.name} loading="lazy" className="w-full h-full object-contain bg-white p-2" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-charcoal truncate">{restaurant.name}</h4>
        <p className="text-xs text-muted-text truncate">{restaurant.cuisine} · {restaurant.location}</p>
      </div>
      {ranking && (
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold text-charcoal">{Math.round(ranking.score)}</div>
          <div className="text-xs text-muted-text">Score</div>
        </div>
      )}
    </button>
  );
}
