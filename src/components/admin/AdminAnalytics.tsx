import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';

export function AdminAnalytics() {
  const [topRestaurants, setTopRestaurants] = useState<any[]>([]);
  const [totals, setTotals] = useState({ profileViews: 0, postViews: 0, dealViews: 0, followers: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('ranking_scores').select('*, restaurant(name, cuisine, location, slug)').order('score', { ascending: false }).limit(10),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'profile_view'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'post_view'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'deal_view'),
      supabase.from('followers').select('*', { count: 'exact', head: true }),
    ]).then(([rk, pv, psv, dv, fl]) => {
      setTopRestaurants(rk.data || []);
      setTotals({ profileViews: pv.count || 0, postViews: psv.count || 0, dealViews: dv.count || 0, followers: fl.count || 0 });
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Profile Views" value={totals.profileViews} />
        <StatCard label="Total Post Views" value={totals.postViews} />
        <StatCard label="Total Deal Views" value={totals.dealViews} />
        <StatCard label="Total Followers" value={totals.followers} />
      </div>

      <div className="bg-white rounded-2xl border border-beige/40 p-6">
        <h2 className="font-semibold text-charcoal mb-4">Top Restaurants</h2>
        <div className="space-y-2">
          {topRestaurants.map((rk, i) => (
            <button key={rk.id} onClick={() => navigate(`/d/${rk.restaurant.slug}`)}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream/50 transition-all w-full text-left">
              <span className="font-serif text-lg font-bold text-charcoal/40 w-8">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-charcoal truncate">{rk.restaurant.name}</h4>
                <p className="text-xs text-muted-text">{rk.restaurant.cuisine} · {rk.restaurant.location}</p>
              </div>
              <span className="font-bold text-charcoal">{Math.round(rk.score)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-beige/40 p-5">
      <p className="text-2xl font-bold text-charcoal">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-text">{label}</p>
    </div>
  );
}
