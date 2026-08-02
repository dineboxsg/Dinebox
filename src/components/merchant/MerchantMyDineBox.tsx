import { useState } from 'react';
import { Save, QrCode, Download, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/lib/types';

export function MerchantMyDineBox({ restaurant, onUpdate }: { restaurant: Restaurant; onUpdate: (r: Restaurant) => void }) {
  const [form, setForm] = useState({
    name: restaurant.name,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    address: restaurant.address,
    phone: restaurant.phone,
    website: restaurant.website || '',
    instagram: restaurant.instagram || '',
    facebook: restaurant.facebook || '',
    logo_url: restaurant.logo_url || '',
    cover_image_url: restaurant.cover_image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase.from('restaurants').update({
      name: form.name,
      description: form.description,
      cuisine: form.cuisine,
      address: form.address,
      phone: form.phone,
      website: form.website || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      logo_url: form.logo_url || null,
      cover_image_url: form.cover_image_url || null,
    }).eq('id', restaurant.id).select('*').single();

    if (!error && data) {
      onUpdate(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const publicUrl = `${window.location.origin}/#/d/${restaurant.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = [
    { key: 'name', label: 'Restaurant Name', type: 'text' },
    { key: 'cuisine', label: 'Cuisine', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'instagram', label: 'Instagram', type: 'text' },
    { key: 'facebook', label: 'Facebook', type: 'text' },
    { key: 'logo_url', label: 'Logo Image URL', type: 'url' },
    { key: 'cover_image_url', label: 'Cover Image URL', type: 'url' },
  ] as const;

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-6">My DineBox</h1>

      {/* Status banner */}
      {restaurant.status === 'pending' && (
        <div className="p-4 rounded-2xl bg-orange/10 text-orange-600 text-sm mb-6">
          Your DineBox is being reviewed. You'll be able to publish content once approved.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-beige/40 p-6 mb-6">
        <h2 className="font-semibold text-charcoal mb-4">Restaurant Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium text-charcoal mb-1.5 block">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="input-field"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-charcoal mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="input-field resize-none"
          />
        </div>
        <div className="mt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl border border-beige/40 p-6">
        <h2 className="font-semibold text-charcoal mb-1">Your DineBox QR</h2>
        <p className="text-xs text-muted-text mb-4">Customers scan this to visit your DineBox profile.</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-48 h-48 rounded-2xl bg-cream/40 p-4 flex items-center justify-center">
            <img src={qrUrl} alt="QR Code" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-text mb-2">Your DineBox URL:</p>
            <p className="text-sm font-mono text-charcoal bg-cream/50 p-3 rounded-xl break-all">{publicUrl}</p>
            <div className="flex gap-2 mt-4">
              <a href={qrUrl} download="dinebox-qr.png" className="btn-outline">
                <Download className="w-4 h-4" /> Download QR
              </a>
              <button onClick={copyLink} className="btn-outline">
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
