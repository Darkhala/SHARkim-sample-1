/**
 * Sharkim Traders - Cart Module
 * Handles all cart operations with localStorage persistence
 * Uses sanitized IDs for all DOM operations
 */

(function() {
  'use strict';

  // Cart state
  let cart = [];

  /**
   * Initialize cart from localStorage
   */
  function init() {
    try {
      cart = JSON.parse(localStorage.getItem('sharkim_cart') || '[]');
    } catch (e) {
      console.error('Failed to load cart:', e);
      cart = [];
    }
    updateCartCount();
  }

  /**
   * Save cart to localStorage
   */
  function save() {
    localStorage.setItem('sharkim_cart', JSON.stringify(cart));
  }

  /**
   * Add item to cart
   * @param {Object} product - Product object with id, title, price, image_url
   * @param {string} variant - Optional variant (size, color, etc.)
   */
  function addItem(product, variant = null) {
    const cartItem = {
      id: product.id,
      title: variant ? `${product.title} (${variant})` : product.title,
      price: product.price,
      image_url: product.image_url,
      variant: variant,
      qty: 1
    };

    // Check if item with same id and variant exists
    const existingIndex = cart.findIndex(item => 
      item.id === cartItem.id && item.variant === cartItem.variant
    );

    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push(cartItem);
    }

    save();
    updateCartCount();
    dispatchCartEvent('item_added', cartItem);
    return cartItem;
  }

  /**
   * Remove item from cart by index
   * @param {number} index - Index in cart array
   */
  function removeItem(index) {
    if (index >= 0 && index < cart.length) {
      const removed = cart.splice(index, 1)[0];
      save();
      updateCartCount();
      dispatchCartEvent('item_removed', removed);
    }
  }

  /**
   * Update item quantity
   * @param {number} index - Index in cart array
   * @param {number} qty - New quantity
   */
  function updateQuantity(index, qty) {
    if (index >= 0 && index < cart.length) {
      cart[index].qty = Math.max(1, qty);
      save();
      updateCartCount();
      dispatchCartEvent('quantity_updated', cart[index]);
    }
  }

  /**
   * Clear entire cart
   */
  function clear() {
    cart = [];
    save();
    updateCartCount();
    dispatchCartEvent('cart_cleared', null);
  }

  /**
   * Get cart items
   * @returns {Array} Cart items
   */
  function getItems() {
    return [...cart];
  }

  /**
   * Get total item count
   * @returns {number} Total items in cart
   */
  function getItemCount() {
    return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  /**
   * Get total price
   * @returns {number} Total price in KES
   */
  function getTotal() {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
  }

  /**
   * Update cart count badge in UI
   */
  function updateCartCount() {
    const badges = document.querySelectorAll('#cartCount, .cart-count');
    const count = getItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    });
  }

  /**
   * Dispatch custom event for cart changes
   * @param {string} action - Action type
   * @param {Object} data - Associated data
   */
  function dispatchCartEvent(action, data) {
    const event = new CustomEvent('cart:' + action, { detail: data });
    document.dispatchEvent(event);
  }

  /**
   * Render cart drawer UI
   */
  function renderCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;

    const itemsContainer = drawer.querySelector('#cartItems');
    const totalEl = drawer.querySelector('#cartTotal');
    
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      itemsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
      if (totalEl) totalEl.textContent = '0';
      return;
    }

    let total = 0;
    cart.forEach((item, idx) => {
      const itemTotal = (Number(item.price) || 0) * (item.qty || 1);
      total += itemTotal;

      const row = document.createElement('div');
      row.className = 'flex gap-2 items-center border-b pb-3';
      row.innerHTML = `
        <img src="${SharkimUtils.escapeHtml(item.image_url)}" alt="${SharkimUtils.escapeHtml(item.title)}" class="w-14 h-14 object-contain rounded">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">${SharkimUtils.escapeHtml(item.title)}</p>
          <p class="text-xs text-gray-600">Ksh ${Number(item.price).toLocaleString()} × ${item.qty || 1}</p>
        </div>
        <button class="text-red-500 hover:text-red-700 remove-btn" data-index="${idx}" aria-label="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 7V5a2 2 0 114 0v2" />
          </svg>
        </button>
      `;
      itemsContainer.appendChild(row);
    });

    if (totalEl) totalEl.textContent = total.toLocaleString();

    // Add remove handlers
    drawer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        removeItem(index);
        renderCartDrawer();
      });
    });
  }

  /**
   * Open cart drawer
   */
  function openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      renderCartDrawer();
      drawer.classList.remove('hidden');
    }
  }

  /**
   * Close cart drawer
   */
  function closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.classList.add('hidden');
    }
  }

  /**
   * Initialize cart drawer UI
   */
  function initCartDrawer() {
    if (document.getElementById('cartDrawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.className = 'fixed top-0 right-0 w-80 max-w-full h-full bg-white shadow-lg p-4 hidden z-50';
    drawer.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold">Your Cart</h2>
        <button id="cartClose" class="text-gray-500 hover:text-gray-700" aria-label="Close cart">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div id="cartItems" class="space-y-3 max-h-[60vh] overflow-y-auto"></div>
      <div class="mt-4 border-t pt-3">
        <div class="flex justify-between items-center">
          <p class="font-bold">Total:</p>
          <p class="font-bold text-xl">Ksh <span id="cartTotal">0</span></p>
        </div>
        <div class="flex gap-2 mt-3">
          <a href="checkout.html?cart=cart" class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium text-center">
            Buy Now
          </a>
          <button id="cartWhatsApp" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium">
            WhatsApp
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    // Event listeners
    document.getElementById('cartClose').addEventListener('click', closeDrawer);
    document.getElementById('cartWhatsApp').addEventListener('click', checkoutWhatsApp);

    // Close on overlay click
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) closeDrawer();
    });
  }

  /**
   * Checkout via WhatsApp
   */
  function checkoutWhatsApp() {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    let msg = '🛒 *New Order from Sharkim Traders*\n\n';
    let total = 0;
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.title} - Ksh ${Number(item.price).toLocaleString()} × ${item.qty || 1}\n`;
      total += (Number(item.price) || 0) * (item.qty || 1);
    });
    msg += `\n----------------------\n💰 *Total: Ksh ${total.toLocaleString()}*\n\n`;
    msg += '📍 Please confirm delivery details.';

    window.open(`https://wa.me/${SHARKIM_CONFIG.contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  /**
   * Initialize cart button
   */
  function initCartButton() {
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', openDrawer);
    }
  }

  /**
   * Create a product card element
   * @param {Object} product - Product data
   * @returns {HTMLElement} Product card element
   */
  function createProductCard(product) {
    const discount = calculateDiscount(product.original_price, product.price);
    const sanitizedId = SharkimUtils.sanitizeId(product.id || product.title);
    
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden';
    card.setAttribute('data-product-id', product.id);
    card.innerHTML = `
      <a href="product.html?id=${encodeURIComponent(product.id)}" class="block">
        <div class="p-4 bg-white">
          <img src="${SharkimUtils.escapeHtml(product.image_url)}" alt="${SharkimUtils.escapeHtml(product.title)}" class="h-40 w-full object-contain mx-auto">
        </div>
      </a>
      <div class="p-4">
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="block">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 h-10 mb-2">${SharkimUtils.escapeHtml(product.title)}</h3>
        </a>
        <div class="flex items-center gap-2 mb-3">
          ${product.original_price ? `<span class="text-xs text-gray-500 line-through">Ksh ${Number(product.original_price).toLocaleString()}</span>` : ''}
          <span class="text-red-600 font-bold">Ksh ${Number(product.price).toLocaleString()}</span>
        </div>
        ${discount > 0 ? `<span class="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mb-3">${discount}% OFF</span>` : ''}
        <div class="flex flex-col gap-2">
          <a href="checkout.html?id=${encodeURIComponent(product.id)}" class="w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm btn-buy-now" data-product-id="${SharkimUtils.escapeHtml(product.id)}">
            Buy Now
          </a>
          <button class="w-full flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" data-whatsapp data-id="${SharkimUtils.escapeHtml(product.id)}" data-title="${SharkimUtils.escapeHtml(product.title)}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 32 32" fill="currentColor"><path d="M16 .5C7.6.5.5 7.6.5 16c0 2.8.7 5.5 2.2 7.9L0 32l8.3-2.7c2.3 1.3 5 2 7.7 2 8.4 0 15.5-7.1 15.5-15.5S24.4.5 16 .5zM16 29c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.9 1.6 1.6-4.8-.3-.5C3.6 21 3 18.6 3 16 3 9.4 9.4 3 16 3s13 6.4 13 13-6.4 13-13 13zm7.3-9.8c-.4-.2-2.3-1.1-2.6-1.2s-.6-.2-.8.2c-.2.4-1 1.2-1.2 1.4s-.4.3-.8.1c-.4-.2-1.6-.6-3-2-1.1-1.1-1.9-2.3-2.1-2.7s0-.6.2-.8.4-.4.6-.6c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7s-.8-2-1.1-2.8c-.3-.8-.6-.7-.8-.7h-.7c-.2 0-.7.1-1.1.5s-1.4 1.4-1.4 3.4 1.4 3.9 1.6 4.1c.2.2 2.7 4.2 6.5 5.9.9.4 1.7.7 2.2.9.9.3 1.6.3 2.2.2.7-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>
            WhatsApp
          </button>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Calculate discount percentage
   */
  function calculateDiscount(original, current) {
    if (!original || !current || original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    init();
    initCartDrawer();
    initCartButton();
  });

  // Expose public API
  window.SharkimCart = {
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getItems,
    getItemCount,
    getTotal,
    openDrawer,
    closeDrawer,
    renderCartDrawer,
    createProductCard,
    init
  };
})();