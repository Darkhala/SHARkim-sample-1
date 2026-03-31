/**
 * Sharkim Traders - Login Page Module
 * Handles user authentication
 * Uses sanitized IDs for all DOM operations
 */

(function() {
  'use strict';

  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const statusText = document.getElementById('status');

  // Admin email restriction
  const ADMIN_EMAIL = 'sharkimtraders97@gmail.com';

  /**
   * Handle login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();

    const email = (emailEl?.value || '').trim();
    const password = passwordEl?.value || '';

    if (!email || !password) {
      if (statusText) {
        statusText.textContent = '❌ Please enter both email and password.';
        statusText.classList.remove('text-green-600');
        statusText.classList.add('text-red-500');
      }
      return;
    }

    try {
      const client = SharkimSupabase.getClient();
      if (!client) {
        if (statusText) {
          statusText.textContent = '❌ Authentication service unavailable.';
          statusText.classList.remove('text-green-600');
          statusText.classList.add('text-red-500');
        }
        return;
      }

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (statusText) {
          statusText.textContent = '❌ ' + (error.message || 'Login failed. Please try again.');
          statusText.classList.remove('text-green-600');
          statusText.classList.add('text-red-500');
        }
        return;
      }

      if (data.user) {
        // Check if admin email
        if (data.user.email !== ADMIN_EMAIL) {
          if (statusText) {
            statusText.textContent = '⚠️ This page is authorized for admins only.';
            statusText.classList.remove('text-green-600');
            statusText.classList.add('text-red-500');
          }
          // Force logout if not admin
          await client.auth.signOut();
          return;
        }

        // Store session
        localStorage.setItem('sharkim_user', JSON.stringify(data.user));

        // Success
        if (statusText) {
          statusText.textContent = '✅ Welcome Admin!';
          statusText.classList.remove('text-red-500');
          statusText.classList.add('text-green-600');
        }

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = 'Admindashboard.html';
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (statusText) {
        statusText.textContent = '⚠️ ' + (err.message || 'An error occurred. Please try again.');
        statusText.classList.remove('text-green-600');
        statusText.classList.add('text-red-500');
      }
    }
  }

  /**
   * Check if user is already logged in
   */
  function checkSession() {
    const user = localStorage.getItem('sharkim_user');
    if (user) {
      // Already logged in, redirect
      window.location.href = 'Admindashboard.html';
    }
  }

  /**
   * Initialize page
   */
  function init() {
    checkSession();

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
