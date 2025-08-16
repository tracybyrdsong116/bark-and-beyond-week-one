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
    name: "Smart Pet Feeder Pro",
    price: 149.99,
    category: "smart-tech",
    description: "AI-powered feeding schedule with camera monitoring, portion control, and health tracking. App-controlled with voice commands and treat dispensing.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    inStock: true,
    features: ["AI Scheduling", "HD Camera", "Voice Control", "Health Tracking", "Treat Dispenser"]
  },
  {
    id: 2,
    name: "GPS Pet Tracker",
    price: 89.99,
    category: "smart-tech",
    description: "Real-time location tracking with geofencing alerts, escape notifications, and activity monitoring. Waterproof with 7-day battery life.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    inStock: true,
    features: ["Real-time GPS", "Geofencing", "Activity Monitor", "7-Day Battery", "Waterproof"]
  },
  {
    id: 3,
    name: "Eco-Friendly Chew Toys",
    price: 24.99,
    category: "eco-friendly",
    description: "100% biodegradable chew toys made from natural hemp and organic cotton. Non-toxic, sustainable, and designed for aggressive chewers.",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
    inStock: true,
    features: ["100% Biodegradable", "Natural Hemp", "Organic Cotton", "Non-toxic", "Durable"]
  },
  {
    id: 4,
    name: "Glow-in-Dark Safety Leash",
    price: 39.99,
    category: "safety",
    description: "High-visibility LED leash with reflective strips and rechargeable battery. Perfect for evening walks with multiple light modes and weather resistance.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    inStock: true,
    features: ["LED Lights", "Reflective Strips", "Rechargeable", "Multiple Modes", "Weather Resistant"]
  },
  {
    id: 5,
    name: "Smart Pet House",
    price: 299.99,
    category: "smart-tech",
    description: "Climate-controlled pet house with automated temperature regulation, weather monitoring, and app connectivity. Eco-friendly materials with solar panel option.",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
    inStock: true,
    features: ["Climate Control", "Weather Monitor", "App Connected", "Solar Panel", "Eco Materials"]
  },
  {
    id: 6,
    name: "Health Monitor Collar",
    price: 129.99,
    category: "health",
    description: "Advanced health tracking with heart rate monitoring, activity levels, sleep pattern analysis, and vet alert system. Waterproof with 14-day battery life.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    inStock: true,
    features: ["Heart Rate Monitor", "Activity Tracking", "Sleep Analysis", "Vet Alerts", "14-Day Battery"]
  },
  {
    id: 7,
    name: "Smart Water Fountain",
    price: 79.99,
    category: "smart-tech",
    description: "Self-cleaning water fountain with filtration system and hydration tracking. Encourages healthy drinking habits with fresh, flowing water.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    inStock: true,
    features: ["Self-Cleaning", "Filtration System", "Hydration Tracking", "Fresh Water", "Quiet Operation"]
  },
  {
    id: 8,
    name: "Interactive Treat Dispenser",
    price: 59.99,
    category: "smart-tech",
    description: "App-controlled puzzle feeder that dispenses treats based on activity levels. Keeps pets mentally stimulated and prevents overeating.",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
    inStock: true,
    features: ["App Controlled", "Puzzle Feeder", "Activity Based", "Mental Stimulation", "Portion Control"]
  },
  {
    id: 9,
    name: "Personalized Pet Tags",
    price: 19.99,
    category: "safety",
    description: "Custom engraved tags with QR codes linking to digital pet profiles. Eco-friendly materials with emergency contact integration.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    inStock: true,
    features: ["Custom Engraving", "QR Code", "Digital Profile", "Emergency Contacts", "Eco-Friendly"]
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