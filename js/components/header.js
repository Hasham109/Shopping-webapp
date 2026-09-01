/**
 * Header component — renders logo, search bar, nav links, cart button.
 * Refreshes cart badge on demand.
 */
const Header = {
  /** Current cart item count for the badge */
  cartCount: 0,

  /** Render the header into #app-header */
  render() {
    const header = document.getElementById('app-header');
    header.className = 'header';
    header.innerHTML = `
      <div class="header__inner">
        <a class="header__logo" href="#/" id="header-logo">
          <span class="header__logo-icon">🛒</span>
          <span class="header__logo-text">Fresh<span>Cart</span></span>
        </a>

        <div class="header__search" id="header-search-desktop">
          <span class="header__search-icon">🔍</span>
          <input
            type="text"
            class="header__search-input"
            id="search-input"
            placeholder="Search fresh groceries..."
            autocomplete="off"
          />
        </div>

        <nav class="header__nav">
          <a class="header__nav-link" href="#/" id="nav-home">
            <span>🏠</span> <span>Shop</span>
          </a>
          <a class="header__nav-link" href="#/orders" id="nav-orders">
            <span>📋</span> <span>Orders</span>
          </a>
          <button class="header__cart-btn" id="nav-cart" aria-label="View cart">
            <span>🛒</span> <span>Cart</span>
            <span class="header__cart-badge" id="cart-badge">0</span>
          </button>
        </nav>
      </div>
    `;

    this.bindEvents();
    this.refreshBadge();
  },

  /** Bind click & input events */
  bindEvents() {
    // Cart button navigates to cart
    document.getElementById('nav-cart').addEventListener('click', () => {
      window.location.hash = '#/cart';
    });

    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (typeof HomePage !== 'undefined' && window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#') {
            HomePage.filterBySearch(e.target.value);
          }
        }, 300);
      });
    }
  },

  /** Fetch cart and update badge count */
  async refreshBadge() {
    try {
      const { data } = await API.getCart();
      this.updateBadge(data.itemCount);
    } catch (err) {
      // Silently fail — badge just stays at current count
    }
  },

  /** Update the badge number and visibility */
  updateBadge(count) {
    this.cartCount = count;
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    badge.textContent = count;

    if (count > 0) {
      badge.classList.add('visible');
      // Trigger bump animation
      badge.classList.remove('bump');
      void badge.offsetWidth; // force reflow
      badge.classList.add('bump');
    } else {
      badge.classList.remove('visible');
    }
  },

  /** Highlight the active nav link */
  setActive(page) {
    document.querySelectorAll('.header__nav-link').forEach((el) => {
      el.classList.remove('active');
    });
    const el = document.getElementById(`nav-${page}`);
    if (el) el.classList.add('active');
  },
};
