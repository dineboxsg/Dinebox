import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultSitePages, type SitePageContent, type SitePageSlug } from '@/lib/site-pages';

export function SitePage({ slug }: { slug: SitePageSlug }) {
  const [page, setPage] = useState<SitePageContent>(defaultSitePages[slug]);

  useEffect(() => {
    setPage(defaultSitePages[slug]);
    supabase.from('site_pages').select('*').eq('slug', slug).maybeSingle()
      .then(({ data }) => {
        if (data?.title && data?.content) setPage(data as SitePageContent);
      });
  }, [slug]);

  return (
    <div className="pt-28 pb-16 animate-fade-in">
      <div className="container-page max-w-3xl">
        <div className="rounded-3xl bg-white border border-beige/40 shadow-sm p-6 sm:p-10">
          {slug === 'contact' && <Mail className="w-8 h-8 text-orange mb-5" />}
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">{page.title}</h1>
          <div className="mt-8 space-y-5 text-muted-text leading-relaxed whitespace-pre-line">
            {page.content}
          </div>
          {page.updated_at && (
            <p className="mt-10 pt-5 border-t border-beige/40 text-xs text-muted-text">
              Last updated {new Date(page.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
