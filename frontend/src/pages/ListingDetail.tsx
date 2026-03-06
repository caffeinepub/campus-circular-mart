import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle, Calendar, Tag, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllListings } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CategoryBadge from '../components/CategoryBadge';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ListingDetail() {
  const { listingId } = useParams({ from: '/listing/$listingId' });
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [contactRevealed, setContactRevealed] = useState(false);

  const { data: listings = [], isLoading } = useGetAllListings();
  const listing = listings.find((l) => l.id === listingId);

  const imageUrl = listing?.imageId || '/assets/generated/listing-placeholder.dim_400x300.png';

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-serif font-semibold mb-3">Listing Not Found</h2>
        <p className="text-muted-foreground mb-6">This listing may have been removed.</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3] shadow-card">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/generated/listing-placeholder.dim_400x300.png';
            }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl font-serif font-bold text-foreground leading-tight">
                {listing.title}
              </h1>
              <CategoryBadge category={listing.category} size="md" />
            </div>
            <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4 flex-shrink-0" />
              <span>
                Seller:{' '}
                <span className="font-medium text-foreground">{listing.sellerDisplayName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Posted {formatDate(listing.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span>
                Category:{' '}
                <span className="font-medium text-foreground capitalize">{listing.category}</span>
              </span>
            </div>
          </div>

          {/* Contact Seller */}
          <div className="mt-auto pt-2">
            {!isAuthenticated ? (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Log in to contact the seller
                </p>
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? 'Logging in…' : 'Login to Contact Seller'}
                </Button>
              </div>
            ) : !contactRevealed ? (
              <Button
                onClick={() => setContactRevealed(true)}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Seller
              </Button>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-accent p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Contact Info</span>
                </div>
                <p className="text-sm text-foreground">
                  Reach out to{' '}
                  <span className="font-semibold text-primary">{listing.sellerDisplayName}</span>{' '}
                  about this listing.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Message them directly on campus or through your student portal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
