import { useEffect, useState } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { searchRestaurants } from '@/lib/api';
import { navigate } from '@/lib/router';
import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from '@/components/RestaurantCard';

export function SearchPage({ query }: { query: string }) {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchRestaurants(query)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      <div className="container-page">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-text hover:text-charcoal mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-6">Search</h1>

        <form onSubmit={handleSearch} className="max-w-2xl mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search restaurants, dishes or what's happening"
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-cream/50 border border-beige/60 focus:outline-none focus:border-orange/50"
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-cream animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-text">No results found for "{query}"</p>
            <p className="text-sm text-muted-text mt-2">Try searching for a cuisine, dish, or location.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-text mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
