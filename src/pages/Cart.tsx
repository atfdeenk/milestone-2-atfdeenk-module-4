import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

export const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const isLoggedIn = localStorage.getItem('token') !== null;

  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: number) => {
    setLoading(true);
    const newCart = cart.filter(item => item.id !== id);
    updateCart(newCart);
    
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
    message.textContent = 'Item removed from cart';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
    setLoading(false);
  };

  const clearCart = () => {
    setLoading(true);
    updateCart([]);
    setShowClearConfirm(false);
    
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
    message.textContent = 'Cart cleared successfully';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
    setLoading(false);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      message.textContent = 'Please login to checkout';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
      return;
    }

    setShowCheckoutConfirm(true);
  };

  const processCheckout = () => {
    setLoading(true);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderDate = new Date().toLocaleString();

    const receiptData = {
      items: cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      orderDate,
      orderNumber
    };

    // Clear the cart
    updateCart([]);
    setShowCheckoutConfirm(false);
    setLoading(false);

    // Navigate to receipt page
    navigate('/receipt', { state: { receiptData } });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return;
    
    setLoading(true);
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={loading}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          Clear Cart
        </button>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={clearCart}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Purchase</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to proceed with the purchase? This will clear your cart and generate a receipt.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={processCheckout}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-grow">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <div className="text-blue-600 font-medium">${item.price.toFixed(2)} each</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-16 text-center border rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={loading || item.quantity >= 99}
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                +
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center text-xl font-semibold mb-6">
          <span>Total:</span>
          <span>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/products"
            className="flex-1 px-6 py-3 text-center bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};
