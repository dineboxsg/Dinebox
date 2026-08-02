import { useEffect, useState } from 'react';
import { Trash2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from('deals').select('*, restaurant(name)').order('created_at', { ascending: false })
      .then(({ data }) => { setDeals(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (confirm('Remove this deal?')) { await supabase.from('deals').delete().eq('id', id); load(); }
  };

  const toggleFeatured = async (deal: any) => {
    await supabase.from('deals').update({ featured: !deal.featured }).eq('id', deal.id);
    load();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Deals</h1>
      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {deals.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
              {d.image_url ? <img src={d.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-cream" />}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-charcoal truncate">{d.title}</h4>
                <p className="text-xs text-muted-text">{d.restaurant?.name} · {d.end_date || 'Ongoing'}</p>
              </div>
              <span className="text-xs text-muted-text">{d.status}</span>
              <button onClick={() => toggleFeatured(d)} className={`p-2 rounded-lg ${d.featured ? 'bg-orange/10 text-orange' : 'bg-cream text-muted-text'}`}><Star className={`w-4 h-4 ${d.featured ? 'fill-orange' : ''}`} /></button>
              <button onClick={() => remove(d.id)} className="p-2 rounded-lg bg-cream text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
