/**
 * Sharkim Traders - PesaPal Payment Integration
 * Handles PesaPal payment processing
 * NOTE: Consumer Secret should be handled server-side in production
 */

(function() {
  'use strict';

  // PesaPal Configuration
  const PESAPAL_CONFIG = SHARKIM_CONFIG.pesapal || {};

  // PesaPal API endpoints
  const API_ENDPOINTS = {
    production: {
      token: 'https://pay.pesapal.com/v3/api/Auth/RequestToken',
      submitOrder: 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
      transactionStatus: 'https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus',
      ipnStatus: 'https://pay.pesapal.com/v3/api/Transactions/GetIPNs'
    },
    sandbox: {
      token: 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken',
      submitOrder: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest',
      transactionStatus: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus',
      ipnStatus: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetIPNs'
    }
  };

  // Current environment
  const ENV = PESAPAL_CONFIG.environment === 'sandbox' ? 'sandbox' : 'production';
  const ENDPOINTS = API_ENDPOINTS[ENV];

  // State
  let accessToken = null;
  let tokenExpiry = null;

  /**
   * Get PesaPal access token
   * NOTE: In production, this should be done server-side
   */
  async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
      return accessToken;
    }

    // Consumer secret should ideally come from server
    // For now, we'll need to handle this securely
    const consumerKey = PESAPAL_CONFIG.consumerKey;
    const consumerSecret = PESAPAL_CONFIG.consumerSecret;

    if (!consumerKey || !consumerSecret) {
      throw new Error('PesaPal credentials not configured');
    }

    try {
      const response = await fetch(ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      accessToken = data.token;
      tokenExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);

      return accessToken;
    } catch (error) {
      console.error('PesaPal token error:', error);
      throw error;
    }
  }

  /**
   * Submit order to PesaPal
   */
  async function submitOrder(orderDetails) {
    try {
      const token = await getAccessToken();

      const orderData = {
        id: orderDetails.orderId,
        currency: orderDetails.currency || 'KES',
        amount: orderDetails.amount,
        description: orderDetails.description || 'Order from Sharkim Traders',
        callback_url: orderDetails.callbackUrl || PESAPAL_CONFIG.callbackUrl,
        notification_url: orderDetails.notificationUrl || PESAPAL_CONFIG.ipnUrl,
        billing_address: {
          email_address: orderDetails.email,
          phone_number: orderDetails.phone,
          country_code: 'KE',
          first_name: orderDetails.firstName,
          last_name: orderDetails.lastName || '',
          line_1: orderDetails.address || '',
          city: orderDetails.city || '',
          state: orderDetails.county || ''
        }
      };

      const response = await fetch(ENDPOINTS.submitOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Order submit failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PesaPal order error:', error);
      throw error;
    }
  }

  /**
   * Initiate PesaPal payment
   */
  async function initiatePayment(orderDetails) {
    try {
      const result = await submitOrder(orderDetails);

      if (result.redirect_url) {
        // Redirect to PesaPal payment page
        window.location.href = result.redirect_url;
        return { success: true, redirectUrl: result.redirect_url, orderId: result.order_tracking_id };
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error) {
      console.error('PesaPal payment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check transaction status
   */
  async function checkTransactionStatus(orderTrackingId) {
    try {
      const token = await getAccessToken();

      const response = await fetch(`${ENDPOINTS.transactionStatus}?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PesaPal status check error:', error);
      throw error;
    }
  }

  /**
   * Handle PesaPal callback
   */
  function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderTrackingId = urlParams.get('orderTrackingId');
    const orderMerchantMessage = urlParams.get('orderMerchantMessage');

    if (orderTrackingId) {
      // Store in session for processing
      sessionStorage.setItem('pesapal_order_id', orderTrackingId);
      sessionStorage.setItem('pesapal_message', orderMerchantMessage || '');

      // Check transaction status
      return checkTransactionStatus(orderTrackingId);
    }

    return null;
  }

  /**
   * Process PesaPal payment from checkout
   */
  async function processPayment(checkoutData) {
    const orderDetails = {
      orderId: 'ORD-' + Date.now(),
      amount: checkoutData.total,
      currency: 'KES',
      description: `Order from Sharkim Traders - ${checkoutData.items.length} items`,
      email: checkoutData.email,
      phone: checkoutData.phone,
      firstName: checkoutData.name.split(' ')[0],
      lastName: checkoutData.name.split(' ').slice(1).join(' '),
      address: checkoutData.address,
      city: checkoutData.town,
      county: checkoutData.county,
      callbackUrl: window.location.origin + '/order-confirmation.html?payment=pesapal',
      notificationUrl: window.location.origin + '/pesapal-ipn'
    };

    return await initiatePayment(orderDetails);
  }

  // Export public API
  window.SharkimPesapal = {
    initiatePayment: initiatePayment,
    processPayment: processPayment,
    checkTransactionStatus: checkTransactionStatus,
    handleCallback: handleCallback,
    getAccessToken: getAccessToken,
    config: PESAPAL_CONFIG,
    isAvailable: !!PESAPAL_CONFIG.consumerKey
  };

  // Check for callback on page load
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.search.includes('orderTrackingId')) {
      handleCallback();
    }
  });
})();