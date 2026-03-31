/**
 * Sharkim Traders - Shop Page Module
 * Handles product filtering, sorting, and display
 * Uses sanitized IDs for all DOM operations
 */

(function() {
  'use strict';

  // DOM Elements
  const fSearch = document.getElementById('fSearch');
  const fMain = document.getElementById('fMain');
  const fSub = document.getElementById('fSub');
  const brandBox = document.getElementById('brandBox');
  const fSort = document.getElementById('fSort');
  const countEl = document.getElementById('count');
  const grid = document.getElementById('grid');
  const listTitle = document.getElementById('listTitle');
  const applyBtn = document.getElementById('applyBtn');
  const clearBtn = document.getElementById('clearBtn');

  // State
  let allProducts = [];
  let filteredProducts = [];

  /**
   * Initialize page
   */
  async function init() {
    initFiltersFromQS();
    await fetchAllProducts();
    initEventListeners();
  }

  /**
   * Initialize filters from URL query string
   */
  function initFiltersFromQS() {
    const params = SharkimUtils.getUrlParams();
    
    if (fSearch) fSearch.value = params.get('q') || '';
    
    const main = params.get('main') || '';
    populateMainCategories(main);
    
    const sub = params.get('sub') || '';
    populateSubcategories(main, sub);
    
    const sort = params.get('sort') || '';
    if (fSort) fSort.value = sort;
    
    const price = params.get('price');
    if (price) {
      const radio = document.querySelector(`input[name="price"][value="${price}"]`);
      if (radio) radio.checked = true;
    }
  }

  /**
   * Populate main category dropdown
   */
  function populateMainCategories(selected = '') {
    if (!fMain) return;
    const categories = window.MAIN_CATEGORIES || [];
    fMain.innerHTML = '<option value="">All Categories</option>' + 
      categories.map(c => `<option ${selected === c ? 'selected' : ''} value="${SharkimUtils.escapeHtml(c)}">${SharkimUtils.escapeHtml(c)}</option>`).join('');
  }

  /**
   * Populate subcategory dropdown
   */
  function populateSubcategories(main, selected = '') {
    if (!fSub) return;
    const subs = main ? (window.getSubcategories ? window.getSubcategories(main) : []) : [];
    
    if (subs.length === 0) {
      fSub.innerHTML = '<option value="">All Subcategories</option>';
      fSub.disabled = true;
      return;
    }
    
    fSub.innerHTML = '<option value="">All Subcategories</option>' + 
      subs.map(s => `<option ${selected === s ? 'selected' : ''} value="${SharkimUtils.escapeHtml(s)}">${SharkimUtils.escapeHtml(s)}</option>`).join('');
    fSub.disabled = false;
  }

  /**
   * Get unique brands from product list
   */
  function getUniqueBrands(products) {
    return Array.from(new Set(products.map(p => (p.brand || '').trim()).filter(Boolean))).sort();
  }

  /**
   * Render brand checkboxes
   */
  function renderBrands(products) {
    if (!brandBox) return;
    const brands = getUniqueBrands(products);
    const params = SharkimUtils.getUrlParams();
    const activeBrands = new Set((params.get('brands') || '').split(',').filter(Boolean));
    
    brandBox.innerHTML = brands.map(b => `
      <label class="flex items-center gap-2">
        <input type="checkbox" value="${SharkimUtils.escapeHtml(b)}" ${activeBrands.has(b) ? 'checked' : ''}>
        ${SharkimUtils.escapeHtml(b)}
      </label>
    `).join('');
  }

  /**
   * Fetch all products from Supabase
   */
  async function fetchAllProducts() {
    try {
      allProducts = await SharkimSupabase.fetchProducts({ limit: 1000 });
      filterAndRender();
    } catch (error) {
      console.error('Error fetching products:', error);
      if (grid) grid.innerHTML = '<p class="text-gray-600">Unable to load products. Please try again later.</p>';
    }
  }

  /**
   * Filter and render products based on current filters
   */
  function filterAndRender() {
    const params = SharkimUtils.getUrlParams();
    const q = (params.get('q') || '').toLowerCase();
    const main = params.get('main') || '';
    const sub = params.get('sub') || '';
    const sort = params.get('sort') || '';
    const price = params.get('price') || '';
    const brandParam = (params.get('brands') || '').split(',').filter(Boolean);

    filteredProducts = allProducts.filter(item => {
      // Search filter
      if (q && !(`${item.title} ${item.category} ${item.subcategory} ${item.brand || ''}`.toLowerCase().includes(q))) {
        return false;
      }
      
      // Category filter
      if (main && (item.category !== main && item.main_category !== main)) {
        return false;
      }
      
      // Subcategory filter
      if (sub && item.subcategory !== sub) {
        return false;
      }
      
      // Brand filter
      if (brandParam.length && !brandParam.includes((item.brand || '').trim())) {
        return false;
      }
      
      // Price filter
      if (price) {
        const [min, max] = price.split('-').map(Number);
        const productPrice = Number(item.price) || 0;
        if (productPrice < min || productPrice > max) {
          return false;
        }
      }
      
      return true;
    });

    // Sorting
    if (sort === 'price_asc') {
      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price_desc') {
      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'newest') {
      filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    renderProducts();
    renderBrands(filteredProducts.length ? filteredProducts : allProducts);
  }

  /**
   * Render products to grid
   */
  function renderProducts() {
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
      grid.innerHTML = '<p class="text-gray-600 col-span-full">No products found.</p>';
      if (countEl) countEl.textContent = '0';
      return;
    }

    filteredProducts.forEach(product => {
      const card = SharkimCart.createProductCard(product);
      grid.appendChild(card);
    });

    if (countEl) countEl.textContent = filteredProducts.length;
    if (listTitle) {
      const params = SharkimUtils.getUrlParams();
      const main = params.get('main');
      listTitle.textContent = main || 'Our Shop';
    }
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Main category change
    if (fMain) {
      fMain.addEventListener('change', () => {
        const main = fMain.value;
        populateSubcategories(main, '');
        const params = SharkimUtils.getUrlParams();
        params.set('main', main);
        params.delete('sub');
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      });
    }

    // Subcategory change
    if (fSub) {
      fSub.addEventListener('change', () => {
        const params = SharkimUtils.getUrlParams();
        if (fSub.value) {
          params.set('sub', fSub.value);
        } else {
          params.delete('sub');
        }
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      });
    }

    // Apply button
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const params = SharkimUtils.getUrlParams();
        
        // Search
        const q = (fSearch?.value || '').trim();
        if (q) params.set('q', q); else params.delete('q');
        
        // Sort
        if (fSort?.value) params.set('sort', fSort.value); else params.delete('sort');
        
        // Price
        const priceRadio = document.querySelector('input[name="price"]:checked');
        if (priceRadio) params.set('price', priceRadio.value); else params.delete('price');
        
        // Brands
        const selectedBrands = Array.from(brandBox?.querySelectorAll('input[type="checkbox"]:checked') || [])
          .map(cb => cb.value);
        if (selectedBrands.length) {
          params.set('brands', selectedBrands.join(','));
        } else {
          params.delete('brands');
        }
        
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      });
    }

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const params = new URLSearchParams();
        SharkimUtils.setUrlParams(params);
        
        if (fSearch) fSearch.value = '';
        populateMainCategories('');
        populateSubcategories('', '');
        document.querySelectorAll('input[name="price"]').forEach(r => r.checked = false);
        if (fSort) fSort.value = '';
        
        fetchAllProducts();
      });
    }

    // Search input (debounced)
    if (fSearch) {
      fSearch.addEventListener('input', SharkimUtils.debounce(() => {
        const params = SharkimUtils.getUrlParams();
        const q = (fSearch.value || '').trim();
        if (q) params.set('q', q); else params.delete('q');
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      }, 500));
    }

    // Sort change
    if (fSort) {
      fSort.addEventListener('change', () => {
        const params = SharkimUtils.getUrlParams();
        if (fSort.value) params.set('sort', fSort.value); else params.delete('sort');
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      });
    }

    // Price radio change
    document.querySelectorAll('input[name="price"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const params = SharkimUtils.getUrlParams();
        const checked = document.querySelector('input[name="price"]:checked');
        if (checked) params.set('price', checked.value); else params.delete('price');
        SharkimUtils.setUrlParams(params);
        filterAndRender();
      });
    });

    // WhatsApp button clicks (delegated)
    document.addEventListener('click', (e) => {
      const whatsappBtn = e.target.closest('[data-whatsapp]');
      if (whatsappBtn) {
        e.preventDefault();
        const title = whatsappBtn.dataset.title;
        const phone = SHARKIM_CONFIG.contact.whatsapp;
        const message = encodeURIComponent(`I'm interested in: ${title}`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      }
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();