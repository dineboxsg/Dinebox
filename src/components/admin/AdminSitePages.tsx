import { useEffect, useState } from 'react';
import { Save, FileText, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultSitePages, type SitePageContent, type SitePageSlug } from '@/lib/site-pages';

const pageOrder: SitePageSlug[] = ['privacy', 'terms', 'contact'];
const DEFAULT_HERO_BACKGROUND = '/dinebox-scan-background.jpeg';

export function AdminSitePages() {
  const [pages, setPages] = useState<Record<SitePageSlug, SitePageContent>>(defaultSitePages);
  const [saving, setSaving] = useState<SitePageSlug | null>(null);
  const [saved, setSaved] = useState<SitePageSlug | null>(null);
  const [heroUrl, setHeroUrl] = useState(DEFAULT_HERO_BACKGROUND);
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroError, setHeroError] = useState('');

  useEffect(() => {
    supabase.from('site_pages').select('*').then(({ data }) => {
      if (!data) return;
      setPages((current) => ({
        ...current,
        ...Object.fromEntries(data.map((page) => [page.slug, page])) as Partial<Record<SitePageSlug, SitePageContent>>,
      }));
    });
    supabase.from('site_settings').select('value').eq('key', 'homepage_hero_image_url').maybeSingle()
      .then(({ data }) => { if (data?.value) setHeroUrl(data.value); });
  }, []);

  const update = (slug: SitePageSlug, key: 'title' | 'content', value: string) => {
    setPages((current) => ({ ...current, [slug]: { ...current[slug], [key]: value } }));
  };

  const save = async (slug: SitePageSlug) => {
    setSaving(slug);
    const { error } = await supabase.from('site_pages').upsert({
      slug,
      title: pages[slug].title.trim(),
      content: pages[slug].content.trim(),
      updated_at: new Date().toISOString(),
    });
    setSaving(null);
    if (!error) {
      setSaved(slug);
      window.setTimeout(() => setSaved(null), 2000);
    }
  };

  const saveHero = async () => {
    setSavingHero(true);
    setHeroError('');
    const { error } = await supabase.from('site_settings').upsert({
      key: 'homepage_hero_image_url',
      value: heroUrl.trim() || DEFAULT_HERO_BACKGROUND,
      updated_at: new Date().toISOString(),
    });
    setSavingHero(false);
    if (error) setHeroError(error.message);
  };

  const uploadHero = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setHeroError('Choose an image smaller than 10 MB.');
      return;
    }
    setUploadingHero(true);
    setHeroError('');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `site-assets/homepage-hero-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('restaurant-media').upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setHeroError(error.message);
    } else {
      const { data } = supabase.storage.from('restaurant-media').getPublicUrl(path);
      setHeroUrl(data.publicUrl);
    }
    setUploadingHero(false);
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center"><FileText className="w-5 h-5" /></div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Site pages</h1>
          <p className="text-sm text-muted-text mt-1">Edit the public legal and contact pages shown in the footer.</p>
        </div>
      </div>
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-beige/40 p-5 sm:p-6">
          <h2 className="font-semibold text-charcoal">Homepage hero background</h2>
          <p className="text-xs text-muted-text mt-1">This photo appears behind “What’s happening in Singapore’s F&amp;B scene?”.</p>
          <img src={heroUrl || DEFAULT_HERO_BACKGROUND} alt="Homepage hero preview" className="mt-4 h-40 w-full rounded-xl object-cover border border-beige/40" />
          <label className="block text-sm font-medium text-charcoal mt-5">Image URL</label>
          <input value={heroUrl} onChange={(event) => setHeroUrl(event.target.value)} className="input-field mt-2" placeholder="https://..." />
          <div className="flex flex-wrap gap-3 mt-4">
            <label className="btn-outline cursor-pointer">
              {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploadingHero ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" onChange={uploadHero} disabled={uploadingHero} className="sr-only" />
            </label>
            <button onClick={saveHero} disabled={savingHero || uploadingHero} className="btn-primary disabled:opacity-60">
              <Save className="w-4 h-4" /> {savingHero ? 'Saving...' : 'Save hero image'}
            </button>
          </div>
          {heroError && <p className="mt-3 text-xs text-red-500">{heroError}</p>}
        </section>
        {pageOrder.map((slug) => (
          <section key={slug} className="bg-white rounded-2xl border border-beige/40 p-5 sm:p-6">
            <label className="block text-sm font-medium text-charcoal">Page title</label>
            <input value={pages[slug].title} onChange={(event) => update(slug, 'title', event.target.value)} className="input-field mt-2" />
            <label className="block text-sm font-medium text-charcoal mt-5">Content</label>
            <p className="text-xs text-muted-text mt-1 mb-2">Use blank lines to separate paragraphs.</p>
            <textarea value={pages[slug].content} onChange={(event) => update(slug, 'content', event.target.value)} rows={8} className="input-field resize-y leading-relaxed" />
            <button onClick={() => save(slug)} disabled={saving === slug} className="btn-primary mt-5 disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving === slug ? 'Saving...' : saved === slug ? 'Saved' : 'Save page'}
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
