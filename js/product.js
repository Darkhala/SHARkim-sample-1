/**
 * Sharkim Traders - Product Page Module
 * Handles single product display, variants, cart operations, and related products
 * Uses sanitized IDs for all DOM operations
 */

(function() {
  'use strict';

  // DOM Elements
  const pImg = document.getElementById('pImg');
  const pTitle = document.getElementById('pTitle');
  const pCat = document.getElementById('pCat');
  const pOriginal = document.getElementById('pOriginal');
  const pPrice = document.getElementById('pPrice');
  const pDisc = document.getElementById('pDisc');
  const btnWhats = document.getElementById('btnWhats');
  const btnEmail = document.getElementById('btnEmail');
  const btnCart = document.getElementById('btnCart');
  const descToggle = document.getElementById('descToggle');
  const descText = document.getElementById('descText');
  const pThumbs = document.getElementById('thumbs');
  const featuresList = document.getElementById('featuresList');
  const featuresBox = document.getElementById('featuresBox');
  const variantBox = document.getElementById('variantBox');
  const variantOptions = document.getElementById('variantOptions');
  const relGrid = document.getElementById('relGrid');
  const relMore = document.getElementById('relMore');
  const cartBtn = document.getElementById('cartBtn');
  const cartCountBadge = document.getElementById('cartCount');

  // Breadcrumb elements
  const bcCatWrapper = document.getElementById('bcCatWrapper');
  const bcCatLink = document.getElementById('bcCatLink');
  const bcSubWrapper = document.getElementById('bcSubWrapper');
  const bcSubLink = document.getElementById('bcSubLink');

  /**
   * Get URL query parameters
   */
  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Initialize main image zoom
   */
  function initMainImageZoom() {
    const img = document.getElementById('pImg');
    if (!img) return;
    
    let container = img.closest('.zoom-container');
    if (!container) {
      container = document.createElement('span');
      container.className = 'zoom-container';
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.width = '100%';
      img.parentNode.insertBefore(container, img);
      container.appendChild(img);
    }
    
    let lens = container.querySelector('.zoom-lens');
    if (!lens) {
      lens = document.createElement('span');
      lens.className = 'zoom-lens';
      container.appendChild(lens);
    }
    
    Object.assign(lens.style, {
      position: 'absolute', pointerEvents: 'none', width: '140px', height: '140px', borderRadius: '9999px',
      border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', backgroundRepeat: 'no-repeat',
      backgroundImage: `url(${img.src})`, backgroundSize: '200% 200%', opacity: '0', transition: 'opacity .15s ease'
    });
    
    function updateLensBg() { lens.style.backgroundImage = `url(${img.src})`; }
    img.removeEventListener('load', updateLensBg);
    img.addEventListener('load', updateLensBg);
    
    function move(e) {
      const rect = container.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const x = cx - rect.left;
      const y = cy - rect.top;
      const lx = Math.max(0, Math.min(rect.width, x)) - lens.offsetWidth / 2;
      const ly = Math.max(0, Math.min(rect.height, y)) - lens.offsetHeight / 2;
      lens.style.left = lx + 'px';
      lens.style.top = ly + 'px';
      const px = Math.max(0, Math.min(1, x / rect.width)) * 100;
      const py = Math.max(0, Math.min(1, y / rect.height)) * 100;
      lens.style.backgroundPosition = px + '% ' + py + '%';
    }
    
    function enter() { lens.style.opacity = '1'; }
    function leave() { lens.style.opacity = '0'; }
    
    container.addEventListener('mousemove', move);
    container.addEventListener('mouseenter', enter);
    container.addEventListener('mouseleave', leave);
    container.addEventListener('touchmove', move, { passive: true });
    container.addEventListener('touchstart', enter, { passive: true });
    container.addEventListener('touchend', leave);
  }

  /**
   * Parse features from product data
   */
  function parseFeatures(text) {
    let features = [];
    let desc = text || '';
    const start = desc.indexOf('[FEATURES]');
    const end = desc.indexOf('[/FEATURES]');
    if (start !== -1 && end !== -1 && end > start) {
      const inner = desc.substring(start + 10, end).trim();
      features = inner.split(/\r?\n/).map(s => s.replace(/^[\-•]\s*/, '').trim()).filter(Boolean);
      desc = (desc.slice(0, start) + desc.slice(end + 11)).trim();
    }
    return { features, desc };
  }

  /**
   * Normalize features from product data
   */
  function normalizeFeatures(featuresField, descriptionText) {
    try {
      if (Array.isArray(featuresField)) {
        const list = featuresField.map(s => String(s || '').trim()).filter(Boolean);
        return { features: list, desc: descriptionText };
      }
      if (typeof featuresField === 'string' && featuresField.trim()) {
        const list = featuresField.split(/\r?\n|,|;|•/).map(s => s.replace(/^[\-•]\s*/, '').trim()).filter(Boolean);
        return { features: list, desc: descriptionText };
      }
      return parseFeatures(descriptionText || '');
    } catch {
      return parseFeatures(descriptionText || '');
    }
  }

  /**
   * Render features list
   */
  function renderFeatures(list) {
    if (!featuresBox || !featuresList) return;
    if (!list || list.length === 0) {
      featuresBox.classList.add('hidden');
      return;
    }
    featuresBox.classList.remove('hidden');
    featuresList.innerHTML = list.map(li => `<li>${li}</li>`).join('');
  }

  /**
   * Parse variants from product data
   */
  function parseVariants(prod) {
    // Preferred: explicit variants column [{size:string, price:number}]
    if (Array.isArray(prod.variants)) {
      const arr = prod.variants
        .map(v => ({ size: String(v.size || '').trim(), price: Number(v.price) }))
        .filter(v => v.size && !Number.isNaN(v.price) && v.price > 0);
      if (arr.length) return arr;
    }
    if (typeof prod.variants === 'string' && prod.variants.trim()) {
      try {
        const parsed = JSON.parse(prod.variants);
        if (Array.isArray(parsed)) {
          const arr = parsed
            .map(v => ({ size: String(v.size || '').trim(), price: Number(v.price) }))
            .filter(v => v.size && !Number.isNaN(v.price) && v.price > 0);
          if (arr.length) return arr;
        }
      } catch {}
    }
    
    // Fallbacks: category heuristics or [SIZES] tag without pricing => use base price
    const sizesByCategory = {
      'Mattresses': ['3x6', '3.5x6', '4x6', '5x6', '6x6'],
      'Shoes': ['38', '39', '40', '41', '42', '43', '44', '45'],
      'Shoe': ['38', '39', '40', '41', '42', '43', '44', '45'],
      'Footwear': ['38', '39', '40', '41', '42', '43', '44', '45']
    };
    const main = String(prod.main_category || '').toLowerCase();
    const sub = String(prod.subcategory || '').toLowerCase();
    let sizes = [];
    if (/(mattress|mattresses)/.test(main) || /(mattress|mattresses)/.test(sub)) sizes = sizesByCategory['Mattresses'];
    if (/(shoe|shoes|footwear)/.test(main) || /(shoe|shoes|footwear)/.test(sub)) sizes = sizesByCategory['Shoes'];
    const desc = String(prod.description || '');
    const m = desc.match(/\[SIZES\]([\s\S]*?)\[\/SIZES\]/i);
    if (m) { sizes = m[1].split(/\r?\n|,|;|\s+/).map(s => s.trim()).filter(Boolean); }
    return (sizes || []).map(sz => ({ size: sz, price: Number(prod.price) }));
  }

  /**
   * Setup variants UI
   */
  function setupVariants(prod) {
    const variants = parseVariants(prod);
    if (!variants || variants.length === 0) {
      if (variantBox) variantBox.classList.add('hidden');
      return;
    }
    if (variantBox) variantBox.classList.remove('hidden');
    if (variantOptions) {
      variantOptions.innerHTML = variants.map((v, i) => `
        <label class="inline-flex items-center gap-2 border rounded px-3 py-1 cursor-pointer">
          <input type="radio" name="variant-size" value="${v.size}" data-price="${v.price}" ${i === 0 ? 'checked' : ''} />
          <span>${v.size} <span class="text-xs text-gray-500">(Ksh ${v.price})</span></span>
        </label>
      `).join('');
      
      // Update price text when selecting a variant
      const handler = () => {
        const selected = variantOptions.querySelector('input[name="variant-size"]:checked');
        const pv = selected?.getAttribute('data-price');
        if (pv) pPrice.textContent = `Ksh ${Number(pv)}`;
      };
      variantOptions.addEventListener('change', handler);
      handler();
    }
  }

  /**
   * Get image folder from URL
   */
  function getImageFolderFromUrl(url) {
    try {
      const idx = url.indexOf('/product-images/');
      if (idx === -1) return null;
      const path = url.substring(idx + '/product-images/'.length);
      const parts = path.split('/');
      if (parts.length <= 1) return null;
      parts.pop();
      return parts.join('/') + '/';
    } catch { return null; }
  }

  /**
   * Load thumbnails
   */
  async function loadThumbnails(imageUrl) {
    try {
      const folder = getImageFolderFromUrl(imageUrl);
      if (!folder) return;
      const client = SharkimSupabase.getClient();
      if (!client) return;
      const { data, error } = await client.storage.from('product-images').list(folder, { limit: 50, sortBy: { column: 'name', order: 'asc' } });
      if (error || !Array.isArray(data) || data.length === 0) return;
      pThumbs.innerHTML = '';
      data.filter(f => f.name && !f.name.startsWith('.')).forEach(file => {
        const url = `${SHARKIM_CONFIG.supabase.url}/storage/v1/object/public/product-images/${folder}${file.name}`;
        const a = document.createElement('button');
        a.className = 'border rounded p-1 hover:ring-2 hover:ring-yellow-500';
        a.innerHTML = `<img src="${url}" class="w-16 h-16 object-contain" alt="thumb">`;
        a.addEventListener('click', () => { pImg.src = url; initMainImageZoom(); });
        pThumbs.appendChild(a);
      });
    } catch(e) { /* ignore */ }
  }

  /**
   * Fetch and display product
   */
  async function fetchProduct(id) {
    try {
      const product = await SharkimSupabase.fetchProduct(id);
      
      if (!product) {
        document.getElementById('content').innerHTML = '<p class="p-6">Product not found.</p>';
        return;
      }

      const p = {
        ...product,
        main_category: product.main_category || product.category || 'Uncategorized',
        description: product.description || product.subcategory || ''
      };

      // Display product info
      pImg.src = p.image_url;
      initMainImageZoom();
      loadThumbnails(p.image_url);
      pTitle.textContent = p.title;
      pCat.textContent = `${p.main_category}${p.subcategory ? ' > ' + p.subcategory : ''}${p.brand ? ' • ' + p.brand : ''}`;
      pOriginal.textContent = p.original_price ? `Ksh ${p.original_price}` : '';
      pPrice.textContent = `Ksh ${p.price}`;
      
      const disc = (p.original_price && p.original_price > 0) ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
      if (disc) {
        pDisc.textContent = `${disc}% OFF`;
        pDisc.classList.remove('hidden');
      }

      const { desc: baseDesc, features } = normalizeFeatures(p.features, p.description || '');
      const fullDesc = baseDesc || 'No description available';
      const previewText = fullDesc.length > 220 ? (fullDesc.slice(0, 220) + '...') : fullDesc;
      let expanded = false;
      
      function renderDesc() {
        if (descText) { descText.textContent = expanded ? fullDesc : previewText; }
        if (descToggle) { descToggle.textContent = expanded ? 'Show less' : 'Read more'; }
      }
      
      renderFeatures(features);
      renderDesc();
      descToggle.onclick = () => { expanded = !expanded; renderDesc(); };

      // Update JSON-LD
      updateJSONLD(p);

      // Contact buttons
      btnWhats.href = `https://wa.me/${SHARKIM_CONFIG.contact.whatsapp}?text=${encodeURIComponent('I want ' + p.title)}`;
      btnEmail.href = `mailto:${SHARKIM_CONFIG.contact.email}?subject=${encodeURIComponent('Product Inquiry: ' + p.title)}&body=${encodeURIComponent('I am interested in ' + p.title)}`;

      // Variant support
      setupVariants(p);

      // Add to cart button
      btnCart.onclick = () => {
        const selectedRadio = variantOptions?.querySelector('input[name="variant-size"]:checked');
        const selectedSize = selectedRadio?.value || null;
        const variantPrice = selectedRadio?.getAttribute('data-price');
        const priceForCart = variantPrice ? Number(variantPrice) : p.price;
        const titleWithVariant = selectedSize ? `${p.title} (${selectedSize})` : p.title;
        
        if (window.SharkimCart) {
          window.SharkimCart.addItem({
            id: p.id,
            title: titleWithVariant,
            price: priceForCart,
            image_url: p.image_url,
            variant: selectedSize
          });
          SharkimUtils.showNotification('Added to cart ✅', 'success');
        }
      };

      // Related products link
      relMore.href = `shop.html?main=${encodeURIComponent(p.main_category)}`;

      // Breadcrumbs
      if (bcCatWrapper && p.main_category) {
        bcCatWrapper.classList.remove('hidden');
        bcCatLink.href = `shop.html?main=${encodeURIComponent(p.main_category)}`;
        bcCatLink.textContent = p.main_category;
      }
      if (bcSubWrapper && p.subcategory) {
        bcSubWrapper.classList.remove('hidden');
        bcSubLink.href = `shop.html?main=${encodeURIComponent(p.main_category)}&sub=${encodeURIComponent(p.subcategory)}`;
        bcSubLink.textContent = p.subcategory;
      }

      // Fetch related products
      fetchRelated(p);

    } catch (error) {
      console.error('Error fetching product:', error);
      document.getElementById('content').innerHTML = '<p class="p-6">Error loading product. Please try again later.</p>';
    }
  }

  /**
   * Update JSON-LD structured data
   */
  function updateJSONLD(prod) {
    const jsonData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": prod.title,
      "image": [prod.image_url],
      "description": prod.description || "Available at Sharkim Traders.",
      "sku": String(prod.id),
      "brand": {
        "@type": "Brand",
        "name": prod.brand || "Sharkim Traders"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "KES",
        "price": String(prod.price),
        "availability": "https://schema.org/InStock"
      }
    };

    const el = document.getElementById("product-jsonld");
    if (el) el.textContent = JSON.stringify(jsonData, null, 2);
  }

  /**
   * Fetch related products
   */
  async function fetchRelated(p) {
    try {
      const related = await SharkimSupabase.fetchRelatedProducts(p.id, p.main_category, 12);
      relGrid.innerHTML = '';
      
      (related || []).forEach(item => {
        const el = document.createElement('a');
        el.href = `product.html?id=${encodeURIComponent(item.id)}`;
        el.className = 'bg-white border rounded p-3 shadow hover:shadow-md transition block';
        el.innerHTML = `
          <img src="${item.image_url}" class="h-28 w-full object-contain mb-2" alt="${item.title}">
          <div class="text-sm font-semibold line-clamp-2">${SharkimUtils.escapeHtml(item.title)}</div>
          <div class="text-red-600 font-bold">Ksh ${Number(item.price).toLocaleString()}</div>
        `;
        relGrid.appendChild(el);
      });
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }

  /**
   * Initialize page
   */
  function init() {
    const params = getQueryParams();
    const id = params.get('id');
    if (id) {
      fetchProduct(id);
    } else {
      document.getElementById('content').innerHTML = '<p class="p-6">No product ID provided.</p>';
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();