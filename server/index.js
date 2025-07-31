const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample product data - in a real app, this would come from a database
const products = [
  {
    id: 1,
    name: "Smart Pet Feeder with Camera & App Control",
    price: 149.99,
    category: "smart-tech",
    description: "Automatically dispenses food, monitors eating habits, and allows remote interaction through our mobile app.",
    image: "https://placehold.co/400x300/ADD8E6/000000?text=Smart+Feeder",
    inStock: true,
    features: ["App Control", "HD Camera", "Portion Control", "Scheduling"]
  },
  {
    id: 2,
    name: "GPS Pet Tracker with Geofencing",
    price: 89.99,
    category: "smart-tech",
    description: "Real-time location tracking, escape alerts, and activity monitoring to keep your pet safe.",
    image: "https://placehold.co/400x300/90EE90/000000?text=GPS+Tracker",
    inStock: true,
    features: ["Real-time GPS", "Geofencing", "Activity Monitor", "Long Battery"]
  },
  {
    id: 3,
    name: "Eco-Friendly Biodegradable Poop Bags",
    price: 24.99,
    category: "eco-friendly",
    description: "Sustainable and convenient solution for pet waste. Made from plant-based materials.",
    image: "https://placehold.co/400x300/B0E0E6/000000?text=Eco+Poop+Bags",
    inStock: true,
    features: ["Biodegradable", "Leak-proof", "Easy Tear", "Dispenser Included"]
  },
  {
    id: 4,
    name: "Interactive Laser/Treat Dispensing Toy",
    price: 79.99,
    category: "smart-tech",
    description: "Keep pets entertained and mentally stimulated with unpredictable movements and treat rewards.",
    image: "https://placehold.co/400x300/FFD700/000000?text=Interactive+Toy",
    inStock: true,
    features: ["Auto Play Mode", "Treat Dispenser", "Safe Laser", "Timer Function"]
  },
  {
    id: 5,
    name: "Personalized Glow-in-the-Dark LED Leash",
    price: 39.99,
    category: "safety",
    description: "Custom LED leash with your pet's name. Perfect for evening walks and safety.",
    image: "https://placehold.co/400x300/ADD8E6/000000?text=Glow+Leash",
    inStock: true,
    features: ["LED Lights", "Custom Name", "Rechargeable", "Weather Resistant"]
  },
  {
    id: 6,
    name: "Bamboo Eco-Friendly Dog Bowl Set",
    price: 34.99,
    category: "eco-friendly",
    description: "Sustainable bamboo bowls that are safe for pets and the environment.",
    image: "https://placehold.co/400x300/DEB887/000000?text=Bamboo+Bowls",
    inStock: true,
    features: ["Bamboo Material", "Non-slip Base", "Easy Clean", "Set of 2"]
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Bark & Beyond Tech API!',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all products
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    success: true,
    count: filteredProducts.length,
    data: filteredProducts
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({
    success: true,
    data: categories.map(cat => ({
      id: cat,
      name: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count: products.filter(p => p.category === cat).length
    }))
  });
});

// Simple cart simulation (in real app, you'd use sessions/database)
let cart = [];

// Add to cart
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const existingItem = cart.find(item => item.productId === parseInt(productId));
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId: parseInt(productId),
      product: product,
      quantity: quantity
    });
  }

  res.json({
    success: true,
    message: 'Product added to cart',
    cart: cart
  });
});

// Get cart
app.get('/api/cart', (req, res) => {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  res.json({
    success: true,
    data: {
      items: cart,
      total: total.toFixed(2),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  cart = [];
  res.json({
    success: true,
    message: 'Cart cleared'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Bark & Beyond Tech API running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🛍️  Products API: http://localhost:${PORT}/api/products`);
});