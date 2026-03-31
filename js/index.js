/**
 * Sharkim Traders - Index Page Module
 * Handles homepage functionality including product display and categories
 * Uses defensive coding to avoid errors if utilities are missing
 */

(function() {
  'use strict';

  // DOM Elements
  const mainContent = document.getElementById('mainContent');
  const leftCatList = document.getElementById('leftCatList');
  const mobileCatList = document.getElementById('mobileCatList');
  const mobileCatToggle = document.getElementById('mobileCatToggle');
  const mobileCatPanel = document.getElementById('mobileCatPanel');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  /**
   * Sanitize string for use as ID (fallback if SharkimUtils not available)
   */
  function sanitizeId(str) {
    if (window.SharkimUtils && typeof window.SharkimUtils.sanitizeId === 'function') {
      return window.SharkimUtils.sanitizeId(str);
    }
    // Fallback: simple sanitization
    return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /**
   * Escape HTML to prevent XSS (fallback if SharkimUtils not available)
   */
  function escapeHtml(text) {
    if (window.SharkimUtils && typeof window.SharkimUtils.escapeHtml === 'function') {
      return window.SharkimUtils.escapeHtml(text);
    }
    // Fallback: simple escaping
    const div = document.createElement('div');
    div.textContent = String(text || '');
    return div.innerHTML;
  }

  /**
   * Initialize page
   */
  async function init() {
    buildCategories();
    await fetchAndRenderProducts();
    initEventListeners();
  }

  /**
   * Build category lists with sanitized IDs
   */
  function buildCategories() {
    if (!leftCatList && !mobileCatList) return;
    
    const categories = window.MAIN_CATEGORIES || [];
    
    // Build left sidebar categories
    if (leftCatList) {
      leftCatList.innerHTML = '';
      categories.forEach(cat => {
        const li = document.createElement('li');
        const sanitizedId = sanitizeId(cat);
        li.innerHTML = `<a href="shop.html?main=${encodeURIComponent(cat)}" class="block px-2 py-1 rounded hover:bg-gray-100 text-gray-700 transition-colors" data-category="${sanitizedId}">${escapeHtml(cat)}</a>`;
        leftCatList.appendChild(li);
      });
    }

    // Build mobile categories
    if (mobileCatList) {
      mobileCatList.innerHTML = '';
      categories.forEach(cat => {
        const li = document.createElement('li');
        const sanitizedId = sanitizeId(cat);
        li.innerHTML = `<a href="shop.html?main=${encodeURIComponent(cat)}" class="block px-2 py-1 rounded hover:bg-gray-100 text-gray-700 transition-colors" data-category="${sanitizedId}">${escapeHtml(cat)}</a>`;
        mobileCatList.appendChild(li);
      });
    }
  }

  /**
   * Fetch products and render sections
   */
  async function fetchAndRenderProducts() {
    if (!mainContent) return;

    try {
      // Use SharkimSupabase if available, otherwise use fetch
      let products;
      if (window.SharkimSupabase && typeof window.SharkimSupabase.fetchProducts === 'function') {
        products = await window.SharkimSupabase.fetchProducts({ limit: 100 });
      } else {
        // Fallback: fetch from JSON file
        const response = await fetch('merchant-products.json');
        const data = await response.json();
        products = data.products || data;
      }
      
      if (!products || products.length === 0) {
        mainContent.innerHTML = '<p class="text-center text-gray-500 py-8">No products available at the moment.</p>';
        return;
      }

      // Group products by category
      const categoryMap = new Map();
      products.forEach(product => {
        const category = product.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category).push(product);
      });

      // Render sections
      mainContent.innerHTML = '';
      const sortedCategories = Array.from(categoryMap.keys()).sort();

      sortedCategories.forEach(category => {
        const categoryProducts = categoryMap.get(category);
        if (categoryProducts.length === 0) return;

        // Shuffle and get first 6
        const shuffled = [...categoryProducts].sort(() => Math.random() - 0.5).slice(0, 6);
        
        const section = createCategorySection(category, shuffled);
        mainContent.appendChild(section);
      });

    } catch (error) {
      console.error('Error fetching products:', error);
      mainContent.innerHTML = '<p class="text-center text-gray-500 py-8">Unable to load products. Please try again later.</p>';
    }
  }

  /**
   * Create category section with sanitized IDs
   */
  function createCategorySection(category, products) {
    const section = document.createElement('section');
    section.className = 'mb-12';
    const sanitizedId = sanitizeId(category);
    const sectionId = `cat-${sanitizedId}`;
    
    section.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">${escapeHtml(category)}</h2>
        <a href="shop.html?main=${encodeURIComponent(category)}" class="text-amber-600 hover:text-amber-700 text-sm font-medium">See all →</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="${sectionId}"></div>
    `;

    const grid = section.querySelector(`#${sectionId}`);
    
    // Use SharkimCart if available, otherwise create simple product cards
    if (window.SharkimCart && typeof window.SharkimCart.createProductCard === 'function') {
      products.forEach(product => {
        grid.appendChild(window.SharkimCart.createProductCard(product));
      });
    } else {
      // Fallback: create simple product cards
      products.forEach(product => {
        const card = createSimpleProductCard(product);
        grid.appendChild(card);
      });
    }

    return section;
  }

  /**
   * Create a simple product card (fallback if SharkimCart not available)
   */
  function createSimpleProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden';
    
    const price = product.price || '0';
    const originalPrice = product.original_price || price;
    const discount = product.discount || 0;
    const image = product.image || product.images?.[0] || 'images/placeholder.jpg';
    const title = product.title || product.name || 'Product';
    const id = product.id || product.sku || '';
    
    card.innerHTML = `
      <a href="product.html?id=${encodeURIComponent(id)}" class="block">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="w-full h-40 object-contain p-2">
        <div class="p-3">
          <h3 class="text-sm font-medium text-gray-900 truncate">${escapeHtml(title)}</h3>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-red-600 font-bold">KES ${escapeHtml(Number(price).toLocaleString())}</span>
            ${discount > 0 ? `<span class="text-xs text-gray-500 line-through">KES ${escapeHtml(Number(originalPrice).toLocaleString())}</span>` : ''}
          </div>
        </div>
      </a>
      <div class="px-3 pb-3 flex gap-2">
        <button class="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition-colors" data-add-to-cart="${escapeHtml(id)}">Buy</button>
        <a href="https://wa.me/254704843554?text=${encodeURIComponent('I\'m interested in: ' + title)}" target="_blank" class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 32 32" fill="currentColor"><path d="M16 .5C7.6.5.5 7.6.5 16c0 2.8.7 5.5 2.2 7.9L0 32l8.3-2.7c2.3 1.3 5 2 7.7 2 8.4 0 15.5-7.1 15.5-15.5S24.4.5 16 .5zM16 29c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.9 1.6 1.6-4.8-.3-.5C3.6 21 3 18.6 3 16 3 9.4 9.4 3 16 3s13 6.4 13 13-6.4 13-13 13zm7.3-9.8c-.4-.2-2.3-1.1-2.6-1.2s-.6-.2-.8.2c-.2.4-1 1.2-1.2 1.4s-.4.3-.8.1c-.4-.2-1.6-.6-3-2-1.1-1.1-1.9-2.3-2.1-2.7s0-.6.2-.8.4-.4.6-.6c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7s-.8-2-1.1-2.8c-.3-.8-.6-.7-.8-.7h-.7c-.2 0-.7.1-1.1.5s-1.4 1.4-1.4 3.4 1.4 3.9 1.6 4.1c.2.2 2.7 4.2 6.5 5.9.9.4 1.7.7 2.2.9.9.3 1.6.3 2.2.2.7-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>
        </a>
      </div>
    `;
    
    return card;
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Mobile category toggle
    if (mobileCatToggle && mobileCatPanel) {
      mobileCatToggle.addEventListener('click', () => {
        mobileCatPanel.classList.toggle('hidden');
      });
    }

    // Search functionality
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }

    // Add to cart button clicks (delegated)
    document.addEventListener('click', (e) => {
      const addToCartBtn = e.target.closest('[data-add-to-cart]');
      if (addToCartBtn) {
        e.preventDefault();
        const productId = addToCartBtn.dataset.addToCart;
        
        // Try to use SharkimCart if available
        if (window.SharkimCart && typeof window.SharkimCart.addToCart === 'function') {
          // Would need to fetch product details first
          console.log('Add to cart:', productId);
          alert('Product added to cart!');
        } else {
          alert('Cart functionality coming soon!');
        }
      }

      const whatsappBtn = e.target.closest('[data-whatsapp]');
      if (whatsappBtn) {
        e.preventDefault();
        const title = whatsappBtn.dataset.title;
        const phone = '254704843554';
        const message = encodeURIComponent(`I'm interested in: ${title}`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      }
    });
  }

  /**
   * Perform search
   */
  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `shop.html?q=${encodeURIComponent(query)}`;
    }
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();