/**
 * API Client — wraps fetch calls to the backend with seamless fallback to LocalStorage & Mock Data for GitHub Pages.
 * All methods return parsed JSON with { success, data } shape.
 */

const LocalStore = {
  getProducts(params = {}) {
    const products = window.DEFAULT_PRODUCTS || [];
    let result = [...products];
    if (params.category) {
      result = result.filter(
        (p) => p.category.toLowerCase() === params.category.toLowerCase()
      );
    }
    if (params.search) {
      const query = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    return { success: true, data: result, count: result.length };
  },

  getProduct(id) {
    const products = window.DEFAULT_PRODUCTS || [];
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    return { success: true, data: product };
  },

  getCart() {
    const cart = JSON.parse(localStorage.getItem('freshcart_cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      success: true,
      data: {
        items: cart,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      },
    };
  },

  addToCart(productId, quantity = 1) {
    const products = window.DEFAULT_PRODUCTS || [];
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');
    if (!product.inStock) throw new Error('Product is out of stock');

    const cart = JSON.parse(localStorage.getItem('freshcart_cart') || '[]');
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        emoji: product.emoji,
        quantity,
      });
    }
    localStorage.setItem('freshcart_cart', JSON.stringify(cart));
    return this.getCart();
  },

  updateCartItem(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('freshcart_cart') || '[]');
    const item = cart.find((item) => item.productId === productId);
    if (!item) throw new Error('Item not found in cart');

    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    item.quantity = quantity;
    localStorage.setItem('freshcart_cart', JSON.stringify(cart));
    return this.getCart();
  },

  removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('freshcart_cart') || '[]');
    cart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem('freshcart_cart', JSON.stringify(cart));
    return this.getCart();
  },

  clearCart() {
    localStorage.removeItem('freshcart_cart');
    return this.getCart();
  },

  placeOrder(customerInfo) {
    const cartData = this.getCart().data;
    if (!cartData.items || cartData.items.length === 0) {
      throw new Error('Cart is empty');
    }
    const deliveryFee = 2.99;
    const subtotal = cartData.subtotal;
    const order = {
      id: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      items: [...cartData.items],
      customerInfo,
      subtotal,
      deliveryFee,
      total: Math.round((subtotal + deliveryFee) * 100) / 100,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem('freshcart_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('freshcart_orders', JSON.stringify(orders));
    this.clearCart();
    return { success: true, data: order };
  },

  getOrders() {
    const orders = JSON.parse(localStorage.getItem('freshcart_orders') || '[]');
    return { success: true, data: orders };
  },

  getOrder(id) {
    const orders = JSON.parse(localStorage.getItem('freshcart_orders') || '[]');
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    return { success: true, data: order };
  },
};

const API = {
  BASE: '/api',
  useLocal: window.location.hostname.includes('github.io') || window.location.protocol === 'file:',

  async request(endpoint, options = {}) {
    if (this.useLocal) return null;
    try {
      const res = await fetch(`${this.BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!res.ok) {
        this.useLocal = true;
        return null;
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Something went wrong');
      }
      return json;
    } catch (err) {
      this.useLocal = true;
      return null;
    }
  },

  // ── Products ───────────────────────────────────────────
  async getProducts(params = {}) {
    if (!this.useLocal) {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      const res = await this.request(`/products${qs ? '?' + qs : ''}`);
      if (res) return res;
    }
    return LocalStore.getProducts(params);
  },

  async getProduct(id) {
    if (!this.useLocal) {
      const res = await this.request(`/products/${id}`);
      if (res) return res;
    }
    return LocalStore.getProduct(id);
  },

  // ── Cart ───────────────────────────────────────────────
  async getCart() {
    if (!this.useLocal) {
      const res = await this.request('/cart');
      if (res) return res;
    }
    return LocalStore.getCart();
  },

  async addToCart(productId, quantity = 1) {
    if (!this.useLocal) {
      const res = await this.request('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res) return res;
    }
    return LocalStore.addToCart(productId, quantity);
  },

  async updateCartItem(productId, quantity) {
    if (!this.useLocal) {
      const res = await this.request(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      if (res) return res;
    }
    return LocalStore.updateCartItem(productId, quantity);
  },

  async removeFromCart(productId) {
    if (!this.useLocal) {
      const res = await this.request(`/cart/${productId}`, {
        method: 'DELETE',
      });
      if (res) return res;
    }
    return LocalStore.removeFromCart(productId);
  },

  async clearCart() {
    if (!this.useLocal) {
      const res = await this.request('/cart', {
        method: 'DELETE',
      });
      if (res) return res;
    }
    return LocalStore.clearCart();
  },

  // ── Orders ─────────────────────────────────────────────
  async placeOrder(customerInfo) {
    if (!this.useLocal) {
      const res = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify({ customerInfo }),
      });
      if (res) return res;
    }
    return LocalStore.placeOrder(customerInfo);
  },

  async getOrders() {
    if (!this.useLocal) {
      const res = await this.request('/orders');
      if (res) return res;
    }
    return LocalStore.getOrders();
  },

  async getOrder(id) {
    if (!this.useLocal) {
      const res = await this.request(`/orders/${id}`);
      if (res) return res;
    }
    return LocalStore.getOrder(id);
  },
};
