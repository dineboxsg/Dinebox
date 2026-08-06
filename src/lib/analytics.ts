import { useEffect, useState } from 'react';

const SESSION_KEY = 'dinebox_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useSessionId() {
  const [sessionId] = useState(() => getSessionId());
  return sessionId;
}

export async function trackEvent(
  restaurantId: string,
  eventType: string,
  extra?: { post_id?: string; deal_id?: string; metadata?: Record<string, any> }
) {
  try {
    const sessionId = getSessionId();
    const { error: insertError } = await supabase.from('analytics_events').insert({
      restaurant_id: restaurantId,
      event_type: eventType,
      session_id: sessionId,
      post_id: extra?.post_id ?? null,
      deal_id: extra?.deal_id ?? null,
      metadata: extra?.metadata ?? {},
    });

    if (insertError) throw insertError;

    await supabase.rpc('refresh_dinebox_rankings').catch(() => undefined);
  } catch {
    // silent fail - analytics shouldn't break UX
  }
}

import { supabase } from './supabase';
