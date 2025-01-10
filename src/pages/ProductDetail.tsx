import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [success, setSuccess] = useState('');
  const isLoggedIn = localStorage.getItem('token') !== null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        setError('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
        setError(errorMessage);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!isLoggedIn) {
      setError('Please login to add items to cart');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsAddingToCart(true);
    
    try {
      if (!product) return;
      
      // Update main cart
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = existingCart.find((item: Product & { quantity: number }) => item.id === product.id);
      
      let newCart;
      if (existingItem) {
        newCart = existingCart.map((item: Product & { quantity: number }) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...existingCart, { ...product, quantity }];
      }
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      // Also update user-specific cart if logged in
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const userCartKey = `cart_${userEmail}`;
        localStorage.setItem(userCartKey, JSON.stringify(newCart));
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
      setSuccess('Product added to cart!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product to cart';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Image Gallery */}
          <div className="lg:w-1/2 sticky top-4">
            <div className="aspect-square mb-6">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImage === index ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left space-y-8">
            <div className="w-full">
              <nav className="flex mb-6 text-sm justify-center lg:justify-start">
                <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                <Link to={`/categories`} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </Link>
              </nav>

              <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{product.title}</h1>
              
              <div className="prose prose-lg mb-8 max-w-prose mx-auto lg:mx-0">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8 w-full shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                <div className="text-center sm:text-left">
                  <span className="text-4xl font-bold text-blue-500 dark:text-blue-400">${product.price}</span>
                  {product.price > 50 && (
                    <span className="ml-3 inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm px-3 py-1.5 rounded-full font-medium">
                      Free Shipping
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-gray-700 dark:text-gray-300 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center rounded-lg bg-white dark:bg-gray-700">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-x py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 group">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Add to Cart
                  </Link>
                ) : (
                  <button
                    onClick={addToCart}
                    disabled={loading || isAddingToCart}
                    className="flex-1 px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link
                to="/products"
                className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-8 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
