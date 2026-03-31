/**
 * Sharkim Traders - Configuration
 * Centralized configuration for Supabase and API endpoints
 * All keys here are safe for client-side exposure
 */

const SHARKIM_CONFIG = {
  // Supabase Configuration (Public anon key is safe for client-side)
  supabase: {
    url: 'https://evmiakneqtoxvnzeiwlz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bWlha25lcXRveHZuemVpd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTU4NTEsImV4cCI6MjA2OTg5MTg1MX0.lgW9OGAg8etuIzWPs-t0Ek_P7y3_m5GEo-ZSzbqbsGc'
  },

  // Pesapal Configuration
  // WARNING: Consumer Secret in client-side code is NOT secure for production
  // For production, use a server-side proxy for token generation
  pesapal: {
    consumerKey: 'zEXJX2pXKVlHBX1Q8Bmv4cB81k170U7l',
    consumerSecret: '2sB44RXj0P/hYKrw5bdaJKfLbO4=',
    environment: 'production', // or 'sandbox' for testing
    callbackUrl: window.location.origin + '/order-confirmation.html?payment=pesapal',
    ipnUrl: window.location.origin + '/pesapal-ipn'
  },

  // Analytics Configuration (Update with your actual IDs)
  analytics: {
    ga4: {
      measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 ID
      enabled: false // Set to true after adding real ID
    },
    metaPixel: {
      pixelId: 'XXXXXXXXXXXXXXX', // Replace with your Pixel ID
      enabled: false // Set to true after adding real ID
    }
  },

  // Contact Information
  contact: {
    phone: '+254704843554',
    phoneFormatted: '+254 704 843 554',
    email: 'sharkimtraders97@gmail.com',
    whatsapp: '254704843554'
  },

  // Business Hours
  hours: {
    weekday: '08:30 - 18:30',
    sunday: 'Closed'
  }
};

// Freeze configuration to prevent modifications
Object.freeze(SHARKIM_CONFIG);
Object.freeze(SHARKIM_CONFIG.supabase);
Object.freeze(SHARKIM_CONFIG.contact);
Object.freeze(SHARKIM_CONFIG.hours);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SHARKIM_CONFIG;
}