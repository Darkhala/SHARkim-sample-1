/**
 * Sharkim Traders - Supabase Client Module
 * Safe initialization of Supabase client with public anon key
 */

(function() {
  'use strict';

  // Supabase client instance
  let supabaseClient = null;

  /**
   * Initialize Supabase client
   * Uses the public anon key which is safe for client-side exposure
   */
  function init() {
    if (supabaseClient) return supabaseClient;

    // Check if Supabase JS library is loaded
    if (!window.supabase) {
      console.error('Supabase JS library not loaded. Include: <script src="https://unpkg.com/@supabase/supabase-js"><\/script>');
      return null;
    }

    const config = SHARKIM_CONFIG.supabase;
    
    try {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }

    return supabaseClient;
  }

  /**
   * Get Supabase client instance
   */
  function getClient() {
    if (!supabaseClient) {
      init();
    }
    return supabaseClient;
  }

  /**
   * Fetch all products
   */
  async function fetchProducts(options = {}) {
    const client = getClient();
    if (!client) return [];

    const {
      category = null,
      subcategory = null,
      search = null,
      sortBy = 'id',
      sortOrder = 'desc',
      limit = 100
    } = options;

    let query = client.from('Products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('sub_category', subcategory);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fetch single product by ID
   */
  async function fetchProduct(id) {
    const client = getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('Products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  }

  /**
   * Fetch products by category
   */
  async function fetchProductsByCategory(category, subcategory = null) {
    const client = getClient();
    if (!client) return [];

    let query = client.from('Products').select('*').eq('category', category);

    if (subcategory) {
      query = query.eq('sub_category', subcategory);
    }

    const { data, error } = await query.order('id', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Search products
   */
  async function searchProducts(query) {
    const client = getClient();
    if (!client) return [];

    const { data, error } = await client
      .from('Products')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fetch related products
   */
  async function fetchRelatedProducts(productId, category, limit = 6) {
    const client = getClient();
    if (!client) return [];

    const { data, error } = await client
      .from('Products')
      .select('*')
      .eq('category', category)
      .neq('id', productId)
      .limit(limit);

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get unique categories from products
   */
  async function fetchCategories() {
    const products = await fetchProducts({ limit: 1000 });
    const categories = new Set();
    const subcategories = {};

    products.forEach(product => {
      const mainCat = product.category || 'Uncategorized';
      const subCat = product.sub_category || null;
      
      categories.add(mainCat);
      
      if (subCat) {
        if (!subcategories[mainCat]) {
          subcategories[mainCat] = new Set();
        }
        subcategories[mainCat].add(subCat);
      }
    });

    return {
      main: Array.from(categories).sort(),
      sub: Object.fromEntries(
        Object.entries(subcategories).map(([key, value]) => [key, Array.from(value).sort()])
      )
    };
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  // Expose public API
  window.SharkimSupabase = {
    init,
    getClient,
    fetchProducts,
    fetchProduct,
    fetchProductsByCategory,
    searchProducts,
    fetchRelatedProducts,
    fetchCategories
  };
})();