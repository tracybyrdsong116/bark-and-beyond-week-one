import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        // Product not found
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const result = await addToCart(product.id, quantity);
      if (result.success) {
        alert(`${quantity} ${product.name}(s) added to cart!`);
      } else {
        alert('Failed to add product to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="cta-button">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#4f46e5',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '2rem',
            padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Product Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Product Image */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              {product.name}
            </h1>

            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '1.5rem'
            }}>
              ${product.price}
            </div>

            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {product.description}
            </p>

            {/* Features */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem'
              }}>
                Key Features:
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {product.features.map((feature, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#e0e7ff',
                      color: '#4f46e5',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Quantity:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: '#f9fafb',
                    borderRadius: '0.25rem',
                    fontWeight: '600',
                    minWidth: '3rem',
                    textAlign: 'center'
                  }}>
                    {quantity}
                  </span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  (Max: 10 per order)
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || addingToCart}
              style={{
                width: '100%',
                background: product.inStock ? '#4f46e5' : '#9ca3af',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: product.inStock ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                transition: 'background-color 0.3s ease'
              }}
            >
              {addingToCart ? (
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <ShoppingCart size={20} />
              )}
              {addingToCart ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Trust Indicators */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginTop: '2rem',
              padding: '1.5rem',
              background: '#f8fafc',
              borderRadius: '0.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Shield size={24} style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Safe & Tested</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pet & child safe</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Truck size={24} style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Free Shipping</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>On orders $50+</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Star size={24} style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Quality Guarantee</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>30-day returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Why Choose This Product?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <h3 style={{ color: '#4f46e5', marginBottom: '0.5rem' }}>Smart Technology</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Our products incorporate the latest technology to make pet care easier and more efficient.
              </p>
            </div>
            
            <div>
              <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>Eco-Friendly</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Made with sustainable materials and environmentally conscious manufacturing processes.
              </p>
            </div>
            
            <div>
              <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Safety First</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                All products are rigorously tested to ensure they're safe for both pets and children.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;