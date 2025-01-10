import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface CartItem {
  quantity: number;
}

export const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isLoggedIn = localStorage.getItem('token') !== null;
  const userName = localStorage.getItem('userName') || '';
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      const count = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const handleCartClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    navigate('/cart');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Shop Smart 🛒
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
          
          <div className="flex items-center space-x-4">
            {userRole === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                Admin
              </Link>
            )}
            
            <Link to="/categories" className="text-gray-600 hover:text-blue-600">
              Categories
            </Link>
            
            <div className="relative">
              <button
                onClick={handleCartClick}
                className="text-gray-600 hover:text-blue-600 p-2 relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {isLoggedIn && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              {showLoginPrompt && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 px-4 text-sm text-gray-700 z-50 border">
                  Please login to view cart
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Hi, {userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
