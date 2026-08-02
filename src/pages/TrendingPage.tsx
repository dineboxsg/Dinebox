import { useEffect, useState } from 'react';
import { getRankings, getActiveDeals, getNewRestaurants } from '@/lib/api';
import type { RankingScore, Deal, Restaurant } from '@/lib/types';
import { RestaurantCard } from '@/components/RestaurantCard';
import { DealCard } from '@/components/DealCard';

type FilterType = 'all' | 'restaurants' | 'deals' | 'new';

export function TrendingPage() {
  const [rankings, setRankings] = useState<RankingScore[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [newRestaurants, setNewRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    Promise.all([getRankings(20), getActiveDeals(6), getNewRestaurants(8)])
      .then(([rk, d, n]) => {
        setRankings(rk);
        setDeals(d);
        setNewRestaurants(n);
      })
      .finally(() => setLoading(false));
  }, []);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Restaurants', value: 'restaurants' },
    { label: 'Deals', value: 'deals' },
    { label: 'New', value: 'new' },
  ];

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal mb-2">Trending Right Now</h1>
          <p className="text-base text-muted-text">The restaurants getting the most attention on DineBox.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-charcoal text-white'
                  : 'bg-cream text-charcoal hover:bg-beige/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-cream animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {(filter === 'all' || filter === 'restaurants') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {rankings.slice(0, filter === 'restaurants' ? 20 : 6).map((rk) => (
                  <RestaurantCard key={rk.id} restaurant={rk.restaurant} ranking={rk} />
                ))}
              </div>
            )}

            {(filter === 'all' || filter === 'deals') && (
              <div className="mb-12">
                {filter === 'all' && (
                  <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">Trending Deals</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </div>
            )}

            {(filter === 'all' || filter === 'new') && (
              <div>
                {filter === 'all' && (
                  <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">New & Rising</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newRestaurants.map((rest) => (
                    <RestaurantCard key={rest.id} restaurant={rest} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
