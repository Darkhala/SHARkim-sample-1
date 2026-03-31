/**
 * Sharkim Traders - UI Module
 * Handles standardized navbar, footer, and common UI components
 */

(function() {
  'use strict';

  /**
   * Create standardized navbar HTML
   * @returns {string} Navbar HTML
   */
  function createNavbar() {
    return `
<!-- TOP CONTACT BAR -->
<div class="w-full bg-black text-gray-300 text-xs py-2">
  <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
    </div>
    <div class="flex items-center gap-4">
      <a href="https://wa.me/254704843554" class="flex items-center gap-1 hover:text-yellow-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 32 32" fill="currentColor"><path d="M16 .5C7.6.5.5 7.6.5 16c0 2.8.7 5.5 2.2 7.9L0 32l8.3-2.7c2.3 1.3 5 2 7.7 2 8.4 0 15.5-7.1 15.5-15.5S24.4.5 16 .5zM16 29c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.9 1.6 1.6-4.8-.3-.5C3.6 21 3 18.6 3 16 3 9.4 9.4 3 16 3s13 6.4 13 13-6.4 13-13 13zm7.3-9.8c-.4-.2-2.3-1.1-2.6-1.2s-.6-.2-.8.2c-.2.4-1 1.2-1.2 1.4s-.4.3-.8.1c-.4-.2-1.6-.6-3-2-1.1-1.1-1.9-2.3-2.1-2.7s0-.6.2-.8.4-.4.6-.6c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7s-.8-2-1.1-2.8c-.3-.8-.6-.7-.8-.7h-.7c-.2 0-.7.1-1.1.5s-1.4 1.4-1.4 3.4 1.4 3.9 1.6 4.1c.2.2 2.7 4.2 6.5 5.9.9.4 1.7.7 2.2.9.9.3 1.6.3 2.2.2.7-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>
        +254 704 843 554
      </a>
      <a href="mailto:sharkimtraders97@gmail.com" class="hover:text-yellow-400 transition-colors">sharkimtraders97@gmail.com</a>
    </div>
  </div>
</div>

<!-- MAIN HEADER - White background for standardization -->
<header class="bg-white text-gray-900 shadow-sm sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 py-3">
    <!-- Logo and Cart Row -->
    <div class="flex items-center justify-between mb-3">
      <a href="index.html" class="flex items-center gap-2">
        <img src="images/sharkim_gold_logo.png" alt="Sharkim Traders Logo" class="h-12 w-auto">
      </a>
      <button id="cartBtn" class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h-2l-1 2H1v2h2l3.6 7.6-1.4 2.4c-.2.3-.2.8 0 1.2.2.4.6.6 1 .6h12v-2H7.4c-.1 0-.2 0-.2-.1l.9-1.5h7.9c.4 0 .7-.2.9-.5l3.6-6.5c.2-.4.1-.8 0-1.1-.2-.3-.5-.5-.9-.5H6.2L5.3 4H7zm0 16c-1.1 0-2 .9-2 2s.9 2 2 2c1.2 0 2-.9 2-2s-.8-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2c1.2 0 2-.9 2-2s-.9-2-2-2z"/></svg>
        Cart
        <span id="cartCount" class="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">0</span>
      </button>
    </div>

    <!-- Navigation - White background with dark text -->
    <nav>
      <ul class="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
        <li>
          <a href="index.html" class="flex items-center gap-1 text-gray-700 hover:text-amber-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"/></svg>
            Home
          </a>
        </li>
        <li>
          <a href="shop.html" class="flex items-center gap-1 text-gray-700 hover:text-amber-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h-2l-1 2H1v2h2l3.6 7.6-1.4 2.4c-.2.3-.2.8 0 1.2.2.4.6.6 1 .6h12v-2H7.4c-.1 0-.2 0-.2-.1l.9-1.5h7.9c.4 0 .7-.2.9-.5l3.6-6.5c.2-.4.1-.8 0-1.1-.2-.3-.5-.5-.9-.5H6.2L5.3 4H7z"/></svg>
            Shop
          </a>
        </li>
        <li>
          <a href="about.html" class="flex items-center gap-1 text-gray-700 hover:text-amber-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            About
          </a>
        </li>
        <li>
          <a href="faq.html" class="flex items-center gap-1 text-gray-700 hover:text-amber-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-2h2v2zm2.07-7.75c-.9.65-1.07 1.09-1.07 1.75h-2c0-1.6 1.04-2.45 1.86-3.03.74-.51 1.14-.85 1.14-1.47 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9c0-1.93 1.57-3.5 3.5-3.5S16 4.57 16 6.5c0 1.55-1.15 2.3-1.93 2.75z"/></svg>
            FAQ
          </a>
        </li>
        <li>
          <a href="contact.html" class="flex items-center gap-1 text-gray-700 hover:text-amber-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8V7l-3 2-2-1-4 2-4-2-4 2v10h20V8zM5 17v-6l3-1.5 4 2 4-2 3 1.5V17H5zm7-11l4 2 5-3-9-4-9 4 5 3 4-2z"/></svg>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  </div>
</header>`;
  }

  /**
   * Create standardized footer HTML
   * @returns {string} Footer HTML
   */
  function createFooter() {
    return `
<!-- Footer Section -->
<footer class="bg-black text-gray-300 mt-16">
  <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
    <div>
      <img src="images/sharkim_gold_logo.png" alt="Sharkim Traders Logo" class="h-12 mb-4">
      <p class="mb-2">WhatsApp: <a href="https://wa.me/254704843554" class="text-amber-500 hover:text-amber-400">+254 704 843 554</a></p>
      <p class="mb-2">Call: <a href="tel:+254704843554" class="text-white hover:text-amber-400">+254 704 843 554</a></p>
      <p class="mb-2">Email: <a href="mailto:sharkimtraders97@gmail.com" class="text-amber-500 hover:text-amber-400">sharkimtraders97@gmail.com</a></p>
      <p class="text-sm text-gray-500">Hours: 8:30AM - 6:30PM</p>
    </div>
    <div>
      <h3 class="text-lg font-semibold mb-4 text-white">Quick Links</h3>
      <ul class="space-y-2">
        <li><a href="index.html" class="hover:text-amber-500 transition-colors">Home</a></li>
        <li><a href="shop.html" class="hover:text-amber-500 transition-colors">Shop</a></li>
        <li><a href="about.html" class="hover:text-amber-500 transition-colors">About Us</a></li>
        <li><a href="faq.html" class="hover:text-amber-500 transition-colors">FAQ</a></li>
        <li><a href="contact.html" class="hover:text-amber-500 transition-colors">Contact</a></li>
      </ul>
    </div>
    <div>
      <h3 class="text-lg font-semibold mb-4 text-white">Policies</h3>
      <ul class="space-y-2">
        <li><a href="privacy.html" class="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
        <li><a href="terms.html" class="hover:text-amber-500 transition-colors">Terms of Service</a></li>
        <li><a href="return-policy.html" class="hover:text-amber-500 transition-colors">Return Policy</a></li>
      </ul>
    </div>
    <div>
      <h3 class="text-lg font-semibold mb-4 text-white">Payments</h3>
      <div class="flex items-center gap-3">
        <img src="images/mpesa1.png" alt="M-PESA" class="h-8">
      </div>
      <p class="text-sm text-gray-500 mt-2">Cash on Delivery Available</p>
    </div>
  </div>
  <div class="border-t border-gray-800 text-center py-4">
    <p class="text-sm text-gray-500">&copy; 2025 Sharkim Traders. All rights reserved.</p>
  </div>
</footer>`;
  }

  /**
   * Initialize standardized UI components
   * This function can be called on pages that want to use the shared navbar/footer
   */
  function init() {
    // Auto-inject navbar if there's a placeholder
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
      navbarPlaceholder.innerHTML = createNavbar();
    }

    // Auto-inject footer if there's a placeholder
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = createFooter();
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  // Expose public API
  window.SharkimUI = {
    createNavbar,
    createFooter,
    init
  };
})();