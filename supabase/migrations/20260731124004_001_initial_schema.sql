/*
# DineBox Initial Schema

## Overview
Creates the complete database schema for DineBox, a Singapore F&B discovery platform.

## New Tables
- `users` - Extends auth.users with role (merchant/admin) and display name
- `restaurants` - Restaurant profiles owned by merchants
- `posts` - Restaurant updates, deals, new menus, events, etc.
- `deals` - Time-limited promotional offers
- `menu_categories` - Menu sections (e.g. Pasta, Drinks)
- `menu_items` - Individual dishes within categories
- `reviews` - Consumer reviews with optional owner responses
- `awards` - Restaurant recognition (Michelin, DineBox 50, etc.)
- `followers` - Consumer follows (session-based, no account required)
- `analytics_events` - Tracks views, clicks, follows for ranking + analytics
- `ranking_scores` - Computed DineBox scores and ranks

## Security
- RLS enabled on all tables
- Public read access for approved restaurants and published content
- Merchant write access scoped to own restaurant via owner_id
- Admin full access via service role (bypasses RLS)
- Consumers can follow without an account (anon inserts allowed)
*/

-- ============================================
-- USERS (profile extension of auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'merchant' CHECK (role IN ('merchant', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- RESTAURANTS
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  cover_image_url text,
  description text DEFAULT '',
  cuisine text NOT NULL DEFAULT '',
  address text DEFAULT '',
  location text DEFAULT '',
  postal_code text DEFAULT '',
  phone text DEFAULT '',
  website text,
  instagram text,
  facebook text,
  other_links jsonb DEFAULT '[]'::jsonb,
  opening_hours jsonb DEFAULT '{}'::jsonb,
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'closed')),
  verified boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  featured_at timestamptz,
  opening_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_featured ON restaurants(featured);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Public can read approved restaurants
DROP POLICY IF EXISTS "public_read_approved_restaurants" ON restaurants;
CREATE POLICY "public_read_approved_restaurants" ON restaurants FOR SELECT
  TO anon, authenticated USING (status = 'approved');

-- Owners can read their own restaurant (even pending)
DROP POLICY IF EXISTS "owner_read_own_restaurant" ON restaurants;
CREATE POLICY "owner_read_own_restaurant" ON restaurants FOR SELECT
  TO authenticated USING (owner_id = auth.uid());

-- Owners can insert restaurants
DROP POLICY IF EXISTS "owner_insert_restaurant" ON restaurants;
CREATE POLICY "owner_insert_restaurant" ON restaurants FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

-- Owners can update their own restaurant
DROP POLICY IF EXISTS "owner_update_restaurant" ON restaurants;
CREATE POLICY "owner_update_restaurant" ON restaurants FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Owners can delete their own restaurant
DROP POLICY IF EXISTS "owner_delete_restaurant" ON restaurants;
CREATE POLICY "owner_delete_restaurant" ON restaurants FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

-- ============================================
-- POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'update' CHECK (type IN ('update', 'deal', 'new_menu', 'new_dish', 'event', 'promotion', 'announcement', 'collaboration')),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text,
  cta_text text,
  cta_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  scheduled_for timestamptz,
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_restaurant ON posts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts (through approved restaurant)
DROP POLICY IF EXISTS "public_read_published_posts" ON posts;
CREATE POLICY "public_read_published_posts" ON posts FOR SELECT
  TO anon, authenticated USING (
    status = 'published'
    AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.status = 'approved')
  );

-- Owner can read all their own posts
DROP POLICY IF EXISTS "owner_read_posts" ON posts;
CREATE POLICY "owner_read_posts" ON posts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can insert posts
DROP POLICY IF EXISTS "owner_insert_post" ON posts;
CREATE POLICY "owner_insert_post" ON posts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can update posts
DROP POLICY IF EXISTS "owner_update_post" ON posts;
CREATE POLICY "owner_update_post" ON posts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can delete posts
DROP POLICY IF EXISTS "owner_delete_post" ON posts;
CREATE POLICY "owner_delete_post" ON posts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = posts.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- DEALS
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text,
  start_date date,
  end_date date,
  start_time text,
  end_time text,
  terms text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'ended')),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_restaurant ON deals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals(end_date);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Public can read live deals (through approved restaurant)
DROP POLICY IF EXISTS "public_read_live_deals" ON deals;
CREATE POLICY "public_read_live_deals" ON deals FOR SELECT
  TO anon, authenticated USING (
    status = 'live'
    AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.status = 'approved')
  );

-- Owner can read all their own deals
DROP POLICY IF EXISTS "owner_read_deals" ON deals;
CREATE POLICY "owner_read_deals" ON deals FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can insert deals
DROP POLICY IF EXISTS "owner_insert_deal" ON deals;
CREATE POLICY "owner_insert_deal" ON deals FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can update deals
DROP POLICY IF EXISTS "owner_update_deal" ON deals;
CREATE POLICY "owner_update_deal" ON deals FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- Owner can delete deals
DROP POLICY IF EXISTS "owner_delete_deal" ON deals;
CREATE POLICY "owner_delete_deal" ON deals FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = deals.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- MENU CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_cat_restaurant ON menu_categories(restaurant_id);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_menu_categories" ON menu_categories;
CREATE POLICY "public_read_menu_categories" ON menu_categories FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "owner_read_menu_categories" ON menu_categories;
CREATE POLICY "owner_read_menu_categories" ON menu_categories FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_menu_category" ON menu_categories;
CREATE POLICY "owner_insert_menu_category" ON menu_categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_menu_category" ON menu_categories;
CREATE POLICY "owner_update_menu_category" ON menu_categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_menu_category" ON menu_categories;
CREATE POLICY "owner_delete_menu_category" ON menu_categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- MENU ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric DEFAULT 0,
  image_url text,
  popular boolean NOT NULL DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(popular);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "owner_read_menu_items" ON menu_items;
