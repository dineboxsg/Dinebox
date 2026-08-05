import { useEffect, useState } from 'react';
import { LayoutDashboard, Store, FileText, Tag, UtensilsCrossed, Award, BarChart3, LogOut, Menu, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import { DEFAULT_RESTAURANT_LOGO } from '@/lib/restaurant-logo';
import type { Restaurant } from '@/lib/types';
import { MerchantOverview } from '@/components/merchant/MerchantOverview';
import { MerchantMyDineBox } from '@/components/merchant/MerchantMyDineBox';
import { MerchantPosts } from '@/components/merchant/MerchantPosts';
import { MerchantDeals } from '@/components/merchant/MerchantDeals';
import { MerchantMenu } from '@/components/merchant/MerchantMenu';
import { MerchantRecognition } from '@/components/merchant/MerchantRecognition';
import { MerchantAnalytics } from '@/components/merchant/MerchantAnalytics';

type Section = 'overview' | 'my-dinebox' | 'posts' | 'deals' | 'menu' | 'recognition' | 'analytics';

export function MerchantDashboard() {
  const { session, loading, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/merchant/login');
    }
  }, [loading, session]);

  useEffect(() => {
    if (session?.user) {
      supabase.from('restaurants').select('*').eq('owner_id', session.user.id).maybeSingle()
        .then(({ data }) => {
          setRestaurant(data);
          setDataLoading(false);
        });
    }
  }, [session]);

  if (loading || dataLoading) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><p className="text-muted-text">Loading...</p></div>;
  }

  if (!session) return null;

  if (!restaurant) {
    return (
      <div className="pt-32 pb-16 text-center container-page">
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">No restaurant found</h1>
        <p className="text-muted-text">We couldn't find a restaurant linked to your account.</p>
      </div>
    );
  }

  const navItems: { id: Section; label: string; icon: LucideIcon }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-dinebox', label: 'My DineBox', icon: Store },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'deals', label: 'Deals', icon: Tag },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'recognition', label: 'Recognition', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-cream/30 pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-beige/40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-charcoal flex items-center justify-center flex-shrink-0">
                <img src={restaurant.logo_url || DEFAULT_RESTAURANT_LOGO} alt={`${restaurant.name} logo`} className="w-full h-full object-contain bg-white p-1" />
              </div>
              <span className="font-serif font-bold text-charcoal truncate">{restaurant.name}</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all ${
                    section === item.id ? 'bg-charcoal text-white' : 'text-charcoal/70 hover:bg-cream'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-beige/40">
              <a
                href={`#/d/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-charcoal/70 hover:bg-cream transition-all"
              >
                <ExternalLink className="w-4 h-4" /> View Public Page
              </a>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-charcoal/70 hover:bg-cream transition-all w-full"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-charcoal/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 min-h-screen">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-beige/40 sticky top-16 z-10">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-cream">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold">{restaurant.name}</span>
            <div className="w-9" />
          </div>

          <div className="p-6 lg:p-8 max-w-5xl">
            {section === 'overview' && <MerchantOverview restaurant={restaurant} greeting={greeting} />}
            {section === 'my-dinebox' && <MerchantMyDineBox restaurant={restaurant} onUpdate={setRestaurant} />}
            {section === 'posts' && <MerchantPosts restaurant={restaurant} />}
            {section === 'deals' && <MerchantDeals restaurant={restaurant} />}
            {section === 'menu' && <MerchantMenu restaurant={restaurant} />}
            {section === 'recognition' && <MerchantRecognition restaurant={restaurant} />}
            {section === 'analytics' && <MerchantAnalytics restaurant={restaurant} />}
          </div>
        </main>
      </div>
    </div>
  );
}
