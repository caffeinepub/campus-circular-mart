import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllListings } from '../hooks/useQueries';
import { Category } from '../backend';
import ListingCard from '../components/ListingCard';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';

const ALL_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: Category.textbooks, label: 'Textbooks' },
  { value: Category.electronics, label: 'Electronics' },
  { value: Category.clothing, label: 'Clothing' },
  { value: Category.furniture, label: 'Furniture' },
  { value: Category.stationery, label: 'Stationery' },
  { value: Category.other, label: 'Other' },
];

export default function BrowseListings() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: listings = [], isLoading } = useGetAllListings();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let result = [...listings];

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [listings, search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
          Campus Marketplace
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Buy and sell second-hand items with fellow students. Textbooks, electronics, furniture, and more.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-border"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' || search ? ' found' : ' available'}
          </span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={search || selectedCategory !== 'all' ? 'No listings match your search' : 'No listings yet'}
          description={
            search || selectedCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Be the first to post a listing!'
          }
          icon={search ? 'search' : 'box'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-fade-in">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => navigate({ to: '/listing/$listingId', params: { listingId: listing.id } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
