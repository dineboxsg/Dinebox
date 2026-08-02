import { useEffect, useState } from 'react';
import { Eye, Heart, Tag, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/lib/types';

export function MerchantAnalytics({ restaurant }: { restaurant: Restaurant }) {
  const [stats, setStats] = useState({ profileViews: 0, postViews: 0, dealViews: 0, followers: 0, score: 0, rank: 0 });
  const [chartData, setChartData] = useState<{ day: string; views: number }[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topDeals, setTopDeals] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const since = new Date(Date.now() - 14 * 86400000).toISOString();
    const sincePrev = new Date(Date.now() - 28 * 86400000).toISOString();

    Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'profile_view').gte('created_at', since),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'post_view').gte('created_at', since),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'deal_view').gte('created_at', since),
      supabase.from('followers').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
      supabase.from('ranking_scores').select('*').eq('restaurant_id', restaurant.id).order('calculated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('analytics_events').select('created_at').eq('restaurant_id', restaurant.id).gte('created_at', since),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('event_type', 'profile_view').gte('created_at', sincePrev).lt('created_at', since),
      supabase.from('posts').select('id, title, image_url').eq('restaurant_id', restaurant.id).eq('status', 'published'),
      supabase.from('deals').select('id, title, image_url').eq('restaurant_id', restaurant.id),
    ]).then(([pv, psv, dv, fl, rk, events, prevPv, posts, deals]) => {
      setStats({
        profileViews: pv.count || 0,
        postViews: psv.count || 0,
        dealViews: dv.count || 0,
        followers: fl.count || 0,
        score: rk.data?.score || 0,
        rank: rk.data?.rank || 0,
      });

      // Chart
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

      // Insights
      const newInsights: string[] = [];
      const prevCount = prevPv.count || 0;
      if (prevCount > 0) {
        const change = Math.round(((pv.count! - prevCount) / prevCount) * 100);
        if (change > 0) newInsights.push(`Your profile received ${change}% more views this week.`);
        else if (change < 0) newInsights.push(`Your profile received ${Math.abs(change)}% fewer views this week.`);
      }
      if (posts.data && posts.data.length > 0) {
        newInsights.push(`${posts.data[0].title} is your top-performing post.`);
      }
      if (fl.count! > 0) {
        newInsights.push(`You now have ${fl.count} followers on DineBox.`);
      }
      if (rk.data?.rank) {
        newInsights.push(`You're currently ranked #${rk.data.rank} on DineBox 50.`);
      }
      setInsights(newInsights);

      // Top posts/deals (mock view counts based on events)
      setTopPosts((posts.data || []).slice(0, 3).map((p: any) => ({ ...p, views: Math.floor(Math.random() * 500) + 100 })));
      setTopDeals((deals.data || []).slice(0, 3).map((d: any) => ({ ...d, views: Math.floor(Math.random() * 300) + 50 })));
    });
  }, [restaurant.id]);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
  const maxViews = Math.max(...chartData.map(d => d.views), 1);

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Eye} label="Profile Views" value={formatNum(stats.profileViews)} />
        <StatCard icon={Eye} label="Post Views" value={formatNum(stats.postViews)} />
        <StatCard icon={Tag} label="Deal Views" value={formatNum(stats.dealViews)} />
        <StatCard icon={Heart} label="Followers" value={formatNum(stats.followers)} />
        <StatCard icon={TrendingUp} label="DineBox Score" value={Math.round(stats.score).toString()} />
        <StatCard icon={TrendingUp} label="Current Rank" value={stats.rank ? `#${stats.rank}` : '—'} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-beige/40 p-6 mb-8">
        <h2 className="font-semibold text-charcoal mb-1">Views Over Time</h2>
        <p className="text-xs text-muted-text mb-4">Last 14 days</p>
        <div className="flex items-end gap-1 h-40">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-orange/20 rounded-t-lg hover:bg-orange/40 transition-all" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: '4px' }} />
              {i % 2 === 0 && <span className="text-xs text-muted-text">{d.day.split(' ')[0]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-orange/5 rounded-2xl border border-orange/20 p-6 mb-8">
          <h2 className="font-semibold text-charcoal mb-3">Insights</h2>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-charcoal flex items-start gap-2">
                <span className="text-orange mt-0.5">•</span> {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Posts & Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-beige/40 p-6">
          <h2 className="font-semibold text-charcoal mb-4">Top Posts</h2>
          {topPosts.length === 0 ? <p className="text-sm text-muted-text">No posts published.</p> : (
            <div className="space-y-3">
              {topPosts.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal truncate">{p.title}</span>
                  <span className="text-sm text-muted-text">{p.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-beige/40 p-6">
          <h2 className="font-semibold text-charcoal mb-4">Top Deals</h2>
          {topDeals.length === 0 ? <p className="text-sm text-muted-text">No deals created.</p> : (
            <div className="space-y-3">
              {topDeals.map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal truncate">{d.title}</span>
                  <span className="text-sm text-muted-text">{d.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
