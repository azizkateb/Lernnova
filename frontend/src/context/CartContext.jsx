import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'lernnova_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const getServiceCoverImage = (service) => {
    const firstImage = Array.isArray(service?.images) ? service.images[0] : null;
    return (
      (typeof firstImage === 'string' ? firstImage : null) ||
      firstImage?.url ||
      firstImage?.image_url ||
      firstImage?.path ||
      null
    );
  };

  const getNormalizedThumbnail = (item, type) => {
    if (!item) return null;
    if (type === 'service') {
      return (
        getServiceCoverImage(item) ||
        item.thumbnail_url ||
        item.thumbnail ||
        item.image ||
        item.image_url ||
        item.cover ||
        null
      );
    }

    return (
      item.thumbnail_url ||
      item.thumbnail ||
      item.image_url ||
      item.image ||
      item.cover ||
      null
    );
  };

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        let items = JSON.parse(savedCart);
        // Migrate old items without type field
        items = items.map(item => {
          const type = item.type || 'product';
          const raw = item.raw || item;
          const thumbnail = item.thumbnail || item.thumbnail_url || getNormalizedThumbnail(raw, type);
          return {
            ...item,
            type,
            cartKey: item.cartKey || `${type}-${item.id}`,
            thumbnail,
            thumbnail_url: item.thumbnail_url || item.thumbnail || thumbnail,
            raw: item.raw || item,
          };
        });
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

  const getNumericPrice = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const getNumericQuantity = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, n);
  };

  const addToCart = (item, type = 'product') => {
    if (!item?.id) {
      console.error('Cannot add to cart: item missing id');
      return;
    }

    const cartKey = getCartKey(item.id, type);
    const thumbnail = getNormalizedThumbnail(item, type);

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
          price: getNumericPrice(item.price),
          quantity: getNumericQuantity(item.quantity),
          thumbnail,
          thumbnail_url: thumbnail,
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

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = getNumericPrice(item?.price ?? item?.raw?.price);
    const quantity = getNumericQuantity(item?.quantity);
    return sum + price * quantity;
  }, 0);

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
