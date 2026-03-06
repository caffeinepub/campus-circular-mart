import { Category } from '../backend';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

const categoryConfig: Record<Category, { label: string; className: string }> = {
  [Category.textbooks]: {
    label: 'Textbooks',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [Category.electronics]: {
    label: 'Electronics',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  [Category.clothing]: {
    label: 'Clothing',
    className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  [Category.furniture]: {
    label: 'Furniture',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  [Category.stationery]: {
    label: 'Stationery',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  [Category.other]: {
    label: 'Other',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
};

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig[Category.other];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
