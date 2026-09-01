const { v4: uuidv4 } = require('uuid');
const products = require('./data/products.json');

/**
 * In-memory data store for products, cart, and orders.
 * All data persists within the server session.
 */
class Store {
  constructor() {
    this.products = products;
    this.cart = [];
    this.orders = [];
  }

  _ensureProducts() {
    try {
      delete require.cache[require.resolve('./data/products.json')];
      this.products = require('./data/products.json');
    } catch (e) {
      // Fallback
    }
  }

  // ── Product Methods ──────────────────────────────────────

  getProducts(filters = {}) {
    this._ensureProducts();
    let result = [...this.products];

    if (filters.category) {
      result = result.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return result;
  }

  getProductById(id) {
    this._ensureProducts();
    return this.products.find((p) => p.id === id) || null;
  }

  // ── Cart Methods ─────────────────────────────────────────

  getCart() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return {
      items: this.cart,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    if (!product.inStock) {
      const err = new Error('Product is out of stock');
      err.statusCode = 400;
      throw err;
    }

    const existing = this.cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        emoji: product.emoji,
        quantity,
      });
    }

    return this.getCart();
  }

  updateCartItem(productId, quantity) {
    const item = this.cart.find((item) => item.productId === productId);
    if (!item) {
      const err = new Error('Item not found in cart');
      err.statusCode = 404;
      throw err;
    }

    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    item.quantity = quantity;
    return this.getCart();
  }

  removeFromCart(productId) {
    const index = this.cart.findIndex((item) => item.productId === productId);
    if (index === -1) {
      const err = new Error('Item not found in cart');
      err.statusCode = 404;
      throw err;
    }

    this.cart.splice(index, 1);
    return this.getCart();
  }

  clearCart() {
    this.cart = [];
    return this.getCart();
  }

  // ── Order Methods ────────────────────────────────────────

  createOrder(customerInfo) {
    if (this.cart.length === 0) {
      const err = new Error('Cart is empty');
      err.statusCode = 400;
      throw err;
    }

    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = 2.99;

    const order = {
      id: uuidv4().slice(0, 8).toUpperCase(),
      items: [...this.cart.map((item) => ({ ...item }))],
      customerInfo,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      total: Math.round((subtotal + deliveryFee) * 100) / 100,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);
    this.cart = [];
    return order;
  }

  getOrders() {
    return [...this.orders].reverse();
  }

  getOrderById(id) {
    return this.orders.find((o) => o.id === id) || null;
  }
}

// Export a singleton instance
module.exports = new Store();
