/**
 * Cart Page — displays cart items, quantity controls, summary, and checkout CTA.
 */
const CartPage = {
  /** Render the cart page */
  async render() {
    const main = document.getElementById('app-main');
    Header.setActive('');

    main.innerHTML = `
      <div class="page-enter">
        <div class="container cart-page">
          <div class="cart-page__header">
            <h1 class="cart-page__title">Your Cart</h1>
            <p class="cart-page__subtitle" id="cart-subtitle">Loading...</p>
          </div>
          <div class="cart-page__layout" id="cart-layout">
            <div class="cart-items" id="cart-items-list">
              ${Array(3).fill('<div class="skeleton" style="height:88px;border-radius:12px"></div>').join('')}
            </div>
            <div id="cart-summary-area"></div>
          </div>
        </div>
      </div>
    `;

    await this.loadCart();
  },

  /** Fetch cart data and render */
  async loadCart() {
    try {
      const { data } = await API.getCart();
      this.renderCart(data);
    } catch (err) {
      Toast.error('Failed to load cart');
    }
  },

  /** Render cart contents */
  renderCart(cart) {
    const subtitle = document.getElementById('cart-subtitle');
    const itemsList = document.getElementById('cart-items-list');
    const summaryArea = document.getElementById('cart-summary-area');

    if (cart.items.length === 0) {
      subtitle.textContent = '';
      document.getElementById('cart-layout').innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__emoji">🛒</div>
          <h2 class="cart-empty__title">Your cart is empty</h2>
          <p class="cart-empty__text">Looks like you haven't added any items yet.</p>
          <button class="cart-empty__btn" onclick="window.location.hash='#/'" id="start-shopping-btn">
            🛍️ Start Shopping
          </button>
        </div>
      `;
      summaryArea.innerHTML = '';
      return;
    }

    subtitle.textContent = `${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''} in your cart`;

    // Render cart items
    itemsList.innerHTML = cart.items.map((item) => CartItem.render(item)).join('');
    CartItem.bindEvents(itemsList, (updatedCart) => this.renderCart(updatedCart));

    // Render summary
    const deliveryFee = 2.99;
    const total = cart.subtotal + deliveryFee;

    summaryArea.innerHTML = `
      <div class="cart-summary">
        <h3 class="cart-summary__title">Order Summary</h3>
        <div class="cart-summary__row">
          <span class="cart-summary__label">Subtotal (${cart.itemCount} items)</span>
          <span class="cart-summary__value">$${cart.subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-summary__row">
          <span class="cart-summary__label">Delivery Fee</span>
          <span class="cart-summary__value">$${deliveryFee.toFixed(2)}</span>
        </div>
        <div class="cart-summary__row cart-summary__total">
          <span class="cart-summary__label">Total</span>
          <span class="cart-summary__value">$${total.toFixed(2)}</span>
        </div>
        <button class="cart-summary__checkout-btn" id="proceed-checkout-btn">
          Proceed to Checkout →
        </button>
        <button class="cart-summary__continue" onclick="window.location.hash='#/'" id="continue-shopping-btn">
          ← Continue Shopping
        </button>
      </div>
    `;

    document.getElementById('proceed-checkout-btn').addEventListener('click', () => {
      window.location.hash = '#/checkout';
    });
  },
};
