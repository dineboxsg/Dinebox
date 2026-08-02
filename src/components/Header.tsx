import { useEffect, useState } from 'react';
import { Search, Menu, X, ChevronRight } from 'lucide-react';
import { navigate } from '@/lib/router';

const navLinks = [
  { label: 'Discover', path: '/' },
  { label: 'Trending', path: '/trending' },
  { label: 'Deals', path: '/deals' },
  { label: 'DineBox 50', path: '/dinebox-50' },
];

export function Header({ onSearch }: { onSearch?: (q: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      onSearch?.(searchQuery.trim());
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-warm-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
            >
              <img src="/DINEBOXLOGOTRANSPARENT.png" alt="DineBox" className="w-9 h-9 object-contain" />
              <span className={`font-sans text-xl font-bold ${scrolled ? 'text-charcoal' : 'text-charcoal'}`}>
                DineBox
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium text-charcoal/70 hover:text-charcoal hover:bg-cream/60 transition-all"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream/60 transition-all"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-charcoal" />
              </button>
              <button
                onClick={() => navigate('/for-businesses')}
                className="hidden md:inline-flex btn-outline"
              >
                For Businesses
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream/60 transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="hidden md:block absolute top-full left-0 right-0 bg-warm-white border-t border-beige/40 shadow-lg animate-slide-up-sm">
            <div className="container-page py-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants, dishes or what's happening"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-cream/50 border border-beige/60 text-charcoal placeholder:text-muted-text/60 focus:outline-none focus:border-orange/50"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85%] bg-warm-white shadow-2xl animate-slide-up-sm p-6 pt-20">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, dishes..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-cream/50 border border-beige/60 focus:outline-none focus:border-orange/50"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-cream/60 transition-all text-left"
                >
                  <span className="font-medium text-charcoal">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-text" />
                </button>
              ))}
              <div className="h-px bg-beige/40 my-3" />
              <button
                onClick={() => {
                  navigate('/for-businesses');
                  setMobileOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-cream/60 transition-all text-left"
              >
                <span className="font-medium text-charcoal">For Businesses</span>
                <ChevronRight className="w-4 h-4 text-muted-text" />
              </button>
              <button
                onClick={() => {
                  navigate('/merchant/login');
                  setMobileOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-cream/60 transition-all text-left"
              >
                <span className="font-medium text-charcoal">Merchant Login</span>
                <ChevronRight className="w-4 h-4 text-muted-text" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
