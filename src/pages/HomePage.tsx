import { useEffect, useState } from 'react';
import { Search, TrendingUp, ArrowRight, Sparkles, Star } from 'lucide-react';
import { navigate } from '@/lib/router';
import { getApprovedRestaurants, getLatestPosts, getActiveDeals, getFeaturedRestaurants, getNewRestaurants, getRankings } from '@/lib/api';
import type { Restaurant, Post, Deal, RankingScore } from '@/lib/types';
import { RestaurantCard } from '@/components/RestaurantCard';
import { PostCard } from '@/components/PostCard';
import { DealCard } from '@/components/DealCard';
import { RankingRow } from '@/components/RankingRow';
import { supabase } from '@/lib/supabase';

const DEFAULT_HERO_BACKGROUND = '/dinebox-scan-background.jpeg';

export function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featured, setFeatured] = useState<Restaurant[]>([]);
  const [newRestaurants, setNewRestaurants] = useState<Restaurant[]>([]);
  const [rankings, setRankings] = useState<RankingScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState(DEFAULT_HERO_BACKGROUND);

  useEffect(() => {
    let active = true;

    async function loadHomePage() {
      const [restaurantsResult, postsResult, dealsResult, featuredResult, newRestaurantsResult, rankingsResult] =
        await Promise.allSettled([
          getApprovedRestaurants(),
          getLatestPosts(8),
          getActiveDeals(6),
          getFeaturedRestaurants(),
          getNewRestaurants(6),
          getRankings(50),
        ]);

      if (!active) return;

      if (restaurantsResult.status === 'fulfilled') setRestaurants(restaurantsResult.value);
      if (postsResult.status === 'fulfilled') setPosts(postsResult.value);
      if (dealsResult.status === 'fulfilled') setDeals(dealsResult.value);
      if (featuredResult.status === 'fulfilled') setFeatured(featuredResult.value);
      if (newRestaurantsResult.status === 'fulfilled') setNewRestaurants(newRestaurantsResult.value);
      if (rankingsResult.status === 'fulfilled') setRankings(rankingsResult.value);
      setLoading(false);
    }

    void loadHomePage();

    const refreshRankings = () => {
      void getRankings(50).then((data) => {
        if (active) setRankings(data);
      });
    };

    const refreshTimer = window.setInterval(refreshRankings, 15_000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const loadHeroBackground = () => {
      supabase.from('site_settings').select('value').eq('key', 'homepage_hero_image_url').maybeSingle()
        .then(({ data }) => {
          if (data?.value) setHeroBackgroundUrl(data.value);
        });
    };
    loadHeroBackground();
    const refreshTimer = window.setInterval(loadHeroBackground, 30_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const rankingLookup = new Map(rankings.map((ranking) => [ranking.restaurant_id, ranking]));
  const rankedRestaurants = rankings
    .map((ranking) => ranking.restaurant)
    .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
  const trendingRestaurants = rankedRestaurants.slice(0, 6);

  return (
    <div className="animate-fade-in bg-warm-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal pt-24 pb-28 sm:pt-32 sm:pb-36">
        <img src={heroBackgroundUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/85 via-orange-600/65 to-charcoal/80" />
        <div className="absolute -top-24 right-[8%] h-96 w-96 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-[8%] h-72 w-72 rounded-full bg-orange/20 blur-3xl" />

        <div className="container-page relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-warm-white shadow-sm backdrop-blur animate-slide-up">
              <Sparkles className="w-4 h-4" />
              Singapore's Live F&B Discovery Platform
            </div>
            <h1 className="mb-5 font-serif text-5xl font-bold tracking-[-0.04em] text-white sm:text-7xl animate-slide-up">
              DineBox
            </h1>
            <p className="mb-4 font-serif text-2xl text-warm-white/90 sm:text-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              What's happening in Singapore's F&B scene?
            </p>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-warm-white/75 sm:text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover the latest deals, new menus, events, restaurant updates and trending food spots.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mx-auto max-w-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="group relative rounded-full border border-white/80 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur">
                <Search className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-text transition-colors group-focus-within:text-orange" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, dishes or what's happening"
                  className="w-full rounded-full border border-transparent bg-transparent py-4 pl-14 pr-28 text-base text-charcoal placeholder:text-muted-text/60 outline-none transition-all focus:border-orange/20 focus:bg-cream/40 sm:py-5"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1/2 hover:bg-charcoal-700 hover:shadow-lg active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-12 flex flex-col border-t-4 border-orange bg-warm-white sm:-mt-16">
      {/* TRENDING RIGHT NOW */}
      <section className="order-2 border-t border-beige/60 bg-warm-white py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-[24px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Trending Right Now</span>
              </div>
              <h2 className="section-title">Trending Right Now</h2>
              <p className="section-subtitle">What's getting attention across Singapore.</p>
            </div>
            <button onClick={() => navigate('/trending')} className="hidden border border-beige/70 bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange/30 hover:text-orange sm:inline-flex sm:items-center sm:gap-2">
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
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {trendingRestaurants.map((rest) => {
                const ranking = rankings.find(r => r.restaurant_id === rest.id);
                return <RestaurantCard key={rest.id} restaurant={rest} ranking={ranking} variant="horizontal" />;
              })}
              {trendingRestaurants.length === 0 && (
                <p className="text-muted-text">No restaurants are available yet. Please check back soon.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* DINEBOX 50 */}
      <section className="order-5 border-t border-beige/60 bg-cream/50 py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-[24px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">DineBox 50</span>
              </div>
              <h2 className="section-title">Singapore's F&B Chart</h2>
              <p className="section-subtitle">The restaurants performing strongly on DineBox.</p>
            </div>
            <button onClick={() => navigate('/dinebox-50')} className="hidden border border-beige/70 bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange/30 hover:text-orange sm:inline-flex sm:items-center sm:gap-2">
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
              {rankings.slice(0, 5).map((rk) => rk.restaurant && (
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
      <section className="order-6 border-t border-beige/60 bg-warm-white py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-10 rounded-[24px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange">Latest Feed</span>
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
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DEALS */}
      <section className="order-4 border-t border-beige/60 bg-orange-50 py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-[24px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal/70">Deals</span>
              </div>
              <h2 className="section-title">Deals Right Now</h2>
              <p className="section-subtitle">Offers currently available from restaurants across Singapore.</p>
            </div>
            <button onClick={() => navigate('/deals')} className="hidden border border-beige/70 bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange/30 hover:text-orange sm:inline-flex sm:items-center sm:gap-2">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEW & RISING */}
      <section className="order-3 border-t border-beige/60 bg-cream/40 py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-10 rounded-[24px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal/70">New & Rising</span>
            </div>
            <h2 className="section-title">New & Rising</h2>
            <p className="section-subtitle">Recently opened restaurants gaining attention.</p>
          </div>

          {loading ? (
            <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-64 rounded-[1.5rem] bg-cream animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {newRestaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} ranking={rankingLookup.get(rest.id)} variant="horizontal" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="order-1 border-t border-beige/60 bg-orange-50 py-16 sm:py-24">
          <div className="container-page">
            <div className="mb-10 rounded-[28px] border border-orange/20 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 px-5 py-5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal/70">Featured</span>
              </div>
              <h2 className="section-title">Featured on DineBox</h2>
              <p className="section-subtitle">Handpicked restaurants to explore.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} ranking={rankingLookup.get(rest.id)} />
              ))}
            </div>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
