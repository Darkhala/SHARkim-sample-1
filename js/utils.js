/**
 * Sharkim Traders - Utility Module
 * Global utility functions for ID sanitization and common operations
 */

(function() {
  'use strict';

  /**
   * Sanitize a string to be used as a valid HTML ID
   * - Converts to lowercase
   * - Replaces spaces with hyphens
   * - Replaces "&" with "and"
   * - Removes special characters
   * @param {string} str - The string to sanitize
   * @returns {string} Sanitized ID-safe string
   */
  function sanitizeId(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format price with KES currency
   * @param {number} price - Price to format
   * @returns {string} Formatted price string
   */
  function formatPrice(price) {
    return `Ksh ${Number(price || 0).toLocaleString()}`;
  }

  /**
   * Get URL query parameters
   * @returns {URLSearchParams} URL search parameters
   */
  function getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Set URL query parameters without reload
   * @param {URLSearchParams} params - Parameters to set
   */
  function setUrlParams(params) {
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Show notification toast
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'info'
   */
  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.sharkim-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `sharkim-notification fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    const colors = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-blue-600 text-white'
    };
    
    notification.classList.add(...(colors[type] || colors.info).split(' '));
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate phone number (Kenyan format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Is valid phone
   */
  function isValidPhone(phone) {
    const re = /^(\+254|0)?[17]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
  }

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }

  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Expose public API
  window.SharkimUtils = {
    sanitizeId,
    escapeHtml,
    formatPrice,
    getUrlParams,
    setUrlParams,
    debounce,
    showNotification,
    isValidEmail,
    isValidPhone,
    truncateText,
    copyToClipboard,
    generateId
  };
})();