import { useEffect, useState } from 'react';
import { Save, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ScoringWeights } from '@/lib/types';

const fields: { key: keyof Pick<ScoringWeights, 'profile_views_weight' | 'post_engagement_weight' | 'deal_interest_weight' | 'follower_growth_weight'>; label: string; description: string }[] = [
  { key: 'profile_views_weight', label: 'Profile views', description: 'How much restaurant page visits influence rankings.' },
  { key: 'post_engagement_weight', label: 'Post engagement', description: 'How much interest in restaurant updates influences rankings.' },
  { key: 'deal_interest_weight', label: 'Deal interest', description: 'How much deal activity influences rankings.' },
  { key: 'follower_growth_weight', label: 'Recommendation growth', description: 'How much new visitor recommendations influence rankings.' },
];

export function AdminSettings() {
  const [weights, setWeights] = useState<ScoringWeights | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('scoring_weights').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setWeights(data as ScoringWeights | null));
  }, []);

  const updateWeight = (key: typeof fields[number]['key'], value: string) => {
    if (!weights) return;
    setWeights({ ...weights, [key]: Number(value) });
  };

  const save = async () => {
    if (!weights) return;
    setSaving(true);
    const { error } = await supabase.from('scoring_weights').update({
      profile_views_weight: weights.profile_views_weight,
      post_engagement_weight: weights.post_engagement_weight,
      deal_interest_weight: weights.deal_interest_weight,
      follower_growth_weight: weights.follower_growth_weight,
      recency_days: weights.recency_days,
    }).eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!weights) return <div className="space-y-3">{[...Array(3)].map((_, index) => <div key={index} className="h-24 rounded-2xl bg-cream animate-pulse" />)}</div>;

  const total = fields.reduce((sum, field) => sum + Number(weights[field.key]), 0);

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center"><SlidersHorizontal className="w-5 h-5" /></div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Platform settings</h1>
          <p className="text-sm text-muted-text mt-1">Configure the signals used for DineBox rankings.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-beige/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="font-semibold text-charcoal">Ranking weights</h2>
            <p className="text-xs text-muted-text mt-1">Weights should add up to 1.00 for a balanced score.</p>
          </div>
          <span className={`badge self-start sm:self-auto ${total === 1 ? 'bg-green-100 text-green-700' : 'bg-orange/10 text-orange-600'}`}>Total: {total.toFixed(2)}</span>
        </div>
        <div className="space-y-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="flex justify-between gap-4 text-sm font-medium text-charcoal"><span>{field.label}</span><span>{Number(weights[field.key]).toFixed(2)}</span></span>
              <span className="block text-xs text-muted-text mt-1 mb-2">{field.description}</span>
              <input type="range" min="0" max="1" step="0.05" value={weights[field.key]} onChange={(event) => updateWeight(field.key, event.target.value)} className="w-full accent-orange" />
            </label>
          ))}
        </div>
        <label className="block mt-7 pt-6 border-t border-beige/40">
          <span className="text-sm font-medium text-charcoal">Recency window (days)</span>
          <span className="block text-xs text-muted-text mt-1 mb-2">How long recent activity should contribute to rankings.</span>
          <input type="number" min="1" value={weights.recency_days} onChange={(event) => setWeights({ ...weights, recency_days: Number(event.target.value) })} className="input-field max-w-40" />
        </label>
        <button onClick={save} disabled={saving} className="btn-primary mt-6 disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
