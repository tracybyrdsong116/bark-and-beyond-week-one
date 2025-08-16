import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/logobb.png" alt="Bark & Beyond Tech Logo" className="logo-icon" style={{ width: '40px', height: '40px' }} />
          <span>Bark & Beyond Tech</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/products" className={isActive('/products')}>Products</Link>
          <Link to="/about" className={isActive('/about')}>About</Link>
          
          <button 
            className="cart-button" 
            onClick={handleCartClick}
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart size={20} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="cart-count">{itemCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;