import { useEffect, useState, useCallback } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

function parseLocation(): Route {
  const [path, queryString] = window.location.pathname.split('?');
  const cleanPath = path || '/';
  return {
    path: cleanPath,
    params: {},
    query: new URLSearchParams(queryString || ''),
  };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseLocation);

  useEffect(() => {
    const handler = () => {
      setRoute(parseLocation());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((to: string) => {
    const normalized = to.startsWith('#') ? to.slice(1) : to;
    const nextPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    window.history.pushState({}, '', nextPath);
    setRoute(parseLocation());
    window.scrollTo(0, 0);
  }, []);

  return { route, navigate };
}

export function navigate(to: string) {
  const normalized = to.startsWith('#') ? to.slice(1) : to;
  const nextPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  window.history.pushState({}, '', nextPath);
}

// Match a path pattern like "/d/:slug" against actual path "/d/bella-napoli"
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
