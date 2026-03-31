/**
 * Sharkim Traders - Enhanced Cookie Consent Module
 * GDPR-compliant granular consent management
 * Handles essential, analytics, and marketing cookies
 */

(function() {
  'use strict';

  // Consent categories
  const CONSENT_CATEGORIES = {
    ESSENTIAL: 'essential',
    ANALYTICS: 'analytics',
    MARKETING: 'marketing'
  };

  // Default consent state
  let consentState = {
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  };

  // Cookie name and duration
  const CONSENT_COOKIE = 'sharkim_consent';
  const CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds

  /**
   * Get cookie value by name
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * Set cookie
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Load consent state from cookie
   */
  function loadConsent() {
    const savedConsent = getCookie(CONSENT_COOKIE);
    if (savedConsent) {
      try {
        consentState = JSON.parse(savedConsent);
        // Essential is always true
        consentState.essential = true;
      } catch (e) {
        console.error('Failed to parse consent cookie:', e);
      }
    }
    return consentState;
  }

  /**
   * Save consent state to cookie
   */
  function saveConsent() {
    setCookie(CONSENT_COOKIE, JSON.stringify(consentState), 365);
    logConsentAction('consent_saved', consentState);
  }

  /**
   * Log consent action (for compliance)
   */
  function logConsentAction(action, state) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      state: state,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for compliance records
    const logs = JSON.parse(localStorage.getItem('consent_logs') || '[]');
    logs.push(logEntry);
    // Keep only last 100 entries
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('consent_logs', JSON.stringify(logs));

    console.log('Consent Log:', logEntry);
  }

  /**
   * Check if consent is given for a category
   */
  function hasConsent(category) {
    return consentState[category] === true;
  }

  /**
   * Set consent for a category
   */
  function setConsent(category, value) {
    if (category === CONSENT_CATEGORIES.ESSENTIAL) {
      // Essential cookies cannot be disabled
      consentState.essential = true;
      return;
    }
    consentState[category] = value === true;
    saveConsent();
    updateConsentUI();

    // Trigger analytics initialization if analytics consent given
    if (category === CONSENT_CATEGORIES.ANALYTICS && value) {
      document.dispatchEvent(new CustomEvent('consentGiven', { 
        detail: { category: CONSENT_CATEGORIES.ANALYTICS } 
      }));
    }

    // Trigger marketing initialization if marketing consent given
    if (category === CONSENT_CATEGORIES.MARKETING && value) {
      document.dispatchEvent(new CustomEvent('consentGiven', { 
        detail: { category: CONSENT_CATEGORIES.MARKETING } 
      }));
    }
  }

  /**
   * Withdraw all non-essential consent
   */
  function withdrawConsent() {
    consentState.analytics = false;
    consentState.marketing = false;
    saveConsent();
    updateConsentUI();
    showBanner(); // Show banner again to allow re-consent
  }

  /**
   * Accept all cookies
   */
  function acceptAll() {
    consentState.analytics = true;
    consentState.marketing = true;
    saveConsent();
    hideBanner();
    document.dispatchEvent(new CustomEvent('consentGiven', { 
      detail: { category: 'all' } 
    }));
  }

  /**
   * Reject all non-essential cookies
   */
  function rejectAll() {
    consentState.analytics = false;
    consentState.marketing = false;
    saveConsent();
    hideBanner();
  }

  /**
   * Create consent banner HTML
   */
  function createBannerHTML() {
    return `
      <div id="cookieConsentBanner" style="
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99999;
        background: #1a1a2e;
        color: #fff;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        max-height: 90vh;
        overflow-y: auto;
      ">
        <div style="max-width: 1200px; margin: 0 auto; padding: 24px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Cookie Preferences</h3>
            <button id="consentCloseBtn" style="
              background: none;
              border: none;
              color: #fff;
              font-size: 24px;
              cursor: pointer;
              padding: 4px 8px;
              line-height: 1;
            ">&times;</button>
          </div>

          <!-- Description -->
          <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; opacity: 0.9;">
            We use cookies to improve your experience. Choose which types of cookies you allow.
            Essential cookies are required for the site to function.
          </p>

          <!-- Cookie Categories -->
          <div style="margin-bottom: 24px;">
            <!-- Essential Cookies -->
            <div style="
              background: rgba(255,255,255,0.05);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                  <strong style="font-size: 14px;">Essential Cookies</strong>
                  <span style="background: #10b981; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">Required</span>
                </div>
                <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                  <input type="checkbox" checked disabled style="opacity: 0; width: 0; height: 0;">
                  <span style="
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #10b981;
                    transition: .3s;
                    border-radius: 24px;
                  "></span>
                </label>
              </div>
              <p style="margin: 0; font-size: 12px; opacity: 0.8; line-height: 1.5;">
                Required for basic site functionality (cart, session, security).
              </p>
            </div>

            <!-- Analytics Cookies -->
            <div style="
              background: rgba(255,255,255,0.05);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 14px;">Analytics Cookies</strong>
                <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                  <input type="checkbox" id="analyticsToggle" ${consentState.analytics ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                  <span id="analyticsSlider" style="
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: ${consentState.analytics ? '#3b82f6' : '#4b5563'};
                    transition: .3s;
                    border-radius: 24px;
                  "></span>
                  <span id="analyticsKnob" style="
                    position: absolute;
                    height: 18px;
                    width: 18px;
                    left: ${consentState.analytics ? '23px' : '3px'};
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                  "></span>
                </label>
              </div>
              <p style="margin: 0; font-size: 12px; opacity: 0.8; line-height: 1.5;">
                Help us understand how you use the site (Google Analytics).
              </p>
            </div>

            <!-- Marketing Cookies -->
            <div style="
              background: rgba(255,255,255,0.05);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 14px;">Marketing Cookies</strong>
                <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                  <input type="checkbox" id="marketingToggle" ${consentState.marketing ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                  <span id="marketingSlider" style="
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: ${consentState.marketing ? '#8b5cf6' : '#4b5563'};
                    transition: .3s;
                    border-radius: 24px;
                  "></span>
                  <span id="marketingKnob" style="
                    position: absolute;
                    height: 18px;
                    width: 18px;
                    left: ${consentState.marketing ? '23px' : '3px'};
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                  "></span>
                </label>
              </div>
              <p style="margin: 0; font-size: 12px; opacity: 0.8; line-height: 1.5;">
                Used for personalized ads and remarketing (Meta Pixel, Google Ads).
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="consentAcceptAll" style="
              flex: 1;
              min-width: 120px;
              background: #f59e0b;
              color: #000;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            ">Accept All</button>
            
            <button id="consentRejectAll" style="
              flex: 1;
              min-width: 120px;
              background: #4b5563;
              color: #fff;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            ">Reject All</button>
            
            <button id="consentSave" style="
              flex: 1;
              min-width: 120px;
              background: #3b82f6;
              color: #fff;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            ">Save Preferences</button>
          </div>

          <!-- Footer Links -->
          <div style="margin-top: 16px; text-align: center;">
            <a href="privacy.html" style="color: #9ca3af; font-size: 12px; text-decoration: underline;">Privacy Policy</a>
            <span style="margin: 0 8px; color: #4b5563;">|</span>
            <a href="terms.html" style="color: #9ca3af; font-size: 12px; text-decoration: underline;">Terms of Service</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show consent banner
   */
  function showBanner() {
    // Remove existing banner if any
    const existing = document.getElementById('cookieConsentBanner');
    if (existing) existing.remove();

    // Create and append banner
    const banner = document.createElement('div');
    banner.innerHTML = createBannerHTML();
    document.body.appendChild(banner);

    // Attach event listeners
    attachBannerEvents();
  }

  /**
   * Hide consent banner
   */
  function hideBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) banner.remove();
  }

  /**
   * Update consent UI based on state
   */
  function updateConsentUI() {
    const analyticsToggle = document.getElementById('analyticsToggle');
    const marketingToggle = document.getElementById('marketingToggle');
    const analyticsSlider = document.getElementById('analyticsSlider');
    const analyticsKnob = document.getElementById('analyticsKnob');
    const marketingSlider = document.getElementById('marketingSlider');
    const marketingKnob = document.getElementById('marketingKnob');

    if (analyticsToggle) {
      analyticsToggle.checked = consentState.analytics;
      if (analyticsSlider) analyticsSlider.style.backgroundColor = consentState.analytics ? '#3b82f6' : '#4b5563';
      if (analyticsKnob) analyticsKnob.style.left = consentState.analytics ? '23px' : '3px';
    }

    if (marketingToggle) {
      marketingToggle.checked = consentState.marketing;
      if (marketingSlider) marketingSlider.style.backgroundColor = consentState.marketing ? '#8b5cf6' : '#4b5563';
      if (marketingKnob) marketingKnob.style.left = consentState.marketing ? '23px' : '3px';
    }
  }

  /**
   * Attach event listeners to banner
   */
  function attachBannerEvents() {
    // Close button
    const closeBtn = document.getElementById('consentCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        saveConsent();
        hideBanner();
      });
    }

    // Accept All button
    const acceptAllBtn = document.getElementById('consentAcceptAll');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', acceptAll);
    }

    // Reject All button
    const rejectAllBtn = document.getElementById('consentRejectAll');
    if (rejectAllBtn) {
      rejectAllBtn.addEventListener('click', rejectAll);
    }

    // Save Preferences button
    const saveBtn = document.getElementById('consentSave');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const analyticsToggle = document.getElementById('analyticsToggle');
        const marketingToggle = document.getElementById('marketingToggle');
        
        consentState.analytics = analyticsToggle ? analyticsToggle.checked : false;
        consentState.marketing = marketingToggle ? marketingToggle.checked : false;
        
        saveConsent();
        hideBanner();
      });
    }

    // Toggle switches
    const analyticsToggle = document.getElementById('analyticsToggle');
    const marketingToggle = document.getElementById('marketingToggle');

    if (analyticsToggle) {
      analyticsToggle.addEventListener('change', (e) => {
        consentState.analytics = e.target.checked;
        updateConsentUI();
      });
    }

    if (marketingToggle) {
      marketingToggle.addEventListener('change', (e) => {
        consentState.marketing = e.target.checked;
        updateConsentUI();
      });
    }
  }

  /**
   * Check if banner should be shown
   */
  function shouldShowBanner() {
    const consent = getCookie(CONSENT_COOKIE);
    return !consent;
  }

  // Initialize
  function init() {
    loadConsent();

    // Set global consent state
    window.adsConsent = consentState.analytics && consentState.marketing;
    window.consentState = consentState;

    // Show banner if no consent recorded
    if (shouldShowBanner()) {
      showBanner();
    }

    // Export public API
    window.SharkimConsent = {
      hasConsent: hasConsent,
      setConsent: setConsent,
      withdrawConsent: withdrawConsent,
      acceptAll: acceptAll,
      rejectAll: rejectAll,
      getState: () => ({ ...consentState }),
      showBanner: showBanner,
      logConsentAction: logConsentAction
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();