import { useEffect, useState } from 'react';
import { LayoutDashboard, Store, FileText, Tag, Award, Star, BarChart3, LogOut, Menu, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import type { Restaurant } from '@/lib/types';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminRestaurants } from '@/components/admin/AdminRestaurants';
import { AdminPosts } from '@/components/admin/AdminPosts';
import { AdminDeals } from '@/components/admin/AdminDeals';
import { AdminAwards } from '@/components/admin/AdminAwards';
import { AdminReviews } from '@/components/admin/AdminReviews';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';

type Section = 'overview' | 'restaurants' | 'posts' | 'deals' | 'awards' | 'reviews' | 'analytics';

export function AdminDashboard() {
  const { profile, session, loading, signOut } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/admin/login');
    }
    if (!loading && session && profile && profile.role !== 'admin') {
      navigate('/');
    }
  }, [loading, session, profile]);

  if (loading || !session) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><p className="text-muted-text">Loading...</p></div>;
  }

  if (profile?.role !== 'admin') return null;

  const navItems: { id: Section; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: Store },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'deals', label: 'Deals', icon: Tag },
    { id: 'awards', label: 'Awards', icon: Award },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-cream/30 pt-16">
      <div className="flex">
        <aside className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-beige/40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange" />
              </div>
              <span className="font-serif font-bold text-charcoal">Admin</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all ${
                    section === item.id ? 'bg-charcoal text-white' : 'text-charcoal/70 hover:bg-cream'
                  }`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-beige/40">
              <button onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-charcoal/70 hover:bg-cream transition-all w-full">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-20 bg-charcoal/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-h-screen">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-beige/40 sticky top-16 z-10">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-cream"><Menu className="w-5 h-5" /></button>
            <span className="font-serif font-bold">Admin Dashboard</span>
            <div className="w-9" />
          </div>

          <div className="p-6 lg:p-8 max-w-5xl">
            {section === 'overview' && <AdminOverview />}
            {section === 'restaurants' && <AdminRestaurants />}
            {section === 'posts' && <AdminPosts />}
            {section === 'deals' && <AdminDeals />}
            {section === 'awards' && <AdminAwards />}
            {section === 'reviews' && <AdminReviews />}
            {section === 'analytics' && <AdminAnalytics />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  if (loading) return <div className="pt-20 min-h-screen flex items-center justify-center"><p className="text-muted-text">Loading...</p></div>;
  if (session) navigate('/admin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setSigningIn(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center animate-fade-in">
      <div className="container-page max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-beige/40 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-charcoal">Admin Login</h1>
              <p className="text-xs text-muted-text">DineBox Administration</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="admin@dinebox.sg" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={signingIn} className="btn-primary w-full py-3">{signingIn ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="text-xs text-muted-text text-center mt-4">
            Admin access is restricted to authorized DineBox staff.
          </p>
        </div>
      </div>
    </div>
  );
}
