/**
 * Home Page — hero banner, category filters, product grid with search.
 */
const HomePage = {
  /** Currently loaded products */
  products: [],
  /** Active category filter */
  activeCategory: null,
  /** Active search query */
  searchQuery: '',

  /** Categories with emoji icons */
  categories: [
    { name: 'All', emoji: '🛍️' },
    { name: 'Fruits', emoji: '🍎' },
    { name: 'Vegetables', emoji: '🥦' },
    { name: 'Dairy', emoji: '🧀' },
    { name: 'Bakery', emoji: '🍞' },
    { name: 'Beverages', emoji: '☕' },
    { name: 'Snacks', emoji: '🍫' },
  ],

  /** Render the full home page */
  async render() {
    const main = document.getElementById('app-main');
    Header.setActive('home');

    main.innerHTML = `
      <div class="page-enter">
        <!-- Hero -->
        <section class="hero">
          <div class="container hero__content">
            <div class="hero__emoji">🥑🍊🥖</div>
            <h1 class="hero__title">Fresh Groceries, Delivered</h1>
            <p class="hero__subtitle">Handpicked quality produce, dairy, bakery & more — right to your door.</p>
          </div>
        </section>

        <div class="container">
          <!-- Mobile search -->
          <div class="mobile-search">
            <input
              type="text"
              class="header__search-input"
              id="mobile-search-input"
              placeholder="Search groceries..."
              autocomplete="off"
            />
          </div>

          <!-- Categories -->
          <section class="categories" id="categories-section">
            <div class="categories__list" id="categories-list"></div>
          </section>

          <!-- Products -->
          <section class="products" id="products-section">
            <div class="products__header">
              <h2 class="products__title" id="products-title">All Products</h2>
              <span class="products__count" id="products-count"></span>
            </div>
            <div class="products__grid" id="products-grid">
              ${this.renderSkeletons(8)}
            </div>
          </section>
        </div>
      </div>
    `;

    this.renderCategories();
    this.bindMobileSearch();
    await this.loadProducts();
  },

  /** Render category filter pills */
  renderCategories() {
    const list = document.getElementById('categories-list');
    list.innerHTML = this.categories
      .map(
        (cat) => `
        <button
          class="category-pill ${cat.name === 'All' && !this.activeCategory ? 'active' : ''} ${this.activeCategory === cat.name ? 'active' : ''}"
          data-category="${cat.name}"
          id="cat-${cat.name.toLowerCase()}"
        >
          <span class="category-pill__emoji">${cat.emoji}</span>
          ${cat.name}
        </button>
      `
      )
      .join('');

    list.querySelectorAll('.category-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const category = pill.dataset.category;
        this.activeCategory = category === 'All' ? null : category;

        // Update active states
        list.querySelectorAll('.category-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        this.loadProducts();
      });
    });
  },

  /** Bind mobile search input */
  bindMobileSearch() {
    const input = document.getElementById('mobile-search-input');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.filterBySearch(e.target.value);
      }, 300);
    });
  },

  /** Called from header search or mobile search */
  filterBySearch(query) {
    this.searchQuery = query;
    this.loadProducts();
  },

  /** Load products from API with current filters */
  async loadProducts() {
    try {
      const params = {};
      if (this.activeCategory) params.category = this.activeCategory;
      if (this.searchQuery) params.search = this.searchQuery;

      const { data, count } = await API.getProducts(params);
      this.products = data;
      this.renderProducts(data, count);
    } catch (err) {
      Toast.error('Failed to load products');
    }
  },

  /** Render product cards into the grid */
  renderProducts(products, count) {
    const grid = document.getElementById('products-grid');
    const title = document.getElementById('products-title');
    const countEl = document.getElementById('products-count');

    // Update header
    title.textContent = this.activeCategory || 'All Products';
    countEl.textContent = `${count || products.length} item${products.length !== 1 ? 's' : ''}`;

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="products__empty">
          <div class="products__empty-emoji">🔍</div>
          <p class="products__empty-text">No products found</p>
          <p style="color: var(--text-muted); margin-top: 8px; font-size: 0.9rem;">Try a different search or category</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map((p) => ProductCard.render(p)).join('');
    ProductCard.bindAddToCart(grid);
  },

  /** Render loading skeletons */
  renderSkeletons(count) {
    return Array(count)
      .fill('<div class="skeleton skeleton-card"></div>')
      .join('');
  },
};
