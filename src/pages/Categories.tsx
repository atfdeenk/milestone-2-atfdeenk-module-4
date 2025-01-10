import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Category {
  id: number;
  name: string;
  image: string;
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getCategories();
      
      // Filter out categories with invalid images
      const validCategories = data.filter((category: Category) => {
        const hasValidImage = category.image && 
          (category.image.startsWith('http://') || category.image.startsWith('https://'));
        return hasValidImage;
      });

      // Sort categories alphabetically
      const sortedCategories = validCategories.sort((a: Category, b: Category) => 
        a.name.localeCompare(b.name)
      );

      setCategories(sortedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, timeout);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold mt-4">Error</h2>
            <p className="mt-2">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">No Categories Found</h2>
          <p className="mt-2 text-gray-600">Please try again later.</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={handleRetry}
          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&size=200`;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors duration-200">
                  {category.name}
                </h3>
                <div className="mt-2 text-sm text-gray-600 group-hover:text-blue-500 transition-colors duration-200">
                  View Products →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
