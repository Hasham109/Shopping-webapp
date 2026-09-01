/**
 * CartItem component — renders a single cart line item with controls.
 */
const CartItem = {
  /**
   * Returns the HTML string for a cart item row.
   * @param {Object} item — { productId, name, price, unit, emoji, quantity }
   * @returns {string}
   */
  render(item) {
    const subtotal = (item.price * item.quantity).toFixed(2);

    return `
      <div class="cart-item" data-product-id="${item.productId}" id="cart-item-${item.productId}">
        <div class="cart-item__emoji">${item.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">$${item.price.toFixed(2)} ${item.unit}</div>
        </div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" data-action="decrease" data-id="${item.productId}" aria-label="Decrease quantity">−</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button class="cart-item__qty-btn" data-action="increase" data-id="${item.productId}" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item__subtotal">$${subtotal}</div>
        <button class="cart-item__remove" data-action="remove" data-id="${item.productId}" aria-label="Remove ${item.name} from cart">✕</button>
      </div>
    `;
  },

  /**
   * Bind quantity and remove event handlers inside a container.
   * @param {HTMLElement} containerEl
   * @param {Function} onUpdate — called after any mutation with the updated cart
   */
  bindEvents(containerEl, onUpdate) {
    containerEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.disabled = true;

      try {
        let result;
        if (action === 'increase') {
          const qtyEl = btn.parentElement.querySelector('.cart-item__qty');
          const newQty = parseInt(qtyEl.textContent, 10) + 1;
          result = await API.updateCartItem(id, newQty);
        } else if (action === 'decrease') {
          const qtyEl = btn.parentElement.querySelector('.cart-item__qty');
          const newQty = parseInt(qtyEl.textContent, 10) - 1;
          if (newQty <= 0) {
            result = await API.removeFromCart(id);
          } else {
            result = await API.updateCartItem(id, newQty);
          }
        } else if (action === 'remove') {
          result = await API.removeFromCart(id);
          Toast.info('Item removed');
        }

        if (result) {
          Header.updateBadge(result.data.itemCount);
          if (onUpdate) onUpdate(result.data);
        }
      } catch (err) {
        Toast.error(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  },
};
