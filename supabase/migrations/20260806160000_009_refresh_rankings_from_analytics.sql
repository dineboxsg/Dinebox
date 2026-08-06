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
  cumulative_events AS (
    SELECT
      restaurant_id,
      SUM(CASE WHEN event_type = 'profile_view' THEN 1 ELSE 0 END)::int AS profile_views,
      SUM(CASE WHEN event_type = 'post_view' THEN 1 ELSE 0 END)::int AS post_views,
      SUM(CASE WHEN event_type = 'deal_view' THEN 1 ELSE 0 END)::int AS deal_views
    FROM analytics_events
    GROUP BY restaurant_id
  ),
  recommendations AS (
    SELECT restaurant_id, COUNT(*)::int AS recommendation_count
    FROM restaurant_recommendations
    GROUP BY restaurant_id
  ),
  signals AS (
    SELECT
      restaurants.id AS restaurant_id,
      latest_scores.id AS score_id,
      latest_scores.rank AS previous_rank,
      COALESCE(cumulative_events.profile_views, 0) AS profile_views,
      COALESCE(cumulative_events.post_views, 0) AS post_views,
      COALESCE(cumulative_events.deal_views, 0) AS deal_views,
      COALESCE(recommendations.recommendation_count, 0) AS recommendation_count
    FROM restaurants
    LEFT JOIN latest_scores ON latest_scores.restaurant_id = restaurants.id
    LEFT JOIN cumulative_events ON cumulative_events.restaurant_id = restaurants.id
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

CREATE OR REPLACE FUNCTION refresh_dinebox_rankings_on_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM refresh_dinebox_rankings();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_rankings_on_analytics ON analytics_events;
CREATE TRIGGER trg_refresh_rankings_on_analytics
AFTER INSERT ON analytics_events
FOR EACH ROW EXECUTE FUNCTION refresh_dinebox_rankings_on_analytics();

GRANT EXECUTE ON FUNCTION refresh_dinebox_rankings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_dinebox_rankings_on_analytics() TO anon, authenticated;

SELECT refresh_dinebox_rankings();
