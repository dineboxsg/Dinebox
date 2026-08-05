-- Store one recommendation per anonymous browser session and restaurant.
CREATE TABLE IF NOT EXISTS restaurant_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_restaurant_created
  ON restaurant_recommendations (restaurant_id, created_at DESC);

ALTER TABLE restaurant_recommendations ENABLE ROW LEVEL SECURITY;

-- Recommendation writes and reads are only exposed through the RPC functions below.
REVOKE ALL ON TABLE restaurant_recommendations FROM anon, authenticated;

CREATE OR REPLACE FUNCTION refresh_dinebox_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  weights scoring_weights%ROWTYPE;
BEGIN
  SELECT * INTO weights FROM scoring_weights WHERE id = 1;

  -- Ensure every approved restaurant has a current score row before ranking all of them together.
  INSERT INTO ranking_scores (
    restaurant_id, score, rank, movement, period,
    profile_views, post_views, deal_views, follower_growth, calculated_at
  )
  SELECT id, 0, 0, 'NEW', 'live', 0, 0, 0, 0, now()
  FROM restaurants
  WHERE status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM ranking_scores WHERE ranking_scores.restaurant_id = restaurants.id
    );

  WITH latest_scores AS (
    SELECT DISTINCT ON (restaurant_id)
      id, restaurant_id, rank, profile_views, post_views, deal_views
    FROM ranking_scores
    ORDER BY restaurant_id, calculated_at DESC
  ),
  recommendations AS (
    SELECT restaurant_id, COUNT(*)::int AS recommendation_count
    FROM restaurant_recommendations
    WHERE created_at >= now() - make_interval(days => weights.recency_days)
    GROUP BY restaurant_id
  ),
  signals AS (
    SELECT
      restaurants.id AS restaurant_id,
      latest_scores.id AS score_id,
      latest_scores.rank AS previous_rank,
      COALESCE(latest_scores.profile_views, 0) AS profile_views,
      COALESCE(latest_scores.post_views, 0) AS post_views,
      COALESCE(latest_scores.deal_views, 0) AS deal_views,
      COALESCE(recommendations.recommendation_count, 0) AS recommendation_count
    FROM restaurants
    LEFT JOIN latest_scores ON latest_scores.restaurant_id = restaurants.id
    LEFT JOIN recommendations ON recommendations.restaurant_id = restaurants.id
    WHERE restaurants.status = 'approved'
  ),
  maximums AS (
    SELECT
      GREATEST(MAX(profile_views), 1) AS profile_views,
      GREATEST(MAX(post_views), 1) AS post_views,
      GREATEST(MAX(deal_views), 1) AS deal_views,
      GREATEST(MAX(recommendation_count), 1) AS recommendation_count
    FROM signals
  ),
  scored AS (
    SELECT
      signals.*,
      ROUND((100 * (
        weights.profile_views_weight * signals.profile_views::numeric / maximums.profile_views +
        weights.post_engagement_weight * signals.post_views::numeric / maximums.post_views +
        weights.deal_interest_weight * signals.deal_views::numeric / maximums.deal_views +
        weights.follower_growth_weight * signals.recommendation_count::numeric / maximums.recommendation_count
      ))::numeric, 2) AS score
    FROM signals
    CROSS JOIN maximums
  ),
  ranked AS (
    SELECT *, DENSE_RANK() OVER (ORDER BY score DESC, restaurant_id) AS new_rank
    FROM scored
  )
  UPDATE ranking_scores
  SET
    score = ranked.score,
    rank = ranked.new_rank::int,
    previous_rank = ranked.previous_rank,
    movement = CASE
      WHEN ranked.previous_rank IS NULL THEN 'NEW'
      WHEN ranked.previous_rank > ranked.new_rank::int THEN '↑ ' || (ranked.previous_rank - ranked.new_rank::int)
      WHEN ranked.previous_rank < ranked.new_rank::int THEN '↓ ' || (ranked.new_rank::int - ranked.previous_rank)
      ELSE '—'
    END,
    period = 'live',
    profile_views = ranked.profile_views,
    post_views = ranked.post_views,
    deal_views = ranked.deal_views,
    follower_growth = ranked.recommendation_count,
    calculated_at = now()
  FROM ranked
  WHERE ranking_scores.id = ranked.score_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_recommendation_status(p_restaurant_id uuid, p_session_id text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'count', (SELECT COUNT(*) FROM restaurant_recommendations WHERE restaurant_id = p_restaurant_id),
    'recommended', EXISTS (
      SELECT 1 FROM restaurant_recommendations
      WHERE restaurant_id = p_restaurant_id AND session_id = p_session_id
    )
  );
$$;

CREATE OR REPLACE FUNCTION recommend_restaurant(p_restaurant_id uuid, p_session_id text)
RETURNS TABLE (recommendation_count bigint, ranking jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(trim(p_session_id)) = 0 THEN
    RAISE EXCEPTION 'A session ID is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM restaurants WHERE id = p_restaurant_id AND status = 'approved') THEN
    RAISE EXCEPTION 'Restaurant is not available for recommendations';
  END IF;

  INSERT INTO restaurant_recommendations (restaurant_id, session_id)
  VALUES (p_restaurant_id, p_session_id)
  ON CONFLICT (restaurant_id, session_id) DO NOTHING;

  PERFORM refresh_dinebox_rankings();

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM restaurant_recommendations WHERE restaurant_id = p_restaurant_id),
    (SELECT to_jsonb(ranking_scores) FROM ranking_scores
     WHERE restaurant_id = p_restaurant_id ORDER BY calculated_at DESC LIMIT 1);
END;
$$;

REVOKE ALL ON FUNCTION refresh_dinebox_rankings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_recommendation_status(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION recommend_restaurant(uuid, text) TO anon, authenticated;

SELECT refresh_dinebox_rankings();
