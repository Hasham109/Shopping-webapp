/**
 * FreshCart App - Client-side Router & Initialization
 */

const App = {
  routes: {
    '': HomePage,
    '#/': HomePage,
    '#/cart': CartPage,
    '#/checkout': CheckoutPage,
    '#/orders': OrdersPage,
  },

  init() {
    // Render the persistent header
    Header.render();

    // Setup hash-based client routing
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // Initial route handling
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.toLowerCase() || '#/';
    const page = this.routes[hash] || this.routes[hash.replace(/\/$/, '')] || HomePage;

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page && typeof page.render === 'function') {
      page.render();
    } else {
      HomePage.render();
    }
  },
};

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
