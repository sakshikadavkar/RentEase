import { useState } from 'react';
import { RentalContext } from './RentalContext';

export function RentalProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_favorites');
      return saved ? JSON.parse(saved) : ['luxe-cloud-sofa', 'aurora-ergonomic-mesh-chair'];
    } catch {
      return ['luxe-cloud-sofa', 'aurora-ergonomic-mesh-chair'];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_user');
      return saved ? JSON.parse(saved) : { name: 'Alex Morgan', email: 'alex.morgan@example.com', city: 'Bengaluru' };
    } catch {
      return { name: 'Alex Morgan', email: 'alex.morgan@example.com', city: 'Bengaluru' };
    }
  });

  const [rentals, setRentals] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_rentals');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'RNT-89421',
              productName: 'Luxe Cloud Sofa (3-Seater)',
              category: 'Living Room',
              tenureMonths: 12,
              monthlyRent: 1499,
              deposit: 4499,
              startDate: '2026-08-15',
              nextBillingDate: '2026-09-15',
              status: 'Active',
              deliveryAddress: 'Flat 402, Skyline Heights, Indiranagar, Bengaluru - 560038',
            },
          ];
    } catch {
      return [];
    }
  });

  const saveCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('rentease_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (product, tenure = 12, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.tenure === tenure
      );
      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
      } else {
        updated = [...prev, { product, tenure, quantity }];
      }
      try {
        localStorage.setItem('rentease_cart', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const removeFromCart = (productId, tenure) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => !(item.product.id === productId && (tenure === undefined || item.tenure === tenure))
      );
      try {
        localStorage.setItem('rentease_cart', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateCartQuantity = (productId, tenure, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, tenure);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.product.id === productId && (tenure === undefined || item.tenure === tenure)) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      try {
        localStorage.setItem('rentease_cart', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('rentease_cart');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = (productId) => {
    setFavoriteProducts((prev) => {
      const isFav = prev.includes(productId);
      const updated = isFav ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('rentease_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isFavorite = (productId) => favoriteProducts.includes(productId);

  const login = (email, password, name = 'User') => {
    const newUser = { name: name || 'Demo Member', email, city: 'Bengaluru' };
    setUser(newUser);
    try {
      localStorage.setItem('rentease_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    return true;
  };

  const register = (email, password, name) => {
    return login(email, password, name);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('rentease_user');
    } catch (e) {
      console.error(e);
    }
  };

  const addRental = (order) => {
    setRentals((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('rentease_rentals', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <RentalContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        saveCart,
        favoriteProducts,
        isFavorite,
        toggleFavorite,
        user,
        login,
        register,
        logout,
        rentals,
        addRental,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}
