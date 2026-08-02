import { useEffect, useState } from 'react';
import { getActiveDeals } from '@/lib/api';
import type { Deal } from '@/lib/types';
import { DealCard } from '@/components/DealCard';

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveDeals(24)
      .then(setDeals)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="container-page">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal mb-2">Deals Right Now</h1>
          <p className="text-base text-muted-text max-w-2xl">
            Discover offers currently available from restaurants across Singapore.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-cream animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-text">No active deals right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
