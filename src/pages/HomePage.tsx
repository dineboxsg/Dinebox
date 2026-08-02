import { useEffect, useState } from 'react';
import { Search, TrendingUp, ArrowRight, Sparkles, Star } from 'lucide-react';
import { navigate } from '@/lib/router';
import { getApprovedRestaurants, getLatestPosts, getActiveDeals, getFeaturedRestaurants, getNewRestaurants, getRankings } from '@/lib/api';
import type { Restaurant, Post, Deal, RankingScore } from '@/lib/types';
import { RestaurantCard } from '@/components/RestaurantCard';
import { PostCard } from '@/components/PostCard';
import { DealCard } from '@/components/DealCard';
import { RankingRow, MovementBadge } from '@/components/RankingRow';

export function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featured, setFeatured] = useState<Restaurant[]>([]);
  const [newRestaurants, setNewRestaurants] = useState<Restaurant[]>([]);
  const [rankings, setRankings] = useState<RankingScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      getApprovedRestaurants(),
      getLatestPosts(8),
      getActiveDeals(6),
      getFeaturedRestaurants(),
      getNewRestaurants(6),
      getRankings(10),
    ])
      .then(([r, p, d, f, n, rk]) => {
        setRestaurants(r);
        setPosts(p);
        setDeals(d);
        setFeatured(f);
        setNewRestaurants(n);
        setRankings(rk);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingRestaurants = rankings.slice(0, 6).map(rk => rk.restaurant).filter(Boolean);

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 to-warm-white" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-orange/5 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-96 h-96 bg-orange/5 rounded-full blur-3xl" />

        <div className="container-page relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange-600 text-sm font-medium mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4" />
              Singapore's Live F&B Discovery Platform
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl font-bold text-charcoal mb-4 animate-slide-up tracking-tight">
              DineBox
            </h1>
            <p className="font-serif text-2xl sm:text-3xl text-charcoal/80 mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              What's happening in Singapore's F&B scene?
            </p>
            <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover the latest deals, new menus, events, restaurant updates and trending food spots.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text group-focus-within:text-orange transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, dishes or what's happening"
                  className="w-full pl-14 pr-6 py-4 sm:py-5 rounded-full bg-white border border-beige/60 shadow-lg shadow-charcoal/5 text-charcoal placeholder:text-muted-text/60 focus:outline-none focus:border-orange/40 focus:ring-4 focus:ring-orange/10 transition-all text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-orange rounded-full px-4 py-2.5"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* TRENDING RIGHT NOW */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange" />
                <span className="text-sm font-medium text-orange uppercase tracking-wider">Trending Right Now</span>
              </div>
              <h2 className="section-title">Trending Right Now</h2>
              <p className="section-subtitle">What's getting attention across Singapore.</p>
            </div>
            <button onClick={() => navigate('/trending')} className="hidden sm:flex btn-ghost">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto no-scrollbar gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 pb-2">
              {trendingRestaurants.map((rest) => {
                const ranking = rankings.find(r => r.restaurant_id === rest.id);
                return <RestaurantCard key={rest.id} restaurant={rest} ranking={ranking} variant="horizontal" />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* DINEBOX 50 */}
      <section className="py-12 sm:py-16 bg-cream/40">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-orange" />
                <span className="text-sm font-medium text-orange uppercase tracking-wider">DineBox 50</span>
              </div>
              <h2 className="section-title">Singapore's F&B Chart</h2>
              <p className="section-subtitle">The restaurants performing strongly on DineBox.</p>
            </div>
            <button onClick={() => navigate('/dinebox-50')} className="hidden sm:flex btn-ghost">
              View DineBox 50 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {rankings.slice(0, 5).map((rk) => (
                <RankingRow key={rk.id} rank={rk.rank} restaurant={rk.restaurant} ranking={rk} />
              ))}
            </div>
          )}
          <div className="mt-6 sm:hidden">
            <button onClick={() => navigate('/dinebox-50')} className="btn-outline w-full">
              View DineBox 50 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* LATEST FEED */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-orange" />
              <span className="text-sm font-medium text-orange uppercase tracking-wider">Latest Feed</span>
            </div>
            <h2 className="section-title">Latest from Singapore's F&B Scene</h2>
            <p className="section-subtitle">Restaurant updates, deals, new menus and more.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DEALS */}
      <section className="py-12 sm:py-16 bg-cream/40">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-orange uppercase tracking-wider">Deals</span>
              </div>
              <h2 className="section-title">Deals Right Now</h2>
              <p className="section-subtitle">Offers currently available from restaurants across Singapore.</p>
            </div>
            <button onClick={() => navigate('/deals')} className="hidden sm:flex btn-ghost">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEW & RISING */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-orange" />
              <span className="text-sm font-medium text-orange uppercase tracking-wider">New & Rising</span>
            </div>
            <h2 className="section-title">New & Rising</h2>
            <p className="section-subtitle">Recently opened restaurants gaining attention.</p>
          </div>

          {loading ? (
            <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-44 rounded-2xl bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
              {newRestaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} variant="horizontal" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 bg-cream/40">
          <div className="container-page">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-orange" />
                <span className="text-sm font-medium text-orange uppercase tracking-wider">Featured</span>
              </div>
              <h2 className="section-title">Featured on DineBox</h2>
              <p className="section-subtitle">Handpicked restaurants to explore.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
