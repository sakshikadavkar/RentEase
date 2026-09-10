import { useState, useEffect, useCallback } from 'react';
import { RentalContext } from './RentalContext';
import { buildApiUrl } from '../services/api';

export function RentalProvider({ children }) {
  // 1. Auth Token & User State
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('rentease_jwt') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_user');
      return saved ? JSON.parse(saved) : { name: 'Alex Morgan', email: 'alex.morgan@example.com', city: 'Bengaluru', role: 'customer' };
    } catch {
      return { name: 'Alex Morgan', email: 'alex.morgan@example.com', city: 'Bengaluru', role: 'customer' };
    }
  });

  // 2. Rentals State
  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  // 3. Orders & Deliveries State
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  // 4. Maintenance Tickets State
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // 5. Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Favorites State
  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_favorites');
      return saved ? JSON.parse(saved) : ['luxe-cloud-sofa', 'vista-sectional-sofa'];
    } catch {
      return ['luxe-cloud-sofa', 'vista-sectional-sofa'];
    }
  });

  // API Fetch Helper with Bearer JWT
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const currentToken = token || localStorage.getItem('rentease_jwt');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const apiUrl = buildApiUrl(url);

    const response = await fetch(apiUrl, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      data = { message: text || `HTTP error ${response.status}` };
    }

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }, [token]);

  // Fetch User Profile from Server
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const fullUrl = buildApiUrl('/auth/me');
      const res = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return;
      }
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data.data?.user) {
        setUser(data.data.user);
        localStorage.setItem('rentease_user', JSON.stringify(data.data.user));
      }
    } catch (e) {
      console.warn('Could not sync user profile from server:', e.message);
    }
  }, []);

  // Fetch User Rentals from PostgreSQL
  const fetchRentals = useCallback(async (status = 'all') => {
    setLoadingRentals(true);
    try {
      const queryParam = status && status !== 'all' ? `?status=${status}` : '';
      const data = await authFetch(`/api/rentals${queryParam}`);
      if (data.success && Array.isArray(data.data)) {
        setRentals(data.data);
        localStorage.setItem('rentease_rentals', JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.warn('Failed to load rentals from PostgreSQL:', e.message);
    } finally {
      setLoadingRentals(false);
    }
    return [];
  }, [authFetch]);

  // Fetch Maintenance Tickets from PostgreSQL
  const fetchMaintenanceTickets = useCallback(async (params = {}) => {
    setLoadingTickets(true);
    try {
      let query = '';
      const parts = [];
      if (params.rentalId) parts.push(`rentalId=${params.rentalId}`);
      if (params.status) parts.push(`status=${params.status}`);
      if (parts.length > 0) query = `?${parts.join('&')}`;

      const data = await authFetch(`/api/maintenance${query}`);
      if (data.success && Array.isArray(data.data)) {
        setMaintenanceTickets(data.data);
        return data.data;
      }
    } catch (e) {
      console.warn('Failed to load maintenance tickets:', e.message);
    } finally {
      setLoadingTickets(false);
    }
    return [];
  }, [authFetch]);

  // Fetch Orders from PostgreSQL
  const fetchOrders = useCallback(async () => {
    try {
      const data = await authFetch('/api/orders');
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
        return data.data;
      }
    } catch (e) {
      console.warn('Failed to load orders from server:', e.message);
    }
    return [];
  }, [authFetch]);

  // Fetch Deliveries from PostgreSQL
  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await authFetch('/api/deliveries');
      if (data.success && Array.isArray(data.data)) {
        setDeliveries(data.data);
        return data.data;
      }
    } catch (e) {
      console.warn('Failed to load deliveries from server:', e.message);
    }
    return [];
  }, [authFetch]);

  // Auto-authenticate default user or load data on mount
  useEffect(() => {
    const initAuthAndData = async () => {
      let currentToken = localStorage.getItem('rentease_jwt');
      if (!currentToken) {
        // Auto-login Alex Morgan as initial demo account to provide instant live database experience
        try {
          const fullUrl = buildApiUrl('/auth/login');
          const res = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'alex.morgan@example.com',
              password: 'Password123!',
            }),
          });
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json().catch(() => null);
            if (res.ok && data?.success && data.data?.token) {
              currentToken = data.data.token;
              setToken(currentToken);
              localStorage.setItem('rentease_jwt', currentToken);
              if (data.data.user) {
                setUser(data.data.user);
                localStorage.setItem('rentease_user', JSON.stringify(data.data.user));
              }
            }
          }
        } catch (e) {
          console.warn('Auto demo login skipped:', e.message);
        }
      }

      if (currentToken) {
        await fetchUserProfile(currentToken);
        fetchRentals();
        fetchMaintenanceTickets();
        fetchOrders();
        fetchDeliveries();
      }
    };

    initAuthAndData();
  }, [fetchUserProfile, fetchRentals, fetchMaintenanceTickets, fetchOrders, fetchDeliveries]);

  // 1. Extend Rental Subscription
  const extendRental = async (rentalId, additionalMonths) => {
    const res = await authFetch(`/api/rentals/${rentalId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ additionalMonths }),
    });
    // Refresh rentals list from PostgreSQL
    await fetchRentals();
    return res;
  };

  // 2. Request Rental Return
  const returnRental = async (rentalId, { returnReason, pickupDate, pickupSlot, notes }) => {
    const res = await authFetch(`/api/rentals/${rentalId}/return`, {
      method: 'POST',
      body: JSON.stringify({ returnReason, pickupDate, pickupSlot, notes }),
    });
    await fetchRentals();
    return res;
  };

  // 3. Terminate Rental Early
  const terminateRental = async (rentalId, { reason, pickupDate, pickupSlot, notes }) => {
    const res = await authFetch(`/api/rentals/${rentalId}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ reason, pickupDate, pickupSlot, notes }),
    });
    await fetchRentals();
    return res;
  };

  // 4. Fetch Single Rental Details
  const fetchRentalDetails = async (rentalId) => {
    const res = await authFetch(`/api/rentals/${rentalId}`);
    return res.data;
  };

  // 5. Create Structured Maintenance Ticket
  const createMaintenanceTicket = async ({
    rentalId,
    issueCategory,
    description,
    urgency,
    preferredTimeSlot,
    customerPhone,
  }) => {
    const res = await authFetch('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify({
        rentalId,
        issueCategory,
        description,
        urgency,
        preferredTimeSlot,
        customerPhone,
      }),
    });
    await fetchMaintenanceTickets();
    return res;
  };

  // 6. Fetch Single Maintenance Ticket
  const fetchMaintenanceTicketDetails = async (ticketId) => {
    const res = await authFetch(`/api/maintenance/${ticketId}`);
    return res.data;
  };

  // 7. Place Real Order from Checkout
  const createOrder = async (orderPayload) => {
    const res = await authFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    if (res.success) {
      await fetchRentals();
      await fetchOrders();
      await fetchDeliveries();
      clearCart();
    }
    return res;
  };

  // Authentication: Login
  const login = async (email, password) => {
    const fullUrl = buildApiUrl('/auth/login');
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => '');
      if (res.status === 404) {
        throw new Error('API route /api/auth/login not found on server (404). Please verify backend deployment.');
      }
      throw new Error(`Authentication server returned error (${res.status}): ${text.slice(0, 100)}`);
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Login failed. Please check your credentials.');
    }
    const authToken = data.data.token;
    setToken(authToken);
    localStorage.setItem('rentease_jwt', authToken);
    if (data.data.user) {
      setUser(data.data.user);
      localStorage.setItem('rentease_user', JSON.stringify(data.data.user));
    }
    // Load user data
    await fetchRentals();
    await fetchMaintenanceTickets();
    await fetchOrders();
    await fetchDeliveries();
    return data.data;
  };

  // Authentication: Register
  const register = async (email, password, name, city = 'Bengaluru', phone = '') => {
    const fullUrl = buildApiUrl('/auth/register');
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, city, phone }),
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => '');
      if (res.status === 404) {
        throw new Error('API route /api/auth/register not found on server (404).');
      }
      throw new Error(`Registration server returned error (${res.status}): ${text.slice(0, 100)}`);
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Registration failed. Please check your inputs.');
    }
    const authToken = data.data.token;
    setToken(authToken);
    localStorage.setItem('rentease_jwt', authToken);
    if (data.data.user) {
      setUser(data.data.user);
      localStorage.setItem('rentease_user', JSON.stringify(data.data.user));
    }
    await fetchRentals();
    await fetchMaintenanceTickets();
    await fetchOrders();
    await fetchDeliveries();
    return data.data;
  };

  // Authentication: Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setRentals([]);
    setOrders([]);
    setDeliveries([]);
    setMaintenanceTickets([]);
    localStorage.removeItem('rentease_user');
    localStorage.removeItem('rentease_jwt');
    localStorage.removeItem('rentease_rentals');
  };

  // Cart operations
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
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId, tenure) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => !(item.product.id === productId && (tenure === undefined || item.tenure === tenure))
      );
      saveCart(updated);
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
      saveCart(updated);
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
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  return (
    <RentalContext.Provider
      value={{
        // Auth
        user,
        token,
        isAdmin,
        authFetch,
        login,
        register,
        logout,
        // Cart
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        saveCart,
        // Wishlist
        favoriteProducts,
        isFavorite,
        toggleFavorite,
        // Phase 2 Rental Lifecycle
        rentals,
        loadingRentals,
        fetchRentals,
        fetchRentalDetails,
        extendRental,
        returnRental,
        terminateRental,
        // Phase 2 Maintenance Tickets
        maintenanceTickets,
        loadingTickets,
        fetchMaintenanceTickets,
        createMaintenanceTicket,
        fetchMaintenanceTicketDetails,
        // Phase 2 Orders & Deliveries
        orders,
        fetchOrders,
        createOrder,
        deliveries,
        fetchDeliveries,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}
