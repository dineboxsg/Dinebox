import { useEffect, useState } from 'react';
import { Check, X, BadgeCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminAwards() {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from('awards').select('*, restaurant(name)').order('created_at', { ascending: false })
      .then(({ data }) => { setAwards(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('awards').update({ verification_status: status }).eq('id', id);
    load();
  };

  const statusColors: Record<string, string> = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    merchant_submitted: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">Awards</h1>
      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {awards.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-charcoal truncate">{a.title}</h4>
                <p className="text-xs text-muted-text">{a.restaurant?.name} · {a.organisation} · {a.year}</p>
              </div>
              <span className={`badge ${statusColors[a.verification_status]}`}>{a.verification_status.replace('_', ' ')}</span>
              <div className="flex gap-1">
                {a.verification_status !== 'verified' && (
                  <button onClick={() => updateStatus(a.id, 'verified')} title="Verify" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><BadgeCheck className="w-4 h-4" /></button>
                )}
                {a.verification_status !== 'rejected' && (
                  <button onClick={() => updateStatus(a.id, 'rejected')} title="Reject" className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
