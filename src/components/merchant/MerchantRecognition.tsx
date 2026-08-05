import { useEffect, useState } from 'react';
import { Plus, Trash2, X, BadgeCheck, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant, Award } from '@/lib/types';
import { ImageUpload } from '@/components/ImageUpload';

export function MerchantRecognition({ restaurant }: { restaurant: Restaurant }) {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ organisation: '', title: '', year: '', description: '', source_url: '', image_url: '' });

  const load = () => {
    supabase.from('awards').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false })
      .then(({ data }) => { setAwards(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [restaurant.id]);

  const handleSubmit = async () => {
    await supabase.from('awards').insert({
      restaurant_id: restaurant.id,
      organisation: form.organisation,
      title: form.title,
      year: form.year,
      description: form.description,
      source_url: form.source_url || null,
      image_url: form.image_url || null,
      verification_status: 'merchant_submitted',
    });
    setShowForm(false);
    setForm({ organisation: '', title: '', year: '', description: '', source_url: '', image_url: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this award?')) {
      await supabase.from('awards').delete().eq('id', id);
      load();
    }
  };

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    verified: { icon: BadgeCheck, color: 'text-green-600', label: 'Verified' },
    pending: { icon: Clock, color: 'text-orange-600', label: 'Pending' },
    merchant_submitted: { icon: Clock, color: 'text-orange-600', label: 'Merchant Submitted' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Recognition</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Submit Award</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold">Submit Award</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Organisation</label>
                <input type="text" value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} className="input-field" placeholder="Michelin Guide" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Award Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Bib Gourmand" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">Year</label>
                  <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-field" placeholder="2026" />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">Source URL (optional)</label>
                  <input type="url" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
              <ImageUpload label="Award image or logo" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} restaurantId={restaurant.id} folder="awards" optional />
              <button onClick={handleSubmit} className="btn-primary w-full">Submit for Verification</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cream animate-pulse" />)}</div>
      ) : awards.length === 0 ? (
        <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">No recognition added yet. Submit your awards and achievements!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {awards.map(award => {
            const st = statusConfig[award.verification_status] || statusConfig.pending;
            return (
              <div key={award.id} className="bg-white rounded-2xl border border-beige/40 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-charcoal">{award.title}</h4>
                    <p className="text-sm text-muted-text">{award.organisation} · {award.year}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${st.color}`}>
                    <st.icon className="w-4 h-4" /> {st.label}
                  </span>
                </div>
                {award.description && <p className="text-sm text-muted-text mt-2">{award.description}</p>}
                <button onClick={() => handleDelete(award.id)} className="mt-3 text-xs text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
