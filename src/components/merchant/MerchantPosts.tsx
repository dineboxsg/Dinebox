import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant, Post, PostType } from '@/lib/types';
import { ImageUpload } from '@/components/ImageUpload';

const postTypes: { value: PostType; label: string }[] = [
  { value: 'update', label: 'Update' },
  { value: 'deal', label: 'Deal' },
  { value: 'new_menu', label: 'New Menu' },
  { value: 'new_dish', label: 'New Dish' },
  { value: 'event', label: 'Event' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'collaboration', label: 'Collaboration' },
];

export function MerchantPosts({ restaurant }: { restaurant: Restaurant }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ type: 'update' as PostType, title: '', description: '', image_url: '', cta_text: '', cta_url: '' });

  const load = () => {
    supabase.from('posts').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [restaurant.id]);

  const handleSubmit = async (status: 'draft' | 'published') => {
    const payload = {
      restaurant_id: restaurant.id,
      type: form.type,
      title: form.title,
      description: form.description,
      image_url: form.image_url || null,
      cta_text: form.cta_text || null,
      cta_url: form.cta_url || null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    if (editing) {
      await supabase.from('posts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('posts').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ type: 'update', title: '', description: '', image_url: '', cta_text: '', cta_url: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this post?')) {
      await supabase.from('posts').delete().eq('id', id);
      load();
    }
  };

  const handleEdit = (post: Post) => {
    setEditing(post);
    setForm({
      type: post.type,
      title: post.title,
      description: post.description,
      image_url: post.image_url || '',
      cta_text: post.cta_text || '',
      cta_url: post.cta_url || '',
    });
    setShowForm(true);
  };

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Posts</h1>
        <button onClick={() => { setEditing(null); setForm({ type: 'update', title: '', description: '', image_url: '', cta_text: '', cta_url: '' }); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">{editing ? 'Edit Post' : 'Create Post'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PostType })} className="input-field">
                  {postTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="New Truffle Pasta" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" placeholder="Tell customers about it..." />
              </div>
              <ImageUpload label="Post image" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} restaurantId={restaurant.id} folder="posts" optional />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">CTA Text (optional)</label>
                  <input type="text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input-field" placeholder="View Menu" />
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">CTA URL (optional)</label>
                  <input type="url" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleSubmit('draft')} className="btn-outline flex-1">Save Draft</button>
                <button onClick={() => handleSubmit('published')} className="btn-primary flex-1">Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cream animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">No posts yet. Create your first post!</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-cream flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-charcoal truncate">{post.title}</h4>
                <p className="text-xs text-muted-text">{post.type.replace('_', ' ')}</p>
              </div>
              <span className={`badge ${statusColors[post.status]}`}>{post.status}</span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(post)} className="p-2 rounded-lg hover:bg-cream"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-cream text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
