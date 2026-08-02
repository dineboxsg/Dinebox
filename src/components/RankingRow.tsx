import { ArrowUp, ArrowDown, Sparkles, Minus } from 'lucide-react';
import type { Restaurant, RankingScore } from '@/lib/types';
import { navigate } from '@/lib/router';

interface RankingRowProps {
  rank: number;
  restaurant: Restaurant;
  ranking: RankingScore;
  variant?: 'full' | 'compact';
}

export function MovementBadge({ movement }: { movement: string }) {
  if (movement === 'NEW' || movement === 'new') {
    return (
      <span className="badge bg-orange/10 text-orange-600 font-semibold">
        <Sparkles className="w-3 h-3" />
        NEW
      </span>
    );
  }
  if (movement === '—' || movement === '' || movement === '-') {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-text">
        <Minus className="w-3 h-3" />
        —
      </span>
    );
  }
  const isUp = movement.startsWith('↑') || movement.startsWith('+');
  const num = movement.replace(/[↑↓+\-]/g, '').trim();
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {num}
    </span>
  );
}

export function RankingRow({ rank, restaurant, ranking, variant = 'full' }: RankingRowProps) {
  const isTop3 = rank <= 3;
  const rankColors = [
    'bg-gradient-to-br from-orange to-orange-600 text-white',
    'bg-gradient-to-br from-charcoal-300 to-charcoal-500 text-white',
    'bg-gradient-to-br from-orange-300 to-orange-400 text-white',
  ];

  return (
    <button
      onClick={() => navigate(`/d/${restaurant.slug}`)}
      className={`flex items-center gap-4 w-full text-left transition-all duration-200 hover:bg-cream/40 ${
        variant === 'full' ? 'p-4 rounded-2xl' : 'p-3 rounded-xl'
      } ${isTop3 && variant === 'full' ? 'bg-cream/30' : ''}`}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-12 text-center">
        {isTop3 && variant === 'full' ? (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl font-bold ${rankColors[rank - 1]}`}>
            {rank}
          </div>
        ) : (
          <div className="font-serif text-2xl font-bold text-charcoal/40">
            {rank}
          </div>
        )}
      </div>

      {/* Image */}
      <div className={`flex-shrink-0 rounded-xl overflow-hidden bg-cream ${variant === 'full' ? 'w-16 h-16' : 'w-12 h-12'}`}>
        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-lg text-charcoal/20">{restaurant.name[0]}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-charcoal truncate">{restaurant.name}</h4>
        <p className="text-xs text-muted-text truncate">{restaurant.cuisine} · {restaurant.location}</p>
      </div>

      {/* Movement */}
      <div className="flex-shrink-0 w-12 text-center">
        <MovementBadge movement={ranking.movement} />
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <div className="font-bold text-charcoal">{Math.round(ranking.score)}</div>
        <div className="text-xs text-muted-text">Score</div>
      </div>
    </button>
  );
}
