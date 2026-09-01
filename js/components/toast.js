/**
 * Toast notification component.
 * Slides in from the right with auto-dismiss.
 */
const Toast = {
  /**
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration — ms before auto-dismiss
   */
  show(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || ''}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error', 4000);
  },

  info(message) {
    this.show(message, 'info');
  },
};
