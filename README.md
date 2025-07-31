# Bark & Beyond Tech - E-commerce MVP

🐕 **Smart, safe, and eco-friendly products for your beloved pets**

A full-stack e-commerce platform built with React frontend and Node.js backend, featuring a modern shopping experience for pet products.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Product Catalog**: Browse and search through smart pet products
- **Shopping Cart**: Add, remove, and manage items with real-time updates
- **Product Details**: Detailed product pages with features and specifications
- **Category Filtering**: Filter products by smart-tech, eco-friendly, and safety categories
- **Mobile Responsive**: Optimized for all device sizes

### Backend (Node.js/Express)
- **RESTful API**: Clean API endpoints for products, categories, and cart management
- **Product Management**: Comprehensive product data with categories and features
- **Cart Functionality**: Add to cart, update quantities, and checkout simulation
- **Search & Filter**: Server-side search and category filtering
- **CORS Enabled**: Ready for frontend-backend communication

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- Lucide React for icons
- CSS3 with modern styling

**Backend:**
- Node.js
- Express.js
- CORS middleware
- Helmet for security
- Morgan for logging

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd bark-and-beyond-week-one
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Manual Setup

If you prefer to set up each part separately:

**Backend Setup:**
```bash
cd server
npm install
npm run dev
```

**Frontend Setup:**
```bash
cd client
npm install
npm start
```

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products (supports ?category and ?search query params)
- `GET /api/products/:id` - Get single product by ID
- `GET /api/categories` - Get all product categories

### Cart
- `GET /api/cart` - Get current cart contents
- `POST /api/cart/add` - Add product to cart
- `DELETE /api/cart` - Clear cart

### Health
- `GET /health` - Health check endpoint

## 🎨 Design Features

- **Color Scheme**: Modern blue and green palette reflecting tech and eco-friendly themes
- **Typography**: Inter font family for clean, readable text
- **Icons**: Lucide React icons for consistent, modern iconography
- **Animations**: Smooth hover effects and loading states
- **Responsive Grid**: CSS Grid and Flexbox for perfect layouts on all devices

## 🚀 Deployment Options

### Option 1: Netlify (Frontend) + Heroku (Backend)

**Frontend (Netlify):**
1. Build the frontend: `cd client && npm run build`
2. Deploy the `client/build` folder to Netlify
3. Update API URLs to point to your Heroku backend

**Backend (Heroku):**
1. Create a Heroku app
2. Deploy the `server` folder
3. Set environment variables if needed

### Option 2: Vercel (Full-Stack)

1. Deploy to Vercel with both frontend and API routes
2. Configure build settings for the React app
3. Set up API routes in the `api` directory

### Option 3: Railway/Render

1. Deploy both frontend and backend to Railway or Render
2. Configure environment variables
3. Set up custom domains if needed

## 📱 Mobile Experience

The app is fully responsive and provides an excellent mobile shopping experience:
- Touch-friendly buttons and navigation
- Optimized product grid for mobile screens
- Mobile-first cart and checkout flow
- Fast loading with optimized images

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Safe API endpoints

## 🎯 Business Features

- **Product Categories**: Smart Tech, Eco-Friendly, Safety products
- **Featured Products**: Highlighted items on homepage
- **Search Functionality**: Find products quickly
- **Cart Management**: Full shopping cart experience
- **Responsive Design**: Works on all devices
- **Trust Indicators**: Security badges and guarantees

## 🔄 Future Enhancements

- User authentication and accounts
- Real payment processing integration
- Product reviews and ratings
- Inventory management
- Order history and tracking
- Email notifications
- Admin dashboard
- Database integration (MongoDB/PostgreSQL)

## 🤝 Contributing

This is Tracy's learning project at Pursuit tech school. Feel free to suggest improvements or report issues!

## 📞 Contact

**Tracy** - Pursuit Student  
Email: tracy@barkandbeyondtech.com  
Location: Queens, NY

---

**Mission Statement**: "To empower dog owners with innovative, eco-friendly products that enhance the lives of pets and their families—always safe, always smart, always beyond expectations."

🐾 Made with ❤️ for pets and their families