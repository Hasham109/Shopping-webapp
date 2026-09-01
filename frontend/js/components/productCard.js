/**
 * ProductCard component — renders a single product card with add-to-cart.
 */
const ProductCard = {
  /**
   * Returns the HTML string for a product card.
   * @param {Object} product
   * @returns {string}
   */
  render(product) {
    return `
      <article class="product-card" data-category="${product.category}" data-id="${product.id}" id="product-${product.id}">
        <div class="product-card__image">
          <span class="product-card__emoji">${product.emoji}</span>
        </div>
        <div class="product-card__body">
          <span class="product-card__category">${product.category}</span>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.description}</p>
          <div class="product-card__footer">
            <div>
              <span class="product-card__price">$${product.price.toFixed(2)}</span>
              <span class="product-card__unit">${product.unit}</span>
            </div>
            <button
              class="product-card__add-btn"
              data-product-id="${product.id}"
              aria-label="Add ${product.name} to cart"
              id="add-btn-${product.id}"
            >
              <span>+</span> Add
            </button>
          </div>
        </div>
      </article>
    `;
  },

  /** Bind add-to-cart click handlers to all cards in a container */
  bindAddToCart(containerEl) {
    containerEl.querySelectorAll('.product-card__add-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const productId = btn.dataset.productId;
        btn.disabled = true;

        try {
          const { data } = await API.addToCart(productId, 1);
          Header.updateBadge(data.itemCount);

          // Visual feedback
          btn.classList.add('added');
          btn.innerHTML = '<span>✓</span> Added';

          Toast.success('Added to cart!');

          setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '<span>+</span> Add';
            btn.disabled = false;
          }, 1200);
        } catch (err) {
          Toast.error(err.message);
          btn.disabled = false;
        }
      });
    });
  },
};
