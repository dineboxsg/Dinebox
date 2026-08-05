import { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { getRankings } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { RankingScore } from '@/lib/types';
import { RankingRow } from '@/components/RankingRow';

export function DineBox50Page() {
  const [rankings, setRankings] = useState<RankingScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadRankings = () => {
      getRankings(50)
        .then((data) => {
          setRankings(data);
          setError(false);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    };

    loadRankings();
    const channel = supabase
      .channel('dinebox-50-rankings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ranking_scores' }, loadRankings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        ) : error ? (
          <div className="max-w-3xl mx-auto rounded-2xl bg-cream p-8 text-center">
            <p className="font-medium text-charcoal">We couldn’t load the DineBox 50 right now.</p>
            <p className="mt-1 text-sm text-muted-text">Please refresh the page and try again.</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-2xl bg-cream p-8 text-center">
            <p className="font-medium text-charcoal">No restaurants have been ranked yet.</p>
            <p className="mt-1 text-sm text-muted-text">Check back once DineBox scores have been calculated.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {rankings.map((rk) => rk.restaurant && (
              <RankingRow key={rk.id} rank={rk.rank} restaurant={rk.restaurant} ranking={rk} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
