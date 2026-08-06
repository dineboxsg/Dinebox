import { useEffect, useState } from 'react';
import { MapPin, Star, BadgeCheck, Clock, Phone, Globe, Instagram, Facebook, Share2, ArrowLeft, ThumbsUp } from 'lucide-react';
import { getRestaurantBySlug, getRestaurantPosts, getRestaurantDeals, getMenuCategories, getMenuItems, getRestaurantReviews, getRestaurantAwards, getRestaurantRanking, getRecommendationStatus, recommendRestaurant } from '@/lib/api';
import { getSessionId, trackEvent } from '@/lib/analytics';
import { navigate } from '@/lib/router';
import { DEFAULT_RESTAURANT_LOGO } from '@/lib/restaurant-logo';
import type { Restaurant, Post, Deal, MenuCategory, MenuItem, Review, Award, RankingScore } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { DealCard } from '@/components/DealCard';

const dayNames: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export function RestaurantProfilePage({ slug }: { slug: string; dealId?: string }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [ranking, setRanking] = useState<RankingScore | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getRestaurantBySlug(slug),
    ]).then(async ([rest]) => {
      setRestaurant(rest);
      if (rest) {
        trackEvent(rest.id, 'profile_view');
        const [p, d, c, m, r, a, rk, recommendationStatus] = await Promise.all([
          getRestaurantPosts(rest.id),
          getRestaurantDeals(rest.id),
          getMenuCategories(rest.id),
          getMenuItems(rest.id),
          getRestaurantReviews(rest.id),
          getRestaurantAwards(rest.id),
          getRestaurantRanking(rest.id),
          getRecommendationStatus(rest.id, getSessionId()).catch(() => ({ count: 0, recommended: false })),
        ]);
        setPosts(p);
        setDeals(d);
        setCategories(c);
        setMenuItems(m);
        setReviews(r);
        setAwards(a);
        setRanking(rk);
        setRecommended(recommendationStatus.recommended);
        setRecommendationCount(recommendationStatus.count);
      }
      setLoading(false);
    });
  }, [slug]);

  const handleRecommend = async () => {
    if (!restaurant) return;
    if (recommended) return;

    try {
      const result = await recommendRestaurant(restaurant.id, getSessionId());
      setRecommended(true);
      setRecommendationCount(result.count);
      setRanking(result.ranking);
    } catch {
      // Keep the button available when the recommendation service is unavailable.
    }
  };

  const handleDirections = () => {
    if (!restaurant) return;
    trackEvent(restaurant.id, 'directions_click');
    window.open(`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`, '_blank');
  };

  const handleShare = () => {
    if (!restaurant) return;
    trackEvent(restaurant.id, 'share');
    if (navigator.share) {
      navigator.share({ title: restaurant.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="h-80 bg-cream animate-pulse" />
        <div className="container-page py-8">
          <div className="h-8 w-64 bg-cream rounded animate-pulse mb-4" />
          <div className="h-4 w-48 bg-cream rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="pt-32 pb-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Restaurant not found</h1>
        <p className="text-muted-text mb-6">This restaurant doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Back to DineBox</button>
      </div>
    );
  }

  const popularItems = menuItems.filter(m => m.popular);
  const itemsByCategory = categories.map(cat => ({
    category: cat,
    items: menuItems.filter(m => m.category_id === cat.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="animate-fade-in">
      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 bg-cream overflow-hidden">
        {restaurant.cover_image_url && (
          <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
        <button
          onClick={() => navigate('/')}
          className="absolute top-20 sm:top-24 left-4 sm:left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm backdrop-blur text-charcoal text-sm font-medium hover:bg-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="container-page">
        {/* Header */}
        <div className="relative pt-6 sm:pt-8 pb-2">
          <div className="rounded-3xl bg-warm-white/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none p-4 sm:p-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          {/* Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white shadow-xl ring-4 ring-warm-white flex-shrink-0">
            <img src={restaurant.logo_url || DEFAULT_RESTAURANT_LOGO} alt={restaurant.name} className="w-full h-full object-contain bg-white p-3" />
          </div>

          {/* Info */}
          <div className="flex-1 sm:pb-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">{restaurant.name}</h1>
              {restaurant.verified && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange/10 text-orange-600 text-xs font-medium">
                  <BadgeCheck className="w-4 h-4" /> DineBox Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-text flex-wrap">
              <span>{restaurant.cuisine}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurant.location}</span>
              {restaurant.rating > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-orange text-orange" />
                    {restaurant.rating.toFixed(1)} ({restaurant.review_count} reviews)
                  </span>
                </>
              )}
            </div>
          </div>

            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 sm:ml-36 sm:pl-6 mt-5">
              <button
                onClick={handleRecommend}
                aria-pressed={recommended}
                className={`btn-outline w-full min-w-0 !px-2 sm:!px-4 ${recommended ? '!border-orange/40 !bg-orange/10 !text-orange-600' : ''}`}
              >
                <ThumbsUp className={`w-4 h-4 flex-shrink-0 ${recommended ? 'fill-current' : ''}`} />
                <span className="truncate">{recommended ? 'Recommended' : 'Recommend'}</span>
              </button>
              <button onClick={handleDirections} className="btn-orange w-full min-w-0 !px-2 sm:!px-4 shadow-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Get Directions</span>
              </button>
              <button onClick={handleShare} className="btn-outline w-full min-w-0 !px-2 sm:!px-4">
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Score & Ranking */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {ranking && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cream">
              <span className="text-2xl font-bold text-charcoal">{Math.round(ranking.score)}</span>
              <span className="text-sm text-muted-text">DineBox Score</span>
            </div>
          )}
          {ranking && ranking.rank <= 50 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange/10">
              <span className="text-sm font-medium text-orange-600">DineBox 50</span>
              <span className="text-lg font-bold text-orange-600">#{ranking.rank}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cream">
            <span className="text-lg font-bold text-charcoal">{recommendationCount}</span>
            <span className="text-sm text-muted-text">Recommendations</span>
          </div>
        </div>

        {/* Optional buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {restaurant.website && (
            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="btn-ghost"
              onClick={() => trackEvent(restaurant.id, 'website_click')}>
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
          {restaurant.instagram && (
            <a href={`https://instagram.com/${restaurant.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          )}
          {restaurant.facebook && (
            <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Facebook className="w-4 h-4" /> Facebook
            </a>
          )}
        </div>

        {/* ABOUT */}
        {restaurant.description && (
          <section className="mt-12">
            <h2 className="section-title mb-4">About</h2>
            <p className="text-muted-text leading-relaxed max-w-3xl">{restaurant.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream/50">
                <MapPin className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Address</h4>
                  <p className="text-sm text-muted-text">{restaurant.address}</p>
                  {restaurant.postal_code && <p className="text-sm text-muted-text">Singapore {restaurant.postal_code}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream/50">
                <Phone className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Contact</h4>
                  <p className="text-sm text-muted-text">{restaurant.phone}</p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="mt-4 p-4 rounded-2xl bg-cream/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange" />
                <h4 className="text-sm font-semibold text-charcoal">Opening Hours</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(restaurant.opening_hours || {}).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-muted-text">{dayNames[day] || day}</span>
                    <span className="text-charcoal font-medium">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HAPPENING NOW */}
        <section className="mt-12">
          <h2 className="section-title mb-4">Happening Now</h2>
          {posts.length === 0 ? (
            <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">This restaurant hasn't posted anything yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>

        {/* DEALS */}
        {deals.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Deals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} restaurant={restaurant} />
              ))}
            </div>
          </section>
        )}

        {/* MENU */}
        <section className="mt-12" id="menu" onClick={() => trackEvent(restaurant.id, 'menu_view')}>
          <h2 className="section-title mb-4">Menu</h2>
          {itemsByCategory.length === 0 ? (
            <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">Menu coming soon.</p>
          ) : (
            <div className="space-y-8">
              {itemsByCategory.map(({ category, items }) => (
                <div key={category.id}>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-3">{category.name}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-cream/40 hover:bg-cream/60 transition-all">
                        {item.image_url && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                            <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-charcoal">{item.name}</h4>
                            {item.popular && (
                              <span className="badge bg-orange/10 text-orange-600 text-xs">Popular</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-text mt-1">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-charcoal">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* POPULAR */}
        {popularItems.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Popular Dishes</h2>
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
              {popularItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-64">
                  <div className="h-40 rounded-2xl overflow-hidden bg-cream">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h4 className="font-semibold text-charcoal mt-3">{item.name}</h4>
                  <p className="text-sm text-muted-text">{item.description}</p>
                  <p className="font-bold text-charcoal mt-1">${item.price}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECOGNITION */}
        <section className="mt-12">
          <h2 className="section-title mb-4">Recognition</h2>
          {awards.length === 0 ? (
            <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">No recognition added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award) => (
                <div key={award.id} className="p-5 rounded-2xl bg-cream/50 border border-beige/40">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-charcoal">{award.title}</h4>
                      <p className="text-sm text-muted-text">{award.organisation}</p>
                    </div>
                    {award.verification_status === 'verified' && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <BadgeCheck className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                  {award.year && <p className="text-sm text-charcoal font-medium">{award.year}</p>}
                  {award.description && <p className="text-sm text-muted-text mt-1">{award.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* REVIEWS */}
        <section className="mt-12 mb-8">
          <h2 className="section-title mb-4">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-text p-8 text-center rounded-2xl bg-cream/40">Be the first to review this restaurant.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 rounded-2xl bg-cream/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                        <span className="font-semibold text-orange-600">{review.author_name[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal">{review.author_name}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-orange text-orange' : 'text-beige'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-text">{new Date(review.created_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-charcoal leading-relaxed">{review.text}</p>
                  {review.dish_name && <p className="text-sm text-muted-text mt-2">Ordered: {review.dish_name}</p>}
                  {review.owner_response && (
                    <div className="mt-4 p-4 rounded-xl bg-white border border-beige/40">
                      <p className="text-xs font-semibold text-muted-text mb-1">Response from {restaurant.name}</p>
                      <p className="text-sm text-charcoal">{review.owner_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
