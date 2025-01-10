import { useState } from 'react';
import { Category } from '../types';

interface FilterState {
  category: number | null;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ProductFilterProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
  isVisible: boolean;
}

export const ProductFilter = ({ categories, onFilterChange, initialFilters, isVisible }: ProductFilterProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Categories</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange({ category: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 p-2 border rounded-md"
            value={filters.priceRange.min || ''}
            onChange={(e) => handleFilterChange({
              priceRange: { ...filters.priceRange, min: Number(e.target.value) }
            })}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 p-2 border rounded-md"
            value={filters.priceRange.max || ''}
            onChange={(e) => handleFilterChange({
              priceRange: { ...filters.priceRange, max: Number(e.target.value) }
            })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Sort By</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
        >
          <option value="createdAt">Date Added</option>
          <option value="price">Price</option>
          <option value="title">Name</option>
        </select>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <button
        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
        onClick={() => {
          const defaultFilters = {
            category: null,
            priceRange: { min: 0, max: 0 },
            sortBy: 'createdAt',
            sortOrder: 'desc' as const
          };
          setFilters(defaultFilters);
          onFilterChange(defaultFilters);
        }}
      >
        Clear Filters
      </button>
    </div>
  );
};