CREATE POLICY "owner_read_menu_items" ON menu_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_menu_item" ON menu_items;
CREATE POLICY "owner_insert_menu_item" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_menu_item" ON menu_items;
CREATE POLICY "owner_update_menu_item" ON menu_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_menu_item" ON menu_items;
CREATE POLICY "owner_delete_menu_item" ON menu_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text DEFAULT '',
  image_url text,
  dish_name text,
  owner_response text,
  owner_response_at timestamptz,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hidden ON reviews(hidden);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (
    hidden = false
    AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "owner_read_reviews" ON reviews;
CREATE POLICY "owner_read_reviews" ON reviews FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_insert_review" ON reviews;
CREATE POLICY "anon_insert_review" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "owner_update_review" ON reviews;
CREATE POLICY "owner_update_review" ON reviews FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- AWARDS
-- ============================================
CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  organisation text NOT NULL,
  title text NOT NULL,
  year text NOT NULL DEFAULT '',
  description text DEFAULT '',
  source_url text,
  image_url text,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'merchant_submitted')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_awards_restaurant ON awards(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_awards_status ON awards(verification_status);

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_verified_awards" ON awards;
CREATE POLICY "public_read_verified_awards" ON awards FOR SELECT
  TO anon, authenticated USING (
    verification_status IN ('verified', 'merchant_submitted')
    AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "owner_read_awards" ON awards;
CREATE POLICY "owner_read_awards" ON awards FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_award" ON awards;
CREATE POLICY "owner_insert_award" ON awards FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_award" ON awards;
CREATE POLICY "owner_update_award" ON awards FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_award" ON awards;
CREATE POLICY "owner_delete_award" ON awards FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = awards.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- FOLLOWERS (session-based, no account needed)
-- ============================================
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_restaurant ON followers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_followers_session ON followers(session_id);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_followers" ON followers;
CREATE POLICY "public_read_followers" ON followers FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = followers.restaurant_id AND restaurants.status = 'approved')
  );

DROP POLICY IF EXISTS "anon_follow" ON followers;
CREATE POLICY "anon_follow" ON followers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_unfollow" ON followers;
CREATE POLICY "anon_unfollow" ON followers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- ANALYTICS EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('profile_view', 'post_view', 'deal_view', 'follow', 'menu_view', 'qr_scan', 'website_click', 'directions_click', 'order_click', 'reserve_click', 'share')),
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_restaurant ON analytics_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can create analytics events (for tracking)
DROP POLICY IF EXISTS "anon_insert_analytics" ON analytics_events;
CREATE POLICY "anon_insert_analytics" ON analytics_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Owner can read their own analytics
DROP POLICY IF EXISTS "owner_read_analytics" ON analytics_events;
CREATE POLICY "owner_read_analytics" ON analytics_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = analytics_events.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- RANKING SCORES
-- ============================================
CREATE TABLE IF NOT EXISTS ranking_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  rank int NOT NULL DEFAULT 0,
  previous_rank int,
  movement text DEFAULT '—',
  period text NOT NULL DEFAULT 'weekly',
  profile_views int DEFAULT 0,
  post_views int DEFAULT 0,
  deal_views int DEFAULT 0,
  follower_growth int DEFAULT 0,
  calculated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ranking_restaurant ON ranking_scores(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ranking_score ON ranking_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_period ON ranking_scores(period);

ALTER TABLE ranking_scores ENABLE ROW LEVEL SECURITY;

-- Public can read rankings for approved restaurants
DROP POLICY IF EXISTS "public_read_rankings" ON ranking_scores;
CREATE POLICY "public_read_rankings" ON ranking_scores FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = ranking_scores.restaurant_id AND restaurants.status = 'approved')
  );

-- Owner can read their own rankings
DROP POLICY IF EXISTS "owner_read_rankings" ON ranking_scores;
CREATE POLICY "owner_read_rankings" ON ranking_scores FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = ranking_scores.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_notifications" ON notifications;
CREATE POLICY "user_read_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_notifications" ON notifications;
CREATE POLICY "user_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_notifications" ON notifications;
CREATE POLICY "user_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_notifications" ON notifications;
CREATE POLICY "user_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================
-- SCORING WEIGHTS (admin-adjustable)
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_weights (
  id int PRIMARY KEY DEFAULT 1,
  profile_views_weight numeric NOT NULL DEFAULT 0.40,
  post_engagement_weight numeric NOT NULL DEFAULT 0.25,
  deal_interest_weight numeric NOT NULL DEFAULT 0.20,
  follower_growth_weight numeric NOT NULL DEFAULT 0.15,
  recency_days int NOT NULL DEFAULT 14,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO scoring_weights (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE scoring_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_scoring_weights" ON scoring_weights;
CREATE POLICY "public_read_scoring_weights" ON scoring_weights FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================
-- HANDLE NEW USER SIGNUP - auto create user profile
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'merchant');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS restaurants_updated_at ON restaurants;
CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS deals_updated_at ON deals;
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS menu_items_updated_at ON menu_items;
CREATE TRIGGER menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
