import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`/api/products?${params}`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="section text-center">
          <h1 style={{ fontSize: '3rem', color: '#1f2937', marginBottom: '1rem' }}>
            Our Products
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Discover our complete collection of smart, safe, and eco-friendly pet products.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '1rem', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: showFilters ? '#4f46e5' : '#f3f4f6',
                color: showFilters ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <Filter size={20} />
              Filters
            </button>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Categories:</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleCategoryChange('')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: selectedCategory === '' ? '#4f46e5' : '#f3f4f6',
                    color: selectedCategory === '' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: selectedCategory === category.id ? '#4f46e5' : '#f3f4f6',
                      color: selectedCategory === category.id ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory) && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Active filters:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {searchTerm && (
                <span style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem'
                }}>
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory && (
                <span style={{
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem'
                }}>
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center">
            <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem 2rem' }}>
            <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>No products found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem', color: '#6b7280' }}>
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </div>
            
            <div className="products-grid">
              {products.map(product => (
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
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;