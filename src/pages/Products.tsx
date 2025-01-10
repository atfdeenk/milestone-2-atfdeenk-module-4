import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product } from '../types';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'https://api.escuelajs.co/api/v1/products';
        if (searchQuery) {
          url = `https://api.escuelajs.co/api/v1/products/?title=${encodeURIComponent(searchQuery)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  const addToCart = (product: Product) => {
    const isLoggedIn = localStorage.getItem('token') !== null;
    if (!isLoggedIn) {
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Please login to add items to cart';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: Product & { quantity: number }) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    message.textContent = 'Added to cart successfully';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
          {searchQuery && (
            <p className="text-gray-600 mb-4">
              No products match your search "{searchQuery}"
            </p>
          )}
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Search Results for "{searchQuery}"
          </h2>
          <div className="flex items-center">
            <p className="text-gray-600">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
            <Link
              to="/products"
              className="ml-4 text-blue-600 hover:text-blue-700"
            >
              Clear Search
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <Link to={`/products/${product.id}`}>
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=random&size=200`;
                }}
              />
            </Link>
            <div className="p-4">
              <Link
                to={`/products/${product.id}`}
                className="text-lg font-semibold hover:text-blue-600 transition-colors duration-200"
              >
                {product.title}
              </Link>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">
                  ${product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
