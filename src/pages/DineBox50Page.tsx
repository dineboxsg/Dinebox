import { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { getRankings } from '@/lib/api';
import type { RankingScore } from '@/lib/types';
import { RankingRow } from '@/components/RankingRow';

export function DineBox50Page() {
  const [rankings, setRankings] = useState<RankingScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankings(50)
      .then(setRankings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="container-page">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange-600 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Singapore's F&B Chart
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-charcoal mb-3">DineBox 50</h1>
          <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto">
            The 50 restaurants performing strongly on DineBox right now. Updated weekly based on recent activity.
          </p>
        </div>

        {/* Rankings */}
        {loading ? (
          <div className="space-y-3 max-w-3xl mx-auto">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {rankings.map((rk) => (
              <RankingRow key={rk.id} rank={rk.rank} restaurant={rk.restaurant} ranking={rk} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
