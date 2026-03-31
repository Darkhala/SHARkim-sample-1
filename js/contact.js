/**
 * Sharkim Traders - Contact Page Module
 * Handles contact form submission via WhatsApp and Email
 * Uses sanitized IDs for all DOM operations
 */

(function() {
  'use strict';

  // DOM Elements
  const contactForm = document.getElementById('contactForm');
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const locationEl = document.getElementById('location');
  const messageEl = document.getElementById('message');
  const sendWhatsAppBtn = document.getElementById('sendWhatsApp');

  /**
   * Send message via WhatsApp
   */
  function sendViaWhatsApp() {
    const name = (nameEl?.value || '').trim();
    const phone = (phoneEl?.value || '').trim();
    const location = (locationEl?.value || '').trim();
    const msg = (messageEl?.value || '').trim();

    if (!name || !phone || !msg) {
      if (window.SharkimUtils) {
        SharkimUtils.showNotification('Please fill in Name, Phone, and Message', 'error');
      } else {
        alert('Please fill in Name, Phone, and Message');
      }
      return;
    }

    const text = `Hello Sharkim Traders,%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0ALocation: ${encodeURIComponent(location)}%0AMessage: ${encodeURIComponent(msg)}`;
    window.open(`https://wa.me/${SHARKIM_CONFIG.contact.whatsapp}?text=${text}`, '_blank');
  }

  /**
   * Send message via Email
   */
  function sendViaEmail(e) {
    e.preventDefault();

    const name = (nameEl?.value || '').trim();
    const phone = (phoneEl?.value || '').trim();
    const location = (locationEl?.value || '').trim();
    const msg = (messageEl?.value || '').trim();

    if (!name || !phone || !msg) {
      if (window.SharkimUtils) {
        SharkimUtils.showNotification('Please fill in Name, Phone, and Message', 'error');
      } else {
        alert('Please fill in Name, Phone, and Message');
      }
      return;
    }

    const subject = 'Contact Inquiry';
    const body = `Name: ${name}%0APhone: ${phone}%0ALocation: ${location}%0AMessage: ${msg}`;
    window.location.href = `mailto:${SHARKIM_CONFIG.contact.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  /**
   * Initialize event listeners
   */
  function init() {
    if (sendWhatsAppBtn) {
      sendWhatsAppBtn.addEventListener('click', sendViaWhatsApp);
    }

    if (contactForm) {
      contactForm.addEventListener('submit', sendViaEmail);
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();