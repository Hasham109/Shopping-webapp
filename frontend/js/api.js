/**
 * API Client — wraps fetch calls to the backend.
 * All methods return parsed JSON with { success, data } shape.
 */
const API = {
  BASE: '/api',

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${this.BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Something went wrong');
      }
      return json;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server');
      }
      throw err;
    }
  },

  // ── Products ───────────────────────────────────────────
  getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request(`/products${qs ? '?' + qs : ''}`);
  },

  getProduct(id) {
    return this.request(`/products/${id}`);
  },

  // ── Cart ───────────────────────────────────────────────
  getCart() {
    return this.request('/cart');
  },

  addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartItem(productId, quantity) {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart(productId) {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  },

  // ── Orders ─────────────────────────────────────────────
  placeOrder(customerInfo) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ customerInfo }),
    });
  },

  getOrders() {
    return this.request('/orders');
  },

  getOrder(id) {
    return this.request(`/orders/${id}`);
  },
};
