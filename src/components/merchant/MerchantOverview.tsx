import { useEffect, useState } from 'react';
import { Eye, Heart, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant, Post } from '@/lib/types';

export function MerchantOverview({ restaurant, greeting }: { restaurant: Restaurant; greeting: string }) {
  const [stats, setStats] = useState({ profileViews: 0, postViews: 0, followers: 0, score: 0, rank: 0 });
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [chartData, setChartData] = useState<{ day: string; views: number }[]>([]);

  useEffect(() => {
    const since = new Date(Date.now() - 14 * 86400000).toISOString();
    Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'profile_view').gte('created_at', since),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'post_view').gte('created_at', since),
      supabase.from('followers').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
      supabase.from('ranking_scores').select('*').eq('restaurant_id', restaurant.id).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('posts').select('*, analytics_events!inner(count)').eq('restaurant_id', restaurant.id).eq('status', 'published'),
      supabase.from('analytics_events').select('created_at').eq('restaurant_id', restaurant.id).gte('created_at', since),
    ]).then(([pv, psv, fl, rk, posts, events]) => {
      setStats({
        profileViews: pv.count || 0,
        postViews: psv.count || 0,
        followers: fl.count || 0,
        score: rk.data?.score || 0,
        rank: rk.data?.rank || 0,
      });

      // Build chart data (last 14 days)
      const dayMap: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
        dayMap[key] = 0;
      }
      (events.data || []).forEach((e: any) => {
        const key = new Date(e.created_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
        if (key in dayMap) dayMap[key]++;
      });
      setChartData(Object.entries(dayMap).map(([day, views]) => ({ day, views })));

      // Top posts by views
      const postsWithViews = (posts.data || []).map((p: any) => ({
        ...p,
        viewCount: (p.analytics_events as any)?.[0]?.count || 0,
      })).sort((a: any, b: any) => b.viewCount - a.viewCount).slice(0, 5);
      setTopPosts(postsWithViews);
    });
  }, [restaurant.id]);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  const maxViews = Math.max(...chartData.map(d => d.views), 1);

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-1">
        {greeting}, {restaurant.name}
      </h1>
      <p className="text-sm text-muted-text mb-6">Here's how your DineBox is performing.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Eye} label="Profile Views" value={formatNum(stats.profileViews)} />
        <StatCard icon={Eye} label="Post Views" value={formatNum(stats.postViews)} />
        <StatCard icon={Heart} label="Followers" value={formatNum(stats.followers)} />
        <StatCard icon={TrendingUp} label="DineBox Score" value={Math.round(stats.score).toString()} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-beige/40 p-6 mb-8">
        <h2 className="font-semibold text-charcoal mb-1">Your DineBox Performance</h2>
        <p className="text-xs text-muted-text mb-4">Views over the last 14 days</p>
        <div className="flex items-end gap-1 h-40">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-orange/20 rounded-t-lg hover:bg-orange/40 transition-all relative" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: '4px' }}>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-charcoal opacity-0 group-hover:opacity-100 transition-opacity">{d.views}</span>
              </div>
              {i % 2 === 0 && <span className="text-xs text-muted-text">{d.day.split(' ')[0]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-2xl border border-beige/40 p-6">
        <h2 className="font-semibold text-charcoal mb-4">Top Posts</h2>
        {topPosts.length === 0 ? (
          <p className="text-sm text-muted-text">No posts published yet.</p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post: any) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-cream/50 transition-all">
                <div className="flex items-center gap-3">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-cream" />
                  )}
                  <div>
                    <h4 className="font-medium text-charcoal text-sm">{post.title}</h4>
                    <p className="text-xs text-muted-text">{post.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-charcoal">{post.viewCount}</span>
                  <span className="text-xs text-muted-text ml-1">views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-beige/40 p-5">
      <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-orange" />
      </div>
      <p className="text-2xl font-bold text-charcoal">{value}</p>
      <p className="text-xs text-muted-text">{label}</p>
    </div>
  );
}
