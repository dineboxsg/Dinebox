import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant, Deal } from '@/lib/types';

export function MerchantDeals({ restaurant }: { restaurant: Restaurant }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', image_url: '',
    start_date: '', end_date: '', start_time: '', end_time: '', terms: '',
  });

  const load = () => {
    supabase.from('deals').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false })
      .then(({ data }) => { setDeals(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [restaurant.id]);

  const handleSubmit = async (status: 'draft' | 'live') => {
    const payload = {
      restaurant_id: restaurant.id,
      title: form.title,
      description: form.description,
      image_url: form.image_url || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      terms: form.terms,
      status,
    };
    if (editing) {
      await supabase.from('deals').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('deals').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', description: '', image_url: '', start_date: '', end_date: '', start_time: '', end_time: '', terms: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this deal?')) {
      await supabase.from('deals').delete().eq('id', id);
      load();
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditing(deal);
    setForm({
      title: deal.title, description: deal.description, image_url: deal.image_url || '',
      start_date: deal.start_date || '', end_date: deal.end_date || '',
      start_time: deal.start_time || '', end_time: deal.end_time || '', terms: deal.terms,
    });
    setShowForm(true);
  };

  const statusColors: Record<string, string> = {
    live: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    ended: 'bg-red-100 text-red-700',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Deals</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', image_url: '', start_date: '', end_date: '', start_time: '', end_time: '', terms: '' }); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Deal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">{editing ? 'Edit Deal' : 'Create Deal'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Deal Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="2-for-1 Pasta" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Image URL</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">Start Time</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">End Time</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Terms & Conditions</label>
                <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleSubmit('draft')} className="btn-outline flex-1">Save Draft</button>
                <button onClick={() => handleSubmit('live')} className="btn-primary flex-1">Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cream animate-pulse" />)}</div>
      ) : deals.length === 0 ? (
        <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">No deals yet. Create your first deal!</p>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
              {deal.image_url ? (
                <img src={deal.image_url} alt={deal.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-cream flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-charcoal truncate">{deal.title}</h4>
                <p className="text-xs text-muted-text">{deal.end_date ? `Until ${deal.end_date}` : 'Ongoing'}</p>
              </div>
              <span className={`badge ${statusColors[deal.status]}`}>{deal.status}</span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(deal)} className="p-2 rounded-lg hover:bg-cream"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(deal.id)} className="p-2 rounded-lg hover:bg-cream text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
