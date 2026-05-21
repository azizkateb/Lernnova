import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'lernnova_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        let items = JSON.parse(savedCart);
        // Migrate old items without type field
        items = items.map(item => ({
          ...item,
          type: item.type || 'product',
          cartKey: item.cartKey || `${item.type || 'product'}-${item.id}`
        }));
        setCartItems(items);
      } catch (err) {
        console.error('Failed to parse cart from localStorage', err);
        setCartItems([]);
      }
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const getCartKey = (id, type) => `${type}-${id}`;

  const addToCart = (item, type = 'product') => {
    if (!item?.id) {
      console.error('Cannot add to cart: item missing id');
      return;
    }

    const cartKey = getCartKey(item.id, type);

    setCartItems((prev) => {
      const exists = prev.find((cartItem) => cartItem.cartKey === cartKey);
      if (exists) {
        return prev;
      }

      return [
        ...prev,
        {
          id: item.id,
          cartKey,
          type,
          title: item.title,
          slug: item.slug,
          short_description: item.short_description,
          price: item.price,
          thumbnail_url: item.thumbnail_url || item.thumbnail,
          category: item.category,
          seller: item.user || item.seller,
          raw: item,
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (id, type = 'product') => {
    const cartKey = getCartKey(id, type);
    return cartItems.some((item) => item.cartKey === cartKey);
  };

  const cartCount = cartItems.length;

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    getCartKey,
    cartCount,
    cartTotal,
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
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
