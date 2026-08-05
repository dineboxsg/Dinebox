import { useEffect, useState } from 'react';
import { Search, BadgeCheck, Star, Ban, Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_RESTAURANT_LOGO } from '@/lib/restaurant-logo';
import { navigate } from '@/lib/router';
import type { Restaurant } from '@/lib/types';

export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const load = () => {
    let q = supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    if (search) q = q.or(`name.ilike.%${search}%,cuisine.ilike.%${search}%,location.ilike.%${search}%`);
    q.then(({ data }) => { setRestaurants(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [filter, search]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('restaurants').update({ status }).eq('id', id);
    load();
  };

  const toggleVerified = async (r: Restaurant) => {
    await supabase.from('restaurants').update({ verified: !r.verified }).eq('id', r.id);
    load();
  };

  const toggleFeatured = async (r: Restaurant) => {
    await supabase.from('restaurants').update({ featured: !r.featured, featured_at: !r.featured ? new Date().toISOString() : null }).eq('id', r.id);
    load();
  };

  const filters = ['all', 'pending', 'approved', 'suspended', 'closed'];

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    suspended: 'bg-red-100 text-red-700',
    closed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Restaurants</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants..." className="input-field pl-11" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-all ${filter === f ? 'bg-charcoal text-white' : 'bg-cream text-charcoal hover:bg-beige/60'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {restaurants.map(r => (
            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                  <img src={r.logo_url || DEFAULT_RESTAURANT_LOGO} alt={r.name} className="w-full h-full object-contain bg-white p-1" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-charcoal truncate">{r.name}</h4>
                  <p className="text-xs text-muted-text truncate">{r.cuisine} · {r.location}</p>
                </div>
              </div>
              <span className={`badge ${statusColors[r.status]} self-start`}>{r.status}</span>
              <div className="flex gap-1 flex-wrap">
                {r.status === 'pending' && (
                  <button onClick={() => updateStatus(r.id, 'approved')} title="Approve" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check className="w-4 h-4" /></button>
                )}
                {r.status === 'approved' && (
                  <button onClick={() => updateStatus(r.id, 'suspended')} title="Suspend" className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Ban className="w-4 h-4" /></button>
                )}
                {r.status === 'suspended' && (
                  <button onClick={() => updateStatus(r.id, 'approved')} title="Reactivate" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check className="w-4 h-4" /></button>
                )}
                <button onClick={() => toggleVerified(r)} title="Toggle Verified" className={`p-2 rounded-lg ${r.verified ? 'bg-orange/10 text-orange' : 'bg-cream text-muted-text'}`}><BadgeCheck className="w-4 h-4" /></button>
                <button onClick={() => toggleFeatured(r)} title="Toggle Featured" className={`p-2 rounded-lg ${r.featured ? 'bg-orange/10 text-orange' : 'bg-cream text-muted-text'}`}><Star className={`w-4 h-4 ${r.featured ? 'fill-orange' : ''}`} /></button>
                <button onClick={() => navigate(`/d/${r.slug}`)} title="View" className="p-2 rounded-lg bg-cream text-charcoal hover:bg-beige"><ExternalLink className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
