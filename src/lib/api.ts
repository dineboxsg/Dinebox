import { supabase } from './supabase';
import type { Restaurant, Post, Deal, MenuItem, MenuCategory, Review, Award, RankingScore } from './types';

// ============ RESTAURANTS ============

export async function getApprovedRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('status', 'approved')
    .eq('featured', true)
    .order('featured_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getNewRestaurants(limit = 6): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function searchRestaurants(query: string): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('status', 'approved')
    .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20);
  if (error) throw error;
  return data || [];
}

// ============ POSTS ============

export async function getLatestPosts(limit = 10): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, restaurant:restaurants!inner(*)')
    .eq('status', 'published')
    .eq('restaurant.status', 'approved')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getRestaurantPosts(restaurantId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ DEALS ============

export async function getActiveDeals(limit = 12): Promise<Deal[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('deals')
    .select('*, restaurant:restaurants!inner(*)')
    .eq('status', 'live')
    .eq('restaurant.status', 'approved')
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getRestaurantDeals(restaurantId: string): Promise<Deal[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'live')
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ MENU ============

export async function getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ============ REVIEWS ============

export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('hidden', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ AWARDS ============

export async function getRestaurantAwards(restaurantId: string): Promise<Award[]> {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .in('verification_status', ['verified', 'merchant_submitted'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ RANKINGS ============

export async function getRankings(limit = 50): Promise<RankingScore[]> {
  const { data, error } = await supabase
    .from('ranking_scores')
    .select('*, restaurant:restaurants!inner(*)')
    .eq('restaurant.status', 'approved')
    .order('rank', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getRestaurantRanking(restaurantId: string): Promise<RankingScore | null> {
  const { data, error } = await supabase
    .from('ranking_scores')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface RecommendationStatus {
  count: number;
  recommended: boolean;
}

export async function getRecommendationStatus(restaurantId: string, sessionId: string): Promise<RecommendationStatus> {
  const { data, error } = await supabase.rpc('get_recommendation_status', {
    p_restaurant_id: restaurantId,
    p_session_id: sessionId,
  });
  if (error) throw error;
  return {
    count: Number(data?.count ?? 0),
    recommended: Boolean(data?.recommended),
  };
}

export async function recommendRestaurant(restaurantId: string, sessionId: string): Promise<{ count: number; ranking: RankingScore | null }> {
  const { data, error } = await supabase.rpc('recommend_restaurant', {
    p_restaurant_id: restaurantId,
    p_session_id: sessionId,
  });
  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  return {
    count: Number(result?.recommendation_count ?? 0),
    ranking: result?.ranking ?? null,
  };
}

// ============ FOLLOWERS ============

export async function getFollowerCount(restaurantId: string): Promise<number> {
  const { count, error } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId);
  if (error) throw error;
  return count || 0;
}

export async function isFollowing(restaurantId: string, sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleFollow(restaurantId: string, sessionId: string, following: boolean): Promise<boolean> {
  if (following) {
    await supabase.from('followers').delete().eq('restaurant_id', restaurantId).eq('session_id', sessionId);
    return false;
  } else {
    await supabase.from('followers').insert({ restaurant_id: restaurantId, session_id: sessionId });
    return true;
  }
}
