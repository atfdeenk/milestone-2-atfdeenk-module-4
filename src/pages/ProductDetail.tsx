import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const isLoggedIn = localStorage.getItem('token') !== null;
  const navigate = useNavigate();

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

  const processCheckout = () => {
    setIsBuyingNow(true);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderDate = new Date().toLocaleString();

    const receiptData = {
      items: [{ ...product, quantity }],
      totalPrice: product!.price * quantity,
      orderDate,
      orderNumber
    };

    setShowCheckoutConfirm(false);
    setIsBuyingNow(false);

    // Navigate to receipt page without affecting cart
    navigate('/receipt', { state: { receiptData } });
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      setError('Please login to purchase items');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!product) return;
    setShowCheckoutConfirm(true);
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
        {/* Back button - only visible on mobile */}
        <button
          onClick={() => navigate('/products')}
          className="md:hidden mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Products
        </button>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-4">
            <div className="aspect-square mb-4 lg:mb-6">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 lg:gap-3">
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
          <div className="w-full lg:w-1/2 flex flex-col space-y-6">
            <div className="w-full">
              <nav className="flex mb-4 lg:mb-6 text-sm">
                <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                <Link to={`/categories`} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </Link>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-gray-900 dark:text-white">{product.title}</h1>
              
              <div className="prose prose-lg mb-6 lg:mb-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 w-full shadow-sm">
              <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6 mb-6">
                <div>
                  <span className="text-3xl lg:text-4xl font-bold text-blue-500 dark:text-blue-400">${product.price}</span>
                  {product.price > 50 && (
                    <span className="block lg:inline-block mt-2 lg:mt-0 lg:ml-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm px-3 py-1.5 rounded-full font-medium">
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

              <div className="flex flex-col gap-4">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 group text-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Purchase
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      disabled={loading || isBuyingNow || isAddingToCart}
                      className="w-full px-6 py-4 bg-green-500 dark:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-green-600 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                    >
                      {isBuyingNow ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Buy Now
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={addToCart}
                      disabled={loading || isAddingToCart || isBuyingNow}
                      className="w-full px-6 py-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex w-full">
              <Link
                to="/products"
                className="w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Confirm Purchase</h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-300">You are about to purchase:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-800 dark:text-gray-200">
                  <span className="break-words flex-1 mr-4">{product?.title} × {quantity}</span>
                  <span className="font-medium whitespace-nowrap">${(product!.price * quantity).toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-600 pt-2 mt-2 flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-blue-500 dark:text-blue-400">${(product!.price * quantity).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                By confirming, you agree to proceed with the purchase of this item.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={processCheckout}
                disabled={isBuyingNow}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {isBuyingNow ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Confirm Purchase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
