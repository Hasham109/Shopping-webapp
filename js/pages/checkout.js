/**
 * Checkout Page — delivery form + order summary + confirmation modal.
 */
const CheckoutPage = {
  /** Current cart data */
  cart: null,

  /** Render the checkout page */
  async render() {
    const main = document.getElementById('app-main');
    Header.setActive('');

    // Load cart first to check if it's empty
    try {
      const { data } = await API.getCart();
      this.cart = data;

      if (data.items.length === 0) {
        main.innerHTML = `
          <div class="page-enter">
            <div class="container cart-page">
              <div class="cart-empty">
                <div class="cart-empty__emoji">🛒</div>
                <h2 class="cart-empty__title">Nothing to checkout</h2>
                <p class="cart-empty__text">Add some items to your cart first.</p>
                <button class="cart-empty__btn" onclick="window.location.hash='#/'" id="go-shopping-btn">
                  🛍️ Start Shopping
                </button>
              </div>
            </div>
          </div>
        `;
        return;
      }
    } catch (err) {
      Toast.error('Failed to load cart');
      return;
    }

    const deliveryFee = 2.99;
    const total = this.cart.subtotal + deliveryFee;

    main.innerHTML = `
      <div class="page-enter">
        <div class="container checkout-page">
          <h1 class="checkout-page__title">Checkout</h1>
          <div class="checkout-page__layout">
            <!-- Delivery Form -->
            <div class="checkout-form" id="checkout-form-card">
              <h2 class="checkout-form__title">📦 Delivery Details</h2>
              <form id="checkout-form" novalidate>
                <div class="form-row">
                  <div class="form-group">
                    <label for="checkout-name">Full Name</label>
                    <input type="text" id="checkout-name" name="name" placeholder="John Doe" required />
                    <div class="form-group__error" id="error-name">Please enter your name</div>
                  </div>
                  <div class="form-group">
                    <label for="checkout-email">Email</label>
                    <input type="email" id="checkout-email" name="email" placeholder="john@example.com" required />
                    <div class="form-group__error" id="error-email">Please enter a valid email</div>
                  </div>
                </div>
                <div class="form-group">
                  <label for="checkout-phone">Phone Number</label>
                  <input type="tel" id="checkout-phone" name="phone" placeholder="(555) 123-4567" required />
                  <div class="form-group__error" id="error-phone">Please enter your phone number</div>
                </div>
                <div class="form-group">
                  <label for="checkout-address">Delivery Address</label>
                  <textarea id="checkout-address" name="address" placeholder="123 Main St, Apt 4B, New York, NY 10001" required></textarea>
                  <div class="form-group__error" id="error-address">Please enter your delivery address</div>
                </div>
                <div class="form-group">
                  <label for="checkout-notes">Delivery Notes (optional)</label>
                  <textarea id="checkout-notes" name="notes" placeholder="Leave at door, ring bell, etc."></textarea>
                </div>
                <button type="submit" class="checkout-form__submit" id="place-order-btn">
                  🛒 Place Order — $${total.toFixed(2)}
                </button>
              </form>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h3 class="order-summary__title">🧾 Order Summary</h3>
              <div class="order-summary__items" id="checkout-items">
                ${this.cart.items
                  .map(
                    (item) => `
                  <div class="order-summary__item">
                    <span class="order-summary__item-emoji">${item.emoji}</span>
                    <div class="order-summary__item-info">
                      <div class="order-summary__item-name">${item.name}</div>
                      <div class="order-summary__item-qty">Qty: ${item.quantity}</div>
                    </div>
                    <span class="order-summary__item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="order-summary__row">
                <span class="order-summary__row-label">Subtotal</span>
                <span class="order-summary__row-value">$${this.cart.subtotal.toFixed(2)}</span>
              </div>
              <div class="order-summary__row">
                <span class="order-summary__row-label">Delivery Fee</span>
                <span class="order-summary__row-value">$${deliveryFee.toFixed(2)}</span>
              </div>
              <div class="order-summary__row order-summary__total">
                <span class="order-summary__row-label">Total</span>
                <span class="order-summary__row-value">$${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindForm();
  },

  /** Bind form submission with validation */
  bindForm() {
    const form = document.getElementById('checkout-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate
      const fields = {
        name: document.getElementById('checkout-name'),
        email: document.getElementById('checkout-email'),
        phone: document.getElementById('checkout-phone'),
        address: document.getElementById('checkout-address'),
      };

      let valid = true;

      // Reset errors
      Object.keys(fields).forEach((key) => {
        fields[key].classList.remove('error');
        document.getElementById(`error-${key}`).classList.remove('visible');
      });

      // Check required
      Object.keys(fields).forEach((key) => {
        if (!fields[key].value.trim()) {
          fields[key].classList.add('error');
          document.getElementById(`error-${key}`).classList.add('visible');
          valid = false;
        }
      });

      // Check email format
      if (fields.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
        fields.email.classList.add('error');
        document.getElementById('error-email').textContent = 'Please enter a valid email';
        document.getElementById('error-email').classList.add('visible');
        valid = false;
      }

      if (!valid) {
        Toast.error('Please fill in all required fields');
        return;
      }

      // Submit order
      const submitBtn = document.getElementById('place-order-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Placing order...';

      try {
        const customerInfo = {
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          phone: fields.phone.value.trim(),
          address: fields.address.value.trim(),
          notes: document.getElementById('checkout-notes').value.trim(),
        };

        const { data: order } = await API.placeOrder(customerInfo);
        Header.updateBadge(0);
        this.showConfirmation(order);
      } catch (err) {
        Toast.error(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '🛒 Place Order';
      }
    });
  },

  /** Show the order confirmation modal */
  showConfirmation(order) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'confirmation-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__checkmark">✓</div>
        <h2 class="modal__title">Order Confirmed!</h2>
        <p class="modal__subtitle">Your groceries are on their way. We'll send a confirmation to your email.</p>
        <div class="modal__order-id">Order #${order.id}</div>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 24px;">
          Total: <strong style="color: var(--primary-light)">$${order.total.toFixed(2)}</strong>
          · ${order.items.length} item${order.items.length !== 1 ? 's' : ''}
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="modal__btn" id="confirmation-orders-btn" style="background:var(--bg-glass);border:1px solid var(--border);color:var(--text-primary);">
            📋 View My Orders
          </button>
          <button class="modal__btn" id="confirmation-done-btn">
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });

    // View Orders button
    document.getElementById('confirmation-orders-btn').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        window.location.hash = '#/orders';
      }, 300);
    });

    // Done button
    document.getElementById('confirmation-done-btn').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        window.location.hash = '#/';
      }, 300);
    });
  },
};
