import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trash2, Loader2, Eye, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AuthGuard from '../components/AuthGuard';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';
import { useGetMyListings, useDeleteListing } from '../hooks/useQueries';
import { toast } from 'sonner';

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MyListings() {
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useGetMyListings();
  const { mutateAsync: deleteListing } = useDeleteListing();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (listingId: string) => {
    setDeletingId(listingId);
    try {
      await deleteListing(listingId);
      toast.success('Listing deleted.');
    } catch {
      toast.error('Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthGuard requiredAuth={true} message="Please log in to view your listings.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-1">My Listings</h1>
            <p className="text-muted-foreground">Manage your active listings.</p>
          </div>
          <Button
            onClick={() => navigate({ to: '/post' })}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Listing</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border bg-card">
                <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            message="You have no listings yet"
            description="Post your first listing to start selling to fellow students."
            icon="box"
          />
        ) : (
          <div className="space-y-4">
            {listings
              .slice()
              .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
              .map((listing) => {
                const imageUrl =
                  listing.imageId || '/assets/generated/listing-placeholder.dim_400x300.png';

                return (
                  <article
                    key={listing.id}
                    className="flex gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-card transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                      onClick={() =>
                        navigate({
                          to: '/listing/$listingId',
                          params: { listingId: listing.id },
                        })
                      }
                    >
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/assets/generated/listing-placeholder.dim_400x300.png';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold text-foreground text-sm leading-snug line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            navigate({
                              to: '/listing/$listingId',
                              params: { listingId: listing.id },
                            })
                          }
                        >
                          {listing.title}
                        </h3>
                        <span className="font-bold text-primary text-sm flex-shrink-0">
                          {formatPrice(listing.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <CategoryBadge category={listing.category} />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(listing.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate({
                            to: '/listing/$listingId',
                            params: { listingId: listing.id },
                          })
                        }
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === listing.id}
                            title="Delete listing"
                          >
                            {deletingId === listing.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{listing.title}"? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
