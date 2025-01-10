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
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
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
        existingItem.quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));

      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);

      setQuantity(1);
    } catch (error) {
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Failed to add to cart';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
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
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                <Link to="/products" className="text-gray-500 hover:text-blue-600">Products</Link>
                <span className="mx-2 text-gray-500">/</span>
                <Link to={`/categories`} className="text-gray-500 hover:text-blue-600">
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </Link>
              </nav>

              <h1 className="text-4xl font-bold mb-6">{product.title}</h1>
              
              <div className="prose prose-lg mb-8 max-w-prose mx-auto lg:mx-0">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-8 w-full shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                <div className="text-center sm:text-left">
                  <span className="text-4xl font-bold text-blue-600">${product.price}</span>
                  {product.price > 50 && (
                    <span className="ml-3 inline-block bg-green-100 text-green-800 text-sm px-3 py-1.5 rounded-full font-medium">
                      Free Shipping
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-gray-700 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center border rounded-lg bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
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
                      className="w-16 text-center border-x py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                      disabled={quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              {quantity > 1 && (
                <div className="text-center sm:text-right text-gray-600 text-lg">
                  Total: <span className="font-semibold text-blue-600">${(product.price * quantity).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={addToCart}
                disabled={isAddingToCart}
                className={`flex-1 text-white px-8 py-4 rounded-lg transition-all duration-200 text-lg font-medium ${
                  isAddingToCart 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isAddingToCart 
                  ? 'Adding to Cart...' 
                  : `Add to Cart${quantity > 1 ? ` (${quantity})` : ''}`
                }
              </button>
              <Link
                to="/products"
                className="flex-1 text-center bg-gray-100 text-gray-800 px-8 py-4 rounded-lg hover:bg-gray-200 transition-all duration-200 text-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5"
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
