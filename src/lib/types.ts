export type RestaurantStatus = 'pending' | 'approved' | 'suspended' | 'closed';
export type PostType = 'update' | 'deal' | 'new_menu' | 'new_dish' | 'event' | 'promotion' | 'announcement' | 'collaboration';
export type PostStatus = 'draft' | 'published' | 'scheduled';
export type DealStatus = 'draft' | 'live' | 'ended';
export type AwardStatus = 'pending' | 'verified' | 'rejected' | 'merchant_submitted';
export type UserRole = 'merchant' | 'admin';
export type AnalyticsEventType =
  | 'profile_view' | 'post_view' | 'deal_view' | 'follow'
  | 'menu_view' | 'qr_scan' | 'website_click' | 'directions_click'
  | 'order_click' | 'reserve_click' | 'share';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string;
  cuisine: string;
  address: string;
  location: string;
  postal_code: string;
  phone: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  other_links: any[];
  opening_hours: Record<string, string>;
  rating: number;
  review_count: number;
  status: RestaurantStatus;
  verified: boolean;
  featured: boolean;
  featured_at: string | null;
  opening_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  restaurant_id: string;
  type: PostType;
  title: string;
  description: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  status: PostStatus;
  scheduled_for: string | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

export interface Deal {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  terms: string;
  status: DealStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  text: string;
  image_url: string | null;
  dish_name: string | null;
  owner_response: string | null;
  owner_response_at: string | null;
  hidden: boolean;
  created_at: string;
}

export interface Award {
  id: string;
  restaurant_id: string;
  organisation: string;
  title: string;
  year: string;
  description: string;
  source_url: string | null;
  image_url: string | null;
  verification_status: AwardStatus;
  created_at: string;
}

export interface Follower {
  id: string;
  restaurant_id: string;
  session_id: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  restaurant_id: string;
  event_type: AnalyticsEventType;
  post_id: string | null;
  deal_id: string | null;
  session_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface RankingScore {
  id: string;
  restaurant_id: string;
  score: number;
  rank: number;
  previous_rank: number | null;
  movement: string;
  period: string;
  profile_views: number;
  post_views: number;
  deal_views: number;
  follower_growth: number;
  calculated_at: string;
  restaurant?: Restaurant;
}

export interface Notification {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ScoringWeights {
  id: number;
  profile_views_weight: number;
  post_engagement_weight: number;
  deal_interest_weight: number;
  follower_growth_weight: number;
  recency_days: number;
  updated_at: string;
}
