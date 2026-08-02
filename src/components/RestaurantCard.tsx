import { TrendingUp, MapPin, Star, BadgeCheck } from 'lucide-react';
import type { Restaurant, RankingScore } from '@/lib/types';
import { navigate } from '@/lib/router';

interface RestaurantCardProps {
  restaurant: Restaurant;
  ranking?: RankingScore | null;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function RestaurantCard({ restaurant, ranking, variant = 'default' }: RestaurantCardProps) {
  const score = ranking?.score ?? restaurant.rating * 10;

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => navigate(`/d/${restaurant.slug}`)}
        className="flex-shrink-0 w-72 group text-left"
      >
        <div className="relative h-44 rounded-2xl overflow-hidden bg-cream">
          {restaurant.cover_image_url ? (
            <img
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream to-beige flex items-center justify-center">
              <span className="font-serif text-3xl text-charcoal/20">{restaurant.name[0]}</span>
            </div>
          )}
          {restaurant.verified && (
            <div className="absolute top-3 left-3 badge bg-white/90 backdrop-blur text-charcoal">
              <BadgeCheck className="w-3.5 h-3.5 text-orange" />
              <span className="text-xs">Verified</span>
            </div>
          )}
          {ranking && ranking.rank <= 10 && (
            <div className="absolute top-3 right-3 badge bg-orange text-white">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-charcoal truncate">{restaurant.name}</h3>
          <p className="text-sm text-muted-text mt-0.5">{restaurant.cuisine} · {restaurant.location}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cream">
              <span className="text-xs font-semibold text-charcoal">{Math.round(score)}</span>
              <span className="text-xs text-muted-text">Score</span>
            </div>
            {restaurant.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-text">
                <Star className="w-3 h-3 fill-orange text-orange" />
                {restaurant.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/d/${restaurant.slug}`)}
      className="group text-left w-full"
    >
      <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-cream card-hover">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cream to-beige flex items-center justify-center">
            <span className="font-serif text-5xl text-charcoal/20">{restaurant.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        {restaurant.verified && (
          <div className="absolute top-3 left-3 badge bg-white/90 backdrop-blur text-charcoal">
            <BadgeCheck className="w-3.5 h-3.5 text-orange" />
            <span className="text-xs">Verified</span>
          </div>
        )}
        {ranking && ranking.rank <= 10 && (
          <div className="absolute top-3 right-3 badge bg-orange text-white">
            <TrendingUp className="w-3 h-3" />
            <span>Trending</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-xl font-semibold text-white">{restaurant.name}</h3>
          <p className="text-sm text-white/80 mt-0.5">{restaurant.cuisine} · {restaurant.location}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream">
            <span className="text-sm font-bold text-charcoal">{Math.round(score)}</span>
            <span className="text-xs text-muted-text">DineBox Score</span>
          </div>
        </div>
        {restaurant.rating > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-text">
            <Star className="w-4 h-4 fill-orange text-orange" />
            <span className="font-medium text-charcoal">{restaurant.rating.toFixed(1)}</span>
            <span>({restaurant.review_count})</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function RestaurantCardSmall({ restaurant, ranking }: { restaurant: Restaurant; ranking?: RankingScore | null }) {
  return (
    <button
      onClick={() => navigate(`/d/${restaurant.slug}`)}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream/50 transition-all w-full text-left"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream flex-shrink-0">
        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-cream flex items-center justify-center">
            <span className="font-serif text-lg text-charcoal/30">{restaurant.name[0]}</span>
          </div>
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
