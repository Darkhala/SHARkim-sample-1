/**
 * Sharkim Traders - Order Confirmation Page Module
 * Displays order confirmation details
 */

(function() {
  'use strict';

  // DOM Elements
  const orderIdEl = document.getElementById('orderId');

  /**
   * Get URL query parameters
   */
  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Display order confirmation
   */
  function displayOrderConfirmation() {
    const params = getQueryParams();
    let orderId = params.get('order');

    // If no order ID in URL, try localStorage or generate one
    if (!orderId) {
      orderId = localStorage.getItem('last_order_id') || 'ORD-' + Date.now();
    }

    // Save to localStorage for future reference
    localStorage.setItem('last_order_id', orderId);

    // Update the order ID display
    if (orderIdEl) {
      orderIdEl.textContent = orderId;
    }
  }

  /**
   * Initialize page
   */
  function init() {
    displayOrderConfirmation();
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();