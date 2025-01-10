import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { ProductFilter } from '../components/ProductFilter';

interface FilterState {
  category: number | null;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const initialFilters: FilterState = {
    category: null,
    priceRange: {
      min: 0,
      max: 0,
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const isValidImageUrl = (url: string) => {
    try {
      return url && 
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.includes('undefined') &&
        !url.includes('null');
    } catch {
      return false;
    }
  };

  const getProductImageScore = (product: Product) => {
    if (!product.images || product.images.length === 0) return 0;
    const validImages = product.images.filter(isValidImageUrl);
    return validImages.length;
  };

  const sortProducts = (products: Product[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...products].sort((a, b) => {
      let comparison = 0;

      // Apply the selected sort first
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          const dateA = new Date(a.createdAt || '').getTime();
          const dateB = new Date(b.createdAt || '').getTime();
          comparison = dateA - dateB;
          break;
        default:
          const defaultDateA = new Date(a.createdAt || '').getTime();
          const defaultDateB = new Date(b.createdAt || '').getTime();
          comparison = defaultDateB - defaultDateA; // Default to newest first
      }

      // If primary sort criteria are equal, then sort by image validity
      if (comparison === 0) {
        const aScore = getProductImageScore(a);
        const bScore = getProductImageScore(b);
        return bScore - aScore; // Higher score first
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.escuelajs.co/api/v1/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = 'https://api.escuelajs.co/api/v1/products';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Initial sort by creation date (newest first)
        const sortedProducts = sortProducts(data, 'createdAt', 'desc');
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    const searchQuery = searchParams.get('search') || '';
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((product) => product.category.id === filters.category);
    }

    // Apply price filter
    if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
      filtered = filtered.filter((product) => {
        if (filters.priceRange.min > 0 && product.price < filters.priceRange.min) return false;
        if (filters.priceRange.max > 0 && product.price > filters.priceRange.max) return false;
        return true;
      });
    }

    // Apply final sorting
    const sortedFiltered = sortProducts(filtered, filters.sortBy, filters.sortOrder);
    setFilteredProducts(sortedFiltered);
  }, [products, searchParams, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update URL params
    if (newFilters.category) {
      searchParams.set('category', newFilters.category.toString());
    } else {
      searchParams.delete('category');
    }
    if (newFilters.priceRange.min) {
      searchParams.set('minPrice', newFilters.priceRange.min.toString());
    } else {
      searchParams.delete('minPrice');
    }
    if (newFilters.priceRange.max) {
      searchParams.set('maxPrice', newFilters.priceRange.max.toString());
    } else {
      searchParams.delete('maxPrice');
    }
    searchParams.set('sortBy', newFilters.sortBy);
    searchParams.set('sortOrder', newFilters.sortOrder);
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          {showFilters ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Hide Filters
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Show Filters
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar - only show when filters are enabled */}
        {showFilters && (
          <div className="md:w-1/4">
            <ProductFilter
              categories={categories}
              onFilterChange={handleFilterChange}
              initialFilters={initialFilters}
              isVisible={true}
            />
          </div>
        )}

        {/* Main content - adjust width based on filter visibility */}
        <div className={showFilters ? "md:w-3/4" : "w-full"}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <>
              {/* Search Results Info */}
              {(searchParams.get('search') || filters.category) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {searchParams.get('search') && `Search results for "${searchParams.get('search')}"`}
                    {filters.category && categories.find(c => c.id === filters.category) && 
                      ` in ${categories.find(c => c.id === filters.category)?.name}`
                    }
                    <span className="text-gray-500 ml-2">
                      ({filteredProducts.length} products found)
                    </span>
                  </h2>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link to={`/products/${product.id}`} className="block relative">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=random&size=200`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {product.category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Products Message */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
