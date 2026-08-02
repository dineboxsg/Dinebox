import { useEffect, useState } from 'react';
import { Store, Clock, Eye, FileText, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminOverview() {
  const [stats, setStats] = useState({ totalRestaurants: 0, pending: 0, totalViews: 0, totalPosts: 0, activeDeals: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('restaurants').select('*', { count: 'exact', head: true }),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    ]).then(([r, p, v, posts, deals]) => {
      setStats({
        totalRestaurants: r.count || 0,
        pending: p.count || 0,
        totalViews: v.count || 0,
        totalPosts: posts.count || 0,
        activeDeals: deals.count || 0,
      });
    });
  }, []);

  const cards = [
    { icon: Store, label: 'Total Restaurants', value: stats.totalRestaurants },
    { icon: Clock, label: 'Pending Approval', value: stats.pending },
    { icon: Eye, label: 'Total Views', value: stats.totalViews },
    { icon: FileText, label: 'Total Posts', value: stats.totalPosts },
    { icon: Tag, label: 'Active Deals', value: stats.activeDeals },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-beige/40 p-5">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-3">
              <card.icon className="w-5 h-5 text-orange" />
            </div>
            <p className="text-2xl font-bold text-charcoal">{card.value}</p>
            <p className="text-xs text-muted-text">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
