import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { useRouter, matchRoute, navigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { TrendingPage } from '@/pages/TrendingPage';
import { DealsPage } from '@/pages/DealsPage';
import { DineBox50Page } from '@/pages/DineBox50Page';
import { RestaurantProfilePage } from '@/pages/RestaurantProfilePage';
import { SearchPage } from '@/pages/SearchPage';
import { ForBusinessesPage } from '@/pages/ForBusinessesPage';
import { MerchantLoginPage, MerchantSignupPage } from '@/pages/MerchantAuth';
import { MerchantDashboard } from '@/pages/MerchantDashboard';
import { AdminDashboard, AdminLoginPage } from '@/pages/AdminDashboard';
import { SitePage } from '@/pages/SitePage';

function AppContent() {
  const { route } = useRouter();
  const path = route.path;

  useEffect(() => {
    const applyFavicon = (url: string) => {
      const normalized = url?.trim() || '/favicon.svg';
      const current = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null;
      if (current) {
        current.href = normalized;
        return;
      }
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = normalized;
      document.head.appendChild(link);
    };

    let active = true;
    supabase.from('site_settings').select('value').eq('key', 'site_favicon_url').maybeSingle().then(({ data }) => {
      if (!active) return;
      applyFavicon(data?.value || '/favicon.svg');
    });

    return () => {
      active = false;
    };
  }, []);

  // Admin routes (no public header/footer)
  if (path === '/admin') return <AdminDashboard />;
  if (path === '/admin/login') return <AdminLoginPage />;

  // Merchant routes (no public header/footer)
  if (path === '/merchant') return <MerchantDashboard />;
  if (path === '/merchant/login') return <MerchantLoginPage />;
  if (path === '/merchant/signup') return <MerchantSignupPage />;

  // Public routes (with header/footer)
  let page: React.ReactNode;
  let showChrome = true;

  if (path === '/' || path === '/discover') {
    page = <HomePage />;
  } else if (path === '/trending') {
    page = <TrendingPage />;
  } else if (path === '/deals') {
    page = <DealsPage />;
  } else if (path === '/dinebox-50') {
    page = <DineBox50Page />;
  } else if (path === '/search') {
    page = <SearchPage query={route.query.get('q') || ''} />;
  } else if (path === '/for-businesses') {
    page = <ForBusinessesPage />;
  } else if (path === '/privacy') {
    page = <SitePage slug="privacy" />;
  } else if (path === '/terms') {
    page = <SitePage slug="terms" />;
  } else if (path === '/contact') {
    page = <SitePage slug="contact" />;
  } else {
    const restMatch = matchRoute('/r/:slug', path) ?? matchRoute('/d/:slug', path);
    if (restMatch) {
      page = <RestaurantProfilePage slug={restMatch.slug} dealId={route.query.get('deal') || undefined} />;
    } else {
      page = (
        <div className="pt-32 pb-16 text-center container-page">
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-2">404</h1>
          <p className="text-muted-text mb-6">This page doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to DineBox</button>
        </div>
      );
    }
  }

  return (
    <>
      {showChrome && <Header />}
      <main>{page}</main>
      {showChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
