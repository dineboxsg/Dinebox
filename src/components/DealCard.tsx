import { Clock, ArrowRight, MapPin } from 'lucide-react';
import type { Deal, Restaurant } from '@/lib/types';
import { navigate } from '@/lib/router';
import { DEFAULT_RESTAURANT_LOGO } from '@/lib/restaurant-logo';

interface DealCardProps {
  deal: Deal;
  restaurant?: Restaurant;
}

function formatValidity(deal: Deal): string {
  if (!deal.start_date && !deal.end_date) return 'Ongoing';
  const today = new Date();
  const end = deal.end_date ? new Date(deal.end_date) : null;
  const start = deal.start_date ? new Date(deal.start_date) : null;

  if (start && end) {
    if (start.toDateString() === today.toDateString()) return 'Valid today';
    if (start <= today && end >= today) return 'Valid now';
    return `${start.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;
  }
  if (end) {
    if (end >= today) return `Until ${end.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;
    return 'Ended';
  }
  if (start) {
    if (start.toDateString() === today.toDateString()) return 'Valid today';
    return `From ${start.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;
  }
  return 'Ongoing';
}

export function DealCard({ deal, restaurant }: DealCardProps) {
  const rest = restaurant || deal.restaurant;
  const slug = rest?.slug;

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-beige/40 card-hover">
      <button
        onClick={() => slug && navigate(`/r/${slug}?deal=${deal.id}`)}
        className="block w-full text-left"
      >
        <div className="relative h-48 overflow-hidden bg-cream">
          {deal.image_url ? (
            <img
              src={deal.image_url}
              alt={deal.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : rest?.cover_image_url ? (
            <img
              src={rest.cover_image_url}
              alt={deal.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream to-beige flex items-center justify-center">
              <span className="font-serif text-3xl text-charcoal/20">{deal.title[0]}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 badge bg-orange text-white">
            <Clock className="w-3 h-3" />
            <span>{formatValidity(deal)}</span>
          </div>
        </div>
      </button>
      <div className="p-5">
        {rest && (
          <button onClick={() => navigate(`/r/${rest.slug}`)} className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-cream flex-shrink-0">
              <img src={rest.logo_url || DEFAULT_RESTAURANT_LOGO} alt={rest.name} loading="lazy" className="w-full h-full object-contain bg-white p-1" />
            </div>
            <span className="text-xs text-muted-text">{rest.name} · {rest.location}</span>
          </button>
        )}
        <button onClick={() => slug && navigate(`/r/${slug}?deal=${deal.id}`)} className="block text-left w-full">
          <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">{deal.title}</h3>
          <p className="text-sm text-muted-text line-clamp-2">{deal.description}</p>
        </button>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-text flex items-center gap-1">
            {deal.start_time && deal.end_time ? `${deal.start_time}–${deal.end_time}` : formatValidity(deal)}
          </span>
          <button
            onClick={() => slug && navigate(`/r/${slug}?deal=${deal.id}`)}
            className="text-sm font-medium text-charcoal hover:text-orange flex items-center gap-1 transition-colors"
          >
            View Deal
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
