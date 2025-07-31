import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // In a real app, this would integrate with a payment processor
    alert(`Thank you for your order! Total: $${total}\n\nThis is a demo - no actual payment was processed.`);
    clearCart();
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="text-center">
          <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingBag size={64} style={{ color: '#9ca3af', margin: '0 auto 2rem' }} />
          <h2 style={{ color: '#6b7280', marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products" className="cta-button">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Shopping Cart
        </h1>
        <p style={{ color: '#6b7280' }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Cart Items */}
        <div>
          {items.map(item => (
            <div key={item.productId} className="cart-item">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-item-image"
              />
              
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <p className="cart-item-price">${item.product.price}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {item.product.description.substring(0, 100)}...
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {/* Quantity Controls */}
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: '#f9fafb',
                    borderRadius: '0.25rem',
                    fontWeight: '600',
                    minWidth: '3rem',
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Item Total */}
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove from cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Clear Cart Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={clearCart}
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-total" style={{ minWidth: '300px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
            Order Summary
          </h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#6b7280'
            }}>
              <span>Subtotal ({itemCount} items):</span>
              <span>${total}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#6b7280'
            }}>
              <span>Shipping:</span>
              <span>{parseFloat(total) >= 50 ? 'FREE' : '$9.99'}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              color: '#6b7280'
            }}>
              <span>Tax:</span>
              <span>${(parseFloat(total) * 0.08).toFixed(2)}</span>
            </div>
            
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              <span>Total:</span>
              <span className="total-amount">
                ${
                  (
                    parseFloat(total) + 
                    (parseFloat(total) >= 50 ? 0 : 9.99) + 
                    (parseFloat(total) * 0.08)
                  ).toFixed(2)
                }
              </span>
            </div>
          </div>
          
          {parseFloat(total) < 50 && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Add ${(50 - parseFloat(total)).toFixed(2)} more for free shipping!
            </div>
          )}
          
          <button
            onClick={handleCheckout}
            className="checkout-btn"
            style={{ width: '100%' }}
          >
            Proceed to Checkout
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              to="/products"
              style={{
                color: '#4f46e5',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>🔒 Secure Checkout</div>
            <div style={{ marginBottom: '0.5rem' }}>📦 Free Returns</div>
            <div>⭐ 30-Day Guarantee</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;