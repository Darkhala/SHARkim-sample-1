/**
 * Sharkim Traders - Analytics Module
 * Handles Google Analytics 4 (GA4) and Meta Pixel tracking
 * Implements enhanced e-commerce tracking
 */

(function() {
  'use strict';

  // Configuration - Replace with actual IDs
  const ANALYTICS_CONFIG = {
    ga4: {
      measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 Measurement ID
      enabled: false // Set to true after adding real ID
    },
    metaPixel: {
      pixelId: 'XXXXXXXXXXXXXXX', // Replace with your Meta Pixel ID
      enabled: false // Set to true after adding real ID
    }
  };

  /**
   * Initialize analytics after consent
   */
  function initAnalytics() {
    // Check for consent
    if (!window.adsConsent) {
      console.log('Analytics: No consent, tracking disabled');
      return;
    }

    // Initialize GA4
    if (ANALYTICS_CONFIG.ga4.enabled && ANALYTICS_CONFIG.ga4.measurementId !== 'G-XXXXXXXXXX') {
      initGA4();
    }

    // Initialize Meta Pixel
    if (ANALYTICS_CONFIG.metaPixel.enabled && ANALYTICS_CONFIG.metaPixel.pixelId !== 'XXXXXXXXXXXXXXX') {
      initMetaPixel();
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  function initGA4() {
    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.ga4.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.ga4.measurementId, {
      send_page_view: true
    });

    console.log('GA4 initialized:', ANALYTICS_CONFIG.ga4.measurementId);
  }

  /**
   * Initialize Meta Pixel
   */
  function initMetaPixel() {
    // Load Meta Pixel
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if(!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      b.parentNode.insertBefore(t, b);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel
    fbq('init', ANALYTICS_CONFIG.metaPixel.pixelId);
    fbq('track', 'PageView');

    console.log('Meta Pixel initialized:', ANALYTICS_CONFIG.metaPixel.pixelId);
  }

  /**
   * Track page view
   */
  function trackPageView(pageTitle, pagePath) {
    if (!window.adsConsent) return;

    if (window.gtag) {
      gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath || window.location.pathname
      });
    }

    if (window.fbq) {
      fbq('track', 'PageView');
    }
  }

  /**
   * Track view item (product page)
   */
  function trackViewItem(product) {
    if (!window.adsConsent || !product) return;

    if (window.gtag) {
      gtag('event', 'view_item', {
        content_type: 'product',
        items: [{
          id: product.id || product.sku,
          name: product.name || product.title,
          price: product.price,
          quantity: 1,
          brand: product.brand,
          category: product.category
        }]
      });
    }

    if (window.fbq) {
      fbq('track', 'ViewContent', {
        content_ids: [product.id || product.sku],
        content_type: 'product',
        content_name: product.name || product.title,
        value: product.price,
        currency: 'KES'
      });
    }
  }

  /**
   * Track add to cart
   */
  function trackAddToCart(product, quantity) {
    if (!window.adsConsent || !product) return;

    quantity = quantity || 1;

    if (window.gtag) {
      gtag('event', 'add_to_cart', {
        content_type: 'product',
        items: [{
          id: product.id || product.sku,
          name: product.name || product.title,
          price: product.price,
          quantity: quantity,
          brand: product.brand,
          category: product.category
        }]
      });
    }

    if (window.fbq) {
      fbq('track', 'AddToCart', {
        content_ids: [product.id || product.sku],
        content_type: 'product',
        content_name: product.name || product.title,
        value: product.price * quantity,
        currency: 'KES',
        num_items: quantity
      });
    }
  }

  /**
   * Track begin checkout
   */
  function trackBeginCheckout(cartItems, total) {
    if (!window.adsConsent || !cartItems) return;

    const items = cartItems.map(item => ({
      id: item.id || item.sku,
      name: item.name || item.title,
      price: item.price,
      quantity: item.quantity || 1,
      brand: item.brand,
      category: item.category
    }));

    if (window.gtag) {
      gtag('event', 'begin_checkout', {
        content_type: 'product',
        value: total,
        currency: 'KES',
        items: items
      });
    }

    if (window.fbq) {
      fbq('track', 'InitiateCheckout', {
        content_ids: cartItems.map(item => item.id || item.sku),
        content_type: 'product',
        num_items: cartItems.length,
        value: total,
        currency: 'KES'
      });
    }
  }

  /**
   * Track purchase
   */
  function trackPurchase(order) {
    if (!window.adsConsent || !order) return;

    const items = (order.items || []).map(item => ({
      id: item.id || item.sku,
      name: item.name || item.title,
      price: item.price,
      quantity: item.quantity || 1,
      brand: item.brand,
      category: item.category
    }));

    if (window.gtag) {
      gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.total,
        currency: 'KES',
        items: items
      });
    }

    if (window.fbq) {
      fbq('track', 'Purchase', {
        content_ids: (order.items || []).map(item => item.id || item.sku),
        content_type: 'product',
        num_items: (order.items || []).length,
        value: order.total,
        currency: 'KES',
        order_id: order.id
      });
    }
  }

  /**
   * Track search
   */
  function trackSearch(query) {
    if (!window.adsConsent || !query) return;

    if (window.gtag) {
      gtag('event', 'search', {
        search_term: query
    });
    }

    if (window.fbq) {
      fbq('track', 'Search', {
        search_string: query
      });
    }
  }

  // Export public API
  window.SharkimAnalytics = {
    init: initAnalytics,
    trackPageView: trackPageView,
    trackViewItem: trackViewItem,
    trackAddToCart: trackAddToCart,
    trackBeginCheckout: trackBeginCheckout,
    trackPurchase: trackPurchase,
    trackSearch: trackSearch,
    config: ANALYTICS_CONFIG
  };

  // Initialize when consent is given
  document.addEventListener('consentGiven', function() {
    initAnalytics();
  });

  // Try to initialize on DOM ready (if consent already given)
  document.addEventListener('DOMContentLoaded', function() {
    if (window.adsConsent) {
      initAnalytics();
    }
  });
})();