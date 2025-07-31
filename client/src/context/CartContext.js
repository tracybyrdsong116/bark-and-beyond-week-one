import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || '0.00',
        itemCount: action.payload.itemCount || 0
      };
    
    case 'ADD_TO_CART':
      return {
        ...state,
        items: action.payload.cart || state.items
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item => 
        item.productId === action.payload.productId 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const newTotal = updatedItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      
      const newItemCount = updatedItems.reduce((sum, item) => 
        sum + item.quantity, 0
      );
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal.toFixed(2),
        itemCount: newItemCount
      };
    
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => 
        item.productId !== action.payload.productId
      );
      
      const filteredTotal = filteredItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      
      const filteredItemCount = filteredItems.reduce((sum, item) => 
        sum + item.quantity, 0
      );
      
      return {
        ...state,
        items: filteredItems,
        total: filteredTotal.toFixed(2),
        itemCount: filteredItemCount
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: '0.00',
        itemCount: 0
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

const initialState = {
  items: [],
  total: '0.00',
  itemCount: 0,
  loading: false
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/cart');
      if (response.data.success) {
        dispatch({ type: 'SET_CART', payload: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity
      });
      
      if (response.data.success) {
        // Refresh cart data
        await fetchCart();
        return { success: true, message: 'Product added to cart!' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add product to cart' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { productId, quantity } 
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: { productId } 
    });
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};