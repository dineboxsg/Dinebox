import { useEffect, useState, useCallback } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

function parseLocation(): Route {
  const path = window.location.pathname || '/';
  return {
    path,
    params: {},
    query: new URLSearchParams(window.location.search),
  };
}

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function notifyRouteChange() {
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function toPath(to: string) {
  const normalized = to.startsWith('#') ? to.slice(1) : to;
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseLocation);

  useEffect(() => {
    const handler = () => {
      setRoute(parseLocation());
      scrollToTop();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', toPath(to));
    scrollToTop();
    notifyRouteChange();
  }, []);

  return { route, navigate };
}

export function navigate(to: string) {
  window.history.pushState({}, '', toPath(to));
  scrollToTop();
  notifyRouteChange();
}

// Match a path pattern like "/r/:slug" against actual path "/r/bella-napoli"
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
