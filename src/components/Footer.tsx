import { navigate } from '@/lib/router';
import { Instagram, Facebook, Mail, MapPin, ArrowUpRight } from 'lucide-react';

const discoverLinks = [
  { label: 'Trending', path: '/trending' },
  { label: 'Deals', path: '/deals' },
  { label: 'DineBox 50', path: '/dinebox-50' },
  { label: 'Search', path: '/search' },
];

const businessLinks = [
  { label: 'Create Your DineBox', path: '/for-businesses' },
  { label: 'Merchant Login', path: '/merchant/login' },
  { label: 'Merchant Signup', path: '/merchant/signup' },
];

const legalLinks = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Contact Us', path: '/contact' },
];

export function Footer() {
  return (
    <footer className="relative bg-charcoal text-warm-white mt-20 overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-orange/5 blur-3xl" />
      </div>

      <div className="relative container-page py-16">
        {/* Top section: brand statement + newsletter */}
        <div className="pb-14 border-b border-warm-white/10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:gap-16 lg:items-start">
            <div className="max-w-xl text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
              <img src="/DINEBOXLOGOTRANSPARENT.png" alt="DineBox" className="w-12 h-12 object-contain" />
              <span className="font-sans text-2xl font-bold tracking-tight">DineBox</span>
            </div>
            <p className="text-warm-white/60 text-base leading-relaxed">
              Singapore's live F&B discovery platform. Find trending restaurants, exclusive deals, and the places everyone's talking about.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-warm-white/5 border border-warm-white/10 flex items-center justify-center text-warm-white/70 hover:bg-orange hover:text-charcoal hover:border-orange transition-all duration-300 hover:scale-110"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-warm-white/5 border border-warm-white/10 flex items-center justify-center text-warm-white/70 hover:bg-orange hover:text-charcoal hover:border-orange transition-all duration-300 hover:scale-110"
              >
                <Facebook size={18} />
              </a>
              <a
                href="mailto:hello@dinebox.sg"
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-warm-white/5 border border-warm-white/10 flex items-center justify-center text-warm-white/70 hover:bg-orange hover:text-charcoal hover:border-orange transition-all duration-300 hover:scale-110"
              >
                <Mail size={18} />
              </a>
            </div>
            </div>

            <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold mb-2">Stay in the loop</h3>
            <p className="text-warm-white/50 text-sm mb-5">
              Get the latest deals, trending spots, and DineBox 50 updates delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-warm-white/5 border border-warm-white/15 text-warm-white placeholder:text-warm-white/30 text-sm focus:outline-none focus:border-orange focus:bg-warm-white/10 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-orange text-charcoal font-semibold text-sm hover:bg-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-orange/30 flex items-center justify-center gap-1.5 group"
              >
                Subscribe
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
            </div>
          </div>
        </div>

        {/* Middle section: link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 py-14 max-w-4xl mx-auto">
          {/* Discover */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange mb-5">Discover</h4>
            <ul className="space-y-3.5">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-warm-white/70 hover:text-warm-white text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-orange transition-all duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange mb-5">For Businesses</h4>
            <ul className="space-y-3.5">
              {businessLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-warm-white/70 hover:text-warm-white text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-orange transition-all duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange mb-5">Legal</h4>
            <ul className="space-y-3.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-warm-white/70 hover:text-warm-white text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-orange transition-all duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-warm-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-warm-white/40 text-sm">© 2026 DineBox. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange/70" />
            <p className="text-warm-white/40 text-sm">Singapore</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
