import { Listing } from '../backend';
import CategoryBadge from './CategoryBadge';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  const imageUrl = listing.imageId || '/assets/generated/listing-placeholder.dim_400x300.png';

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 border border-border"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/listing-placeholder.dim_400x300.png';
          }}
        />
        <div className="absolute top-2.5 left-2.5">
          <CategoryBadge category={listing.category} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          by {listing.sellerDisplayName}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
