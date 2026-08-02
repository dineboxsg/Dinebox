import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from('reviews').select('*, restaurant(name)').order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleHide = async (r: any) => {
    await supabase.from('reviews').update({ hidden: !r.hidden }).eq('id', r.id);
    load();
  };

  const remove = async (id: string) => {
    if (confirm('Delete this review?')) { await supabase.from('reviews').delete().eq('id', id); load(); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Reviews</h1>
      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded-2xl bg-white border border-beige/40">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-charcoal">{r.author_name} · {r.restaurant?.name}</h4>
                  <p className="text-xs text-muted-text">{'★'.repeat(r.rating)} · {new Date(r.created_at).toLocaleDateString('en-SG')}</p>
                </div>
                {r.hidden && <span className="badge bg-gray-100 text-gray-600">Hidden</span>}
              </div>
              <p className="text-sm text-charcoal">{r.text}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleHide(r)} className="btn-outline text-xs py-1.5">
                  <Eye className="w-3.5 h-3.5" /> {r.hidden ? 'Unhide' : 'Hide'}
                </button>
                <button onClick={() => remove(r.id)} className="btn-outline text-xs py-1.5 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
