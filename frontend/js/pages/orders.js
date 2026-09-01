/**
 * Orders Page — displays history of all placed orders with details.
 */
const OrdersPage = {
  /** Render the orders page */
  async render() {
    const main = document.getElementById('app-main');
    Header.setActive('orders');

    main.innerHTML = `
      <div class="page-enter">
        <div class="container orders-page">
          <div class="orders-page__header">
            <div>
              <h1 class="orders-page__title">📋 My Orders</h1>
              <p class="orders-page__subtitle" id="orders-subtitle">Loading your order history...</p>
            </div>
            <button class="orders-page__refresh-btn" id="refresh-orders-btn" title="Refresh orders">
              🔄 Refresh
            </button>
          </div>
          <div class="orders-list" id="orders-list">
            ${Array(2).fill('<div class="skeleton" style="height:160px;border-radius:16px;margin-bottom:16px;"></div>').join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('refresh-orders-btn').addEventListener('click', () => {
      this.loadOrders();
    });

    await this.loadOrders();
  },

  /** Fetch orders from API */
  async loadOrders() {
    try {
      const { data: orders } = await API.getOrders();
      this.renderOrders(orders);
    } catch (err) {
      Toast.error('Failed to load orders');
    }
  },

  /** Render orders list */
  renderOrders(orders) {
    const subtitle = document.getElementById('orders-subtitle');
    const list = document.getElementById('orders-list');

    if (!orders || orders.length === 0) {
      subtitle.textContent = 'You haven\'t placed any orders yet.';
      list.innerHTML = `
        <div class="cart-empty" style="grid-column:1/-1;">
          <div class="cart-empty__emoji">📦</div>
          <h2 class="cart-empty__title">No order records found</h2>
          <p class="cart-empty__text">Explore our fresh grocery catalog and place your first order!</p>
          <button class="cart-empty__btn" onclick="window.location.hash='#/'" id="shop-now-btn">
            🛍️ Start Shopping
          </button>
        </div>
      `;
      return;
    }

    subtitle.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`;

    list.innerHTML = orders
      .map((order) => {
        const dateStr = new Date(order.createdAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return `
          <article class="order-card" id="order-card-${order.id}">
            <div class="order-card__header">
              <div class="order-card__meta">
                <div class="order-card__id">Order #${order.id}</div>
                <div class="order-card__date">Placed on ${dateStr}</div>
              </div>
              <div class="order-card__status status-confirmed">
                <span class="status-dot"></span> Confirmed
              </div>
            </div>

            <div class="order-card__body">
              <div class="order-card__items">
                <h4 class="order-card__section-title">Items Ordered (${order.items.reduce((s, i) => s + i.quantity, 0)})</h4>
                <div class="order-items-grid">
                  ${order.items
                    .map(
                      (item) => `
                    <div class="order-item-chip">
                      <span class="order-item-chip__emoji">${item.emoji}</span>
                      <div class="order-item-chip__details">
                        <div class="order-item-chip__name">${item.name}</div>
                        <div class="order-item-chip__qty">${item.quantity} × $${item.price.toFixed(2)} (${item.unit})</div>
                      </div>
                      <div class="order-item-chip__total">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <div class="order-card__info-box">
                <h4 class="order-card__section-title">📍 Delivery Details</h4>
                <div class="order-info-line"><strong>Recipient:</strong> ${order.customerInfo.name}</div>
                <div class="order-info-line"><strong>Email:</strong> ${order.customerInfo.email}</div>
                <div class="order-info-line"><strong>Phone:</strong> ${order.customerInfo.phone}</div>
                <div class="order-info-line"><strong>Address:</strong> ${order.customerInfo.address}</div>
                ${order.customerInfo.notes ? `<div class="order-info-line"><strong>Notes:</strong> ${order.customerInfo.notes}</div>` : ''}
              </div>
            </div>

            <div class="order-card__footer">
              <div class="order-card__breakdown">
                <span>Subtotal: $${order.subtotal.toFixed(2)}</span>
                <span>Delivery: $${order.deliveryFee.toFixed(2)}</span>
                <span class="order-card__grand-total">Total Paid: $${order.total.toFixed(2)}</span>
              </div>
              <button class="order-card__reorder-btn" onclick="window.location.hash='#/'">
                🛍️ Shop Again
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  },
};
