import { PackageOpen, Search } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: 'box' | 'search';
}

export default function EmptyState({
  message = 'No listings found',
  description,
  icon = 'box',
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : PackageOpen;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
    </div>
  );
}
