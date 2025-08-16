import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add welcome message when opening chat for the first time
      addBotMessage(
        "Hi there! 👋 I'm your Bark & Beyond Tech assistant. How can I help you today? I can help you find products, answer questions about our store, or assist with your shopping cart."
      );
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const addUserMessage = (text) => {
    setMessages([...messages, { text, sender: 'user' }]);
  };

  const addBotMessage = (text) => {
    setMessages([...messages, { text, sender: 'bot' }]);
  };

  const simulateTyping = async () => {
    setIsTyping(true);
    // Simulate typing delay between 1-2 seconds
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    addUserMessage(userMessage);
    setInput('');
    
    await simulateTyping();
    
    // Process user message and generate response
    processUserMessage(userMessage);
  };

  const processUserMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (containsAny(lowerMessage, ['hi', 'hello', 'hey', 'greetings'])) {
      addBotMessage("Hello! How can I help you today?");
      return;
    }
    
    // Check for product search
    if (containsAny(lowerMessage, ['product', 'find', 'search', 'looking for'])) {
      if (containsAny(lowerMessage, ['smart', 'tech', 'technology', 'electronic'])) {
        addBotMessage(
          "We have several smart tech products for pets! Here are some options:\n\n" +
          "• Smart Pet Feeder Pro\n" +
          "• GPS Pet Tracker\n" +
          "• Smart Pet House\n" +
          "• Smart Water Fountain\n\n" +
          "Would you like to see details for any of these products?"
        );
        return;
      }
      
      if (containsAny(lowerMessage, ['eco', 'friendly', 'sustainable', 'green'])) {
        addBotMessage(
          "We have eco-friendly products that are sustainable and safe for the environment! Here are some options:\n\n" +
          "• Eco-Friendly Chew Toys\n\n" +
          "Would you like to see more eco-friendly products?"
        );
        return;
      }
      
      if (containsAny(lowerMessage, ['safety', 'safe', 'protect'])) {
        addBotMessage(
          "Safety is our priority! Here are some safety products for your pets:\n\n" +
          "• Glow-in-Dark Safety Leash\n" +
          "• Personalized Pet Tags\n\n" +
          "Would you like to see more safety products?"
        );
        return;
      }
      
      // General product search
      addBotMessage(
        "I'd be happy to help you find products! We have several categories:\n\n" +
        "• Smart Tech Products\n" +
        "• Eco-Friendly Accessories\n" +
        "• Safety Products\n\n" +
        "Which category interests you, or would you like to browse all products?"
      );
      return;
    }
    
    // Check for specific product inquiries
    if (containsAny(lowerMessage, ['feeder', 'feeding'])) {
      addBotMessage(
        "Our Smart Pet Feeder Pro is an AI-powered feeding solution with camera monitoring, portion control, and health tracking. It's app-controlled with voice commands and treat dispensing. Would you like to see this product?"
      );
      return;
    }
    
    if (containsAny(lowerMessage, ['gps', 'tracker', 'tracking'])) {
      addBotMessage(
        "Our GPS Pet Tracker provides real-time location tracking with geofencing alerts, escape notifications, and activity monitoring. It's waterproof with a 7-day battery life. Would you like to see this product?"
      );
      return;
    }
    
    // Check for navigation requests
    if (containsAny(lowerMessage, ['show all products', 'all products', 'browse products', 'see products'])) {
      addBotMessage("I'll take you to our products page where you can browse all our offerings!");
      setTimeout(() => navigate('/products'), 1000);
      return;
    }
    
    if (containsAny(lowerMessage, ['about', 'company', 'who are you'])) {
      addBotMessage("I'll take you to our About page where you can learn more about Bark & Beyond Tech!");
      setTimeout(() => navigate('/about'), 1000);
      return;
    }
    
    if (containsAny(lowerMessage, ['cart', 'shopping cart', 'checkout', 'purchase'])) {
      addBotMessage("I'll take you to your shopping cart!");
      setTimeout(() => navigate('/cart'), 1000);
      return;
    }
    
    if (containsAny(lowerMessage, ['home', 'main page', 'landing page'])) {
      addBotMessage("I'll take you to our home page!");
      setTimeout(() => navigate('/'), 1000);
      return;
    }
    
    // Check for add to cart requests
    if (containsAny(lowerMessage, ['add to cart', 'buy', 'purchase'])) {
      if (containsAny(lowerMessage, ['feeder', 'smart pet feeder'])) {
        handleAddToCart(1, "Smart Pet Feeder Pro");
        return;
      }
      if (containsAny(lowerMessage, ['gps', 'tracker'])) {
        handleAddToCart(2, "GPS Pet Tracker");
        return;
      }
      if (containsAny(lowerMessage, ['chew', 'toys', 'eco-friendly toys'])) {
        handleAddToCart(3, "Eco-Friendly Chew Toys");
        return;
      }
      if (containsAny(lowerMessage, ['leash', 'safety leash', 'glow'])) {
        handleAddToCart(4, "Glow-in-Dark Safety Leash");
        return;
      }
      
      // Generic add to cart response
      addBotMessage(
        "I'd be happy to help you add items to your cart! Could you specify which product you're interested in?"
      );
      return;
    }
    
    // Check for help requests
    if (containsAny(lowerMessage, ['help', 'assist', 'support', 'how do i', 'how to'])) {
      addBotMessage(
        "I'm here to help! Here are some things I can assist you with:\n\n" +
        "• Finding products by category or feature\n" +
        "• Navigating to different pages on our site\n" +
        "• Adding items to your cart\n" +
        "• Answering questions about our products\n" +
        "• Providing information about our company\n\n" +
        "What would you like help with today?"
      );
      return;
    }
    
    // Check for thank you messages
    if (containsAny(lowerMessage, ['thank', 'thanks', 'appreciate'])) {
      addBotMessage("You're welcome! Is there anything else I can help you with?");
      return;
    }
    
    // Default response for unrecognized messages
    addBotMessage(
      "I'm not sure I understand. Would you like to:\n\n" +
      "• Browse our products\n" +
      "• Learn about our company\n" +
      "• Get help with your shopping cart\n" +
      "• Ask about a specific product?"
    );
  };
  
  const handleAddToCart = async (productId, productName) => {
    addBotMessage(`Adding ${productName} to your cart...`);
    
    try {
      const result = await addToCart(productId);
      if (result.success) {
        addBotMessage(`${productName} has been added to your cart! Would you like to view your cart or continue shopping?`);
      } else {
        addBotMessage(`I'm sorry, there was an issue adding ${productName} to your cart. Please try again later.`);
      }
    } catch (error) {
      addBotMessage("I'm sorry, there was an error adding the product to your cart. Please try again later.");
    }
  };
  
  // Helper function to check if a string contains any of the words in an array
  const containsAny = (str, words) => {
    return words.some(word => str.includes(word));
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button 
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <>
          <MessageSquare size={24} />
          <span>Chat</span>
        </>}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <img src="/logobb.png" alt="" className="chat-logo" />
              <span>Bark & Beyond Assistant</span>
            </div>
            <button 
              className="chat-minimize-btn"
              onClick={toggleChat}
              aria-label="Minimize chat"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {message.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ))}
            {isTyping && (
              <div className="message bot-message typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              aria-label="Type your message"
            />
            <button 
              type="submit" 
              className="send-btn"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;