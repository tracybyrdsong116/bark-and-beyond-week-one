import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        // Get first 3 products as featured
        setFeaturedProducts(response.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    if (result.success) {
      alert('Product added to cart!');
    } else {
      alert('Failed to add product to cart');
    }
  };

  return (
    <div className="home">
      {/* Hero Section with Video Background */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <video 
          autoPlay 
          muted 
          loop 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
        >
          <source src="https://videos.pexels.com/video-files/6130456/6130456-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 2
          }}
        ></div>
        <div className="hero-content" style={{ position: 'relative', zIndex: 3 }}>
          <h1>Welcome to Bark & Beyond Tech</h1>
          <p>
            Smart, safe, and eco-friendly products for your beloved pets. 
            Discover innovative solutions that enhance the lives of pets and their families.
          </p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontSize: '2.5rem', color: '#1f2937' }}>
            Featured Products
          </h2>
          
          {loading ? (
            <div className="text-center">
              <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
              <p>Loading amazing products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price}</p>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-features">
                      {product.features.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product.id)}
                        style={{ flex: 1 }}
                      >
                        Add to Cart
                      </button>
                      <Link 
                        to={`/products/${product.id}`}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#f3f4f6',
                          color: '#374151',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/products" className="cta-button">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '2rem' }}>
            Why Choose Bark & Beyond Tech?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
              <h3 style={{ color: '#4f46e5', marginBottom: '1rem' }}>Smart Technology</h3>
              <p style={{ color: '#6b7280' }}>
                Cutting-edge tech solutions that make pet care easier and more efficient.
              </p>
            </div>
            
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
              <h3 style={{ color: '#059669', marginBottom: '1rem' }}>Eco-Friendly</h3>
              <p style={{ color: '#6b7280' }}>
                Sustainable materials and practices that protect our planet for future generations.
              </p>
            </div>
            
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Safe & Reliable</h3>
              <p style={{ color: '#6b7280' }}>
                All products are tested for safety and designed with both pets and children in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #B6F500 0%, #98CD00 100%)', color: 'white' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to Enhance Your Pet's Life?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of happy pet owners who trust Bark & Beyond Tech.
          </p>
          <Link to="/products" className="cta-button">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;