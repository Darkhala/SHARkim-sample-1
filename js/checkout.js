/**
 * Sharkim Traders - Checkout Module
 * Handles checkout page functionality including URL parameter parsing
 * and order processing
 */

(function() {
  'use strict';

  // State
  let checkoutItems = [];
  let selectedProduct = null;

  /**
   * Parse URL parameters
   */
  function getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Load cart from URL parameter (base64 encoded)
   */
  function loadCartFromUrl() {
    const params = getUrlParams();
    const cartParam = params.get('cart');
    
    if (!cartParam) return false;

    try {
      const decoded = atob(cartParam);
      checkoutItems = JSON.parse(decoded);
      return true;
    } catch (e) {
      console.error('Failed to parse cart from URL:', e);
      return false;
    }
  }

  /**
   * Load single product from URL parameter
   */
  async function loadProductFromUrl() {
    const params = getUrlParams();
    const productId = params.get('id');
    
    if (!productId) return false;

    try {
      const response = await fetch(`${SHARKIM_CONFIG.supabase.url}/rest/v1/Products?id=eq.${productId}&select=*`, {
        headers: {
          'apikey': SHARKIM_CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${SHARKIM_CONFIG.supabase.anonKey}`
        }
      });

      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      if (data && data.length > 0) {
        selectedProduct = data[0];
        checkoutItems = [{
          id: selectedProduct.id,
          title: selectedProduct.title,
          price: selectedProduct.price,
          image_url: selectedProduct.image_url,
          qty: 1
        }];
        return true;
      }
    } catch (e) {
      console.error('Failed to load product:', e);
    }
    return false;
  }

  /**
   * Render checkout items
   */
  function renderItems() {
    const container = document.getElementById('checkoutItems');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (!container) return;

    container.innerHTML = '';

    if (checkoutItems.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 mb-4">Your cart is empty</p>
          <a href="shop.html" class="text-red-600 hover:underline">Continue Shopping</a>
        </div>
      `;
      if (totalEl) totalEl.textContent = '0';
      return;
    }

    let total = 0;
    checkoutItems.forEach((item, index) => {
      const itemTotal = (Number(item.price) || 0) * (item.qty || 1);
      total += itemTotal;

      const row = document.createElement('div');
      row.className = 'flex items-center gap-4 py-4 border-b';
      row.innerHTML = `
        <img src="${item.image_url}" alt="${item.title}" class="w-20 h-20 object-contain rounded border">
        <div class="flex-1">
          <h3 class="font-medium">${item.title}</h3>
          <p class="text-sm text-gray-600">Price: Ksh ${Number(item.price).toLocaleString()}</p>
          <p class="text-sm text-gray-600">Quantity: ${item.qty || 1}</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg">Ksh ${itemTotal.toLocaleString()}</p>
          <button class="text-red-500 text-sm hover:underline mt-1 remove-item" data-index="${index}">Remove</button>
        </div>
      `;
      container.appendChild(row);
    });

    if (totalEl) totalEl.textContent = total.toLocaleString();

    // Add remove handlers
    container.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        checkoutItems.splice(index, 1);
        
        if (checkoutItems.length === 0) {
          // Redirect back to shop if cart is empty
          window.location.href = 'shop.html';
        } else {
          renderItems();
        }
      });
    });
  }

  /**
   * Initialize form handlers
   */
  function initFormHandlers() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (checkoutItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Gather form data
      const formData = {
        name: document.getElementById('customerName')?.value?.trim(),
        phone: document.getElementById('customerPhone')?.value?.trim(),
        county: document.getElementById('customerCounty')?.value?.trim(),
        town: document.getElementById('customerTown')?.value?.trim(),
        address: document.getElementById('customerAddress')?.value?.trim(),
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value
      };

      // Validate required fields
      if (!formData.name || !formData.phone || !formData.address) {
        alert('Please fill in all required fields (name, phone, address)');
        return;
      }

      // Process order
      await processOrder(formData);
    });
  }

  /**
   * Process order
   */
  async function processOrder(formData) {
    const total = SharkimCart ? SharkimCart.getTotal() : checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
    
    const order = {
      id: 'ORD-' + Date.now(),
      created_at: new Date().toISOString(),
      items: checkoutItems,
      customer: formData,
      total: total
    };

    // Check if PesaPal payment is selected
    if (formData.paymentMethod === 'pesapal') {
      await processPesapalPayment(order, formData);
      return;
    }

    // For other payment methods (COD, M-Pesa), use standard flow
    // Try API first
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        // Success - clear cart and redirect
        if (localStorage) localStorage.removeItem('sharkim_cart');
        window.location.href = `order-confirmation.html?order=${encodeURIComponent(order.id)}`;
        return;
      }
    } catch (e) {
      // API failed, use fallback
    }

    // Fallback: Send via email and WhatsApp
    await sendOrderFallback(order);
  }

  /**
   * Process PesaPal payment
   */
  async function processPesapalPayment(order, formData) {
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    
    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Processing...';
    }

    try {
      // Check if PesaPal is available
      if (!window.SharkimPesapal || !window.SharkimPesapal.isAvailable) {
        throw new Error('PesaPal payment is not available. Please try another payment method.');
      }

      // Track begin checkout event
      if (window.SharkimAnalytics && window.adsConsent) {
        window.SharkimAnalytics.trackBeginCheckout(checkoutItems, order.total);
      }

      // Prepare checkout data for PesaPal
      const checkoutData = {
        total: order.total,
        items: checkoutItems,
        email: formData.phone.includes('@') ? formData.email || formData.phone : `${formData.name.replace(/\s+/g, '.').toLowerCase()}@email.com`,
        phone: formData.phone.replace(/\D/g, '').startsWith('254') ? formData.phone : `254${formData.phone.replace(/\D/g, '').slice(1)}`,
        name: formData.name,
        address: formData.address,
        town: formData.town,
        county: formData.county
      };

      // Initiate PesaPal payment
      const result = await window.SharkimPesapal.processPayment(checkoutData);

      if (result.success) {
        // Store order data for confirmation page
        sessionStorage.setItem('pesapal_order_data', JSON.stringify(order));
        
        // User will be redirected to PesaPal by the processPayment function
        return;
      } else {
        throw new Error(result.error || 'Failed to initiate PesaPal payment');
      }
    } catch (error) {
      console.error('PesaPal payment error:', error);
      
      // Show error message
      const messageEl = document.getElementById('orderMessage');
      if (messageEl) {
        messageEl.innerHTML = `
          <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mt-4">
            <p class="font-medium">PesaPal Payment Error</p>
            <p class="text-sm mt-1">${error.message}</p>
            <p class="text-sm">Please try again or select another payment method.</p>
          </div>
        `;
      }
    } finally {
      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  }

  /**
   * Send order via email and WhatsApp (fallback)
   */
  async function sendOrderFallback(order) {
    let body = `Order ID: ${order.id}\n`;
    body += `Total: Ksh ${order.total.toLocaleString()}\n\n`;
    body += `Items:\n`;
    order.items.forEach((item, i) => {
      body += `${i + 1}. ${item.title} - Ksh ${Number(item.price).toLocaleString()} × ${item.qty || 1}\n`;
    });
    body += `\nCustomer Details:\n`;
    body += `Name: ${order.customer.name}\n`;
    body += `Phone: ${order.customer.phone}\n`;
    body += `County: ${order.customer.county}\n`;
    body += `Town: ${order.customer.town}\n`;
    body += `Address: ${order.customer.address}\n`;
    body += `Payment: ${order.customer.paymentMethod}\n`;

    // Send email
    const subject = encodeURIComponent('New Order - ' + order.id);
    window.location.href = `mailto:${SHARKIM_CONFIG.contact.email}?subject=${subject}&body=${encodeURIComponent(body)}`;

    // Also open WhatsApp
    setTimeout(() => {
      const waMsg = encodeURIComponent('*New Order*\n' + body);
      window.open(`https://wa.me/${SHARKIM_CONFIG.contact.whatsapp}?text=${waMsg}`, '_blank');
    }, 1000);

    // Clear cart and show confirmation
    if (localStorage) localStorage.removeItem('sharkim_cart');
    
    // Show message
    const messageEl = document.getElementById('orderMessage');
    if (messageEl) {
      messageEl.innerHTML = `
        <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mt-4">
          <p class="font-medium">Order submitted via email/WhatsApp!</p>
          <p class="text-sm mt-1">Order ID: ${order.id}</p>
          <p class="text-sm">We will contact you shortly to confirm delivery.</p>
        </div>
      `;
    }
  }

  /**
   * Initialize page
   */
  async function init() {
    // Try to load cart from URL first
    let hasData = loadCartFromUrl();
    
    // If no cart data, try to load single product
    if (!hasData) {
      hasData = await loadProductFromUrl();
    }

    // If still no data, check localStorage
    if (!hasData && localStorage) {
      try {
        const stored = localStorage.getItem('sharkim_cart');
        if (stored) {
          checkoutItems = JSON.parse(stored);
          hasData = checkoutItems.length > 0;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    renderItems();
    initFormHandlers();
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();