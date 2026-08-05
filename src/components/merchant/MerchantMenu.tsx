import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Restaurant, MenuCategory, MenuItem } from '@/lib/types';
import { ImageUpload } from '@/components/ImageUpload';

export function MerchantMenu({ restaurant }: { restaurant: Restaurant }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [catName, setCatName] = useState('');
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '', popular: false });

  const load = async () => {
    const [cats, its] = await Promise.all([
      supabase.from('menu_categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
    ]);
    setCategories(cats.data || []);
    setItems(its.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [restaurant.id]);

  const addCategory = async () => {
    if (!catName.trim()) return;
    await supabase.from('menu_categories').insert({ restaurant_id: restaurant.id, name: catName, sort_order: categories.length });
    setCatName('');
    setShowCatForm(false);
    load();
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Delete this category and all its items?')) {
      await supabase.from('menu_items').delete().eq('category_id', id);
      await supabase.from('menu_categories').delete().eq('id', id);
      load();
    }
  };

  const saveItem = async () => {
    const payload = {
      restaurant_id: restaurant.id,
      category_id: itemForm.category_id || null,
      name: itemForm.name,
      description: itemForm.description,
      price: parseFloat(itemForm.price) || 0,
      image_url: itemForm.image_url || null,
      popular: itemForm.popular,
    };
    if (editingItem) {
      await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('menu_items').insert({ ...payload, sort_order: items.length });
    }
    setShowItemForm(false);
    setEditingItem(null);
    setItemForm({ name: '', description: '', price: '', image_url: '', category_id: '', popular: false });
    load();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('menu_items').delete().eq('id', id);
    load();
  };

  const editItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name, description: item.description, price: item.price.toString(),
      image_url: item.image_url || '', category_id: item.category_id || '', popular: item.popular,
    });
    setShowItemForm(true);
  };

  const togglePopular = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ popular: !item.popular }).eq('id', item.id);
    load();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Menu</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCatForm(true)} className="btn-outline"><Plus className="w-4 h-4" /> Category</button>
          <button onClick={() => { setEditingItem(null); setItemForm({ name: '', description: '', price: '', image_url: '', category_id: categories[0]?.id || '', popular: false }); setShowItemForm(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Item</button>
        </div>
      </div>

      {showCatForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold">Add Category</h2>
              <button onClick={() => setShowCatForm(false)} className="p-2 rounded-lg hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="input-field mb-4" placeholder="Pasta, Drinks..." autoFocus />
            <button onClick={addCategory} className="btn-primary w-full">Add Category</button>
          </div>
        </div>
      )}

      {showItemForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold">{editingItem ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setShowItemForm(false)} className="p-2 rounded-lg hover:bg-cream"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Category</label>
                <select value={itemForm.category_id} onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })} className="input-field">
                  <option value="">Uncategorized</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Name</label>
                <input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="input-field" placeholder="Truffle Pasta" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">Description</label>
                <textarea value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal mb-1.5 block">Price ($)</label>
                  <input type="number" step="0.5" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} className="input-field" placeholder="22" />
                </div>
                <ImageUpload label="Item image" value={itemForm.image_url} onChange={(image_url) => setItemForm({ ...itemForm, image_url })} restaurantId={restaurant.id} folder="menu-items" optional />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={itemForm.popular} onChange={(e) => setItemForm({ ...itemForm, popular: e.target.checked })} className="w-4 h-4 rounded text-orange focus:ring-orange" />
                <span className="text-sm text-charcoal">Mark as Popular</span>
              </label>
              <button onClick={saveItem} className="btn-primary w-full">{editingItem ? 'Save Changes' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cream animate-pulse" />)}</div>
      ) : categories.length === 0 && items.length === 0 ? (
        <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">No menu items yet. Add a category and start building your menu!</p>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-beige/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal">{cat.name}</h3>
                <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-cream text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {items.filter(i => i.category_id === cat.id).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream/40">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-cream" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-text truncate">{item.description}</p>
                    </div>
                    <span className="font-bold text-charcoal text-sm">${item.price}</span>
                    <button onClick={() => togglePopular(item)} className={`p-2 rounded-lg ${item.popular ? 'text-orange' : 'text-muted-text hover:bg-cream'}`}>
                      <Star className={`w-4 h-4 ${item.popular ? 'fill-orange' : ''}`} />
                    </button>
                    <button onClick={() => editItem(item)} className="p-2 rounded-lg hover:bg-cream"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg hover:bg-cream text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {items.filter(i => i.category_id === cat.id).length === 0 && (
                  <p className="text-xs text-muted-text p-2">No items in this category yet.</p>
                )}
              </div>
            </div>
          ))}
          {items.filter(i => !i.category_id).length > 0 && (
            <div className="bg-white rounded-2xl border border-beige/40 p-5">
              <h3 className="font-serif text-lg font-semibold text-charcoal mb-3">Uncategorized</h3>
              <div className="space-y-2">
                {items.filter(i => !i.category_id).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream/40">
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-text">${item.price}</p>
                    </div>
                    <button onClick={() => editItem(item)} className="p-2 rounded-lg hover:bg-cream"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg hover:bg-cream text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
