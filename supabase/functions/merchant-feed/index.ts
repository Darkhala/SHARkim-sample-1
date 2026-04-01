/**
 * Sharkim Traders - Google Merchant Center Product Feed
 * Supabase Edge Function (Production-Ready, Strict Compliance)
 * 
 * Generates a valid XML product feed for Google Merchant Center
 * by pulling live product data from Supabase.
 * 
 * Compliance: Google Merchant Center XML Specification
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Properly escape XML special characters
 * Uses actual XML entities for valid XML output
 * CRITICAL: Do not modify this function
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

/**
 * Sanitize description for Google Merchant
 * - Remove HTML tags
 * - Limit to 5000 characters
 * - Clean whitespace
 */
function sanitizeDescription(text: string): string {
  if (!text) return '';
  // Remove HTML tags
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const cleaned = withoutHtml.replace(/\s+/g, ' ').trim();
  // Limit to 5000 characters (Google Merchant limit)
  return cleaned.length > 5000 ? cleaned.substring(0, 4997) + '...' : cleaned;
}

/**
 * Map product status to Google Merchant availability
 * Only allows: "in stock" or "out of stock"
 */
function mapAvailability(stock: number | null | undefined, status?: string): string {
  // Explicitly out of stock statuses
  if (status === 'out_of_stock' || status === 'discontinued') {
    return 'out of stock';
  }
  // Check stock quantity
  if (typeof stock === 'number') {
    return stock > 0 ? 'in stock' : 'out of stock';
  }
  // Default to in stock if we can't determine
  return 'in stock';
}

/**
 * Format price for Google Merchant
 * Required format: "2999.00 KES"
 */
function formatPrice(price: number | string | null | undefined): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice as number) || numPrice === null || numPrice === undefined) {
    return '0.00 KES';
  }
  return `${numPrice.toFixed(2)} KES`;
}

/**
 * Validate and get absolute image URL
 * STRICT: Only allows HTTPS URLs
 * Returns null if image is missing or invalid
 */
function getAbsoluteImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }

  const trimmedUrl = imageUrl.trim();

  // Only allow HTTPS URLs (strict validation)
  if (!trimmedUrl.startsWith('https://')) {
    return null;
  }

  return trimmedUrl;
}

/**
 * Validate product has required fields for Google Merchant
 * Required: id, title, price, image
 */
function validateProduct(product: any): { valid: boolean; reason?: string } {
  // Check for ID
  if (!product.id && !product.sku) {
    return { valid: false, reason: 'Missing product ID' };
  }

  // Check for title
  const title = product.title || product.name;
  if (!title || title.trim() === '') {
    return { valid: false, reason: 'Missing product title' };
  }

  // Check for price
  const price = product.price || product.sale_price;
  if (price === null || price === undefined || price === '' || isNaN(parseFloat(String(price)))) {
    return { valid: false, reason: 'Missing or invalid price' };
  }

  // Check for image (must be HTTPS)
  const imageUrl = product.image_url || product.image || product.images?.[0];
  if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
    return { valid: false, reason: 'Missing product image' };
  }

  // Validate image is HTTPS
  const validImageUrl = getAbsoluteImageUrl(imageUrl);
  if (!validImageUrl) {
    return { valid: false, reason: 'Invalid image URL (must be HTTPS)' };
  }

  return { valid: true };
}

/**
 * Generate product XML item for Google Merchant
 * Includes all required and recommended fields
 */
function generateProductXml(product: any, baseUrl: string): string | null {
  // Validate product first
  const validation = validateProduct(product);
  if (!validation.valid) {
    console.log(`Skipping product: ${validation.reason}`, product.id || product.sku);
    return null;
  }

  const productId = product.id || product.sku;
  const title = product.title || product.name;
  const description = product.description || product.title || '';
  const price = product.price || product.sale_price || 0;
  const imageUrl = product.image_url || product.image || product.images?.[0];
  const category = product.category || 'Electronics';
  const brand = product.brand || 'Sharkim Traders';
  const condition = product.condition || 'new';
  const availability = mapAvailability(product.stock_quantity, product.status);
  
  // SEO-friendly product URL
  const productUrl = `${baseUrl}product.html?id=${encodeURIComponent(String(productId))}`;

  // Get validated HTTPS image URL
  const absoluteImageUrl = getAbsoluteImageUrl(imageUrl);
  if (!absoluteImageUrl) {
    console.log(`Skipping product ${productId}: Invalid HTTPS image URL`);
    return null;
  }

  // Build XML item with all required Google Merchant fields
  return [
    '    <item>',
    `      <g:id>${escapeXml(String(productId))}</g:id>`,
    `      <g:title>${escapeXml(title)}</g:title>`,
    `      <g:description>${escapeXml(sanitizeDescription(description))}</g:description>`,
    `      <g:link>${escapeXml(productUrl)}</g:link>`,
    `      <g:image_link>${escapeXml(absoluteImageUrl)}</g:image_link>`,
    `      <g:price>${formatPrice(price)}</g:price>`,
    `      <g:brand>${escapeXml(brand)}</g:brand>`,
    `      <g:product_type>${escapeXml(category)}</g:product_type>`,
    `      <g:google_product_category>172</g:google_product_category>`,
    `      <g:condition>${condition}</g:condition>`,
    `      <g:availability>${availability}</g:availability>`,
    `      <g:identifier_exists>false</g:identifier_exists>`,
    '      <g:shipping>',
    '        <g:country>KE</g:country>',
    '        <g:service>Standard</g:service>',
    '        <g:price>0.00 KES</g:price>',
    '      </g:shipping>',
    '    </item>'
  ].join('\n');
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  let productsProcessed = 0;
  let productsSkipped = 0;

  try {
    const baseUrl = 'https://sharkimtraders.co.ke/';
    
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client with anon key (safe for read-only access)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch all active products from the products table
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    if (!products || products.length === 0) {
      console.log('No active products found');
      const emptyFeed = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
        '  <channel>',
        '    <title>Sharkim Traders</title>',
        `    <link>${baseUrl}</link>`,
        '    <description>Official product feed for Sharkim Traders - No products available</description>',
        '    <language>en-KE</language>',
        '    <g:country>KE</g:country>',
        '    <g:language>en</g:language>',
        '  </channel>',
        '</rss>'
      ].join('\n');

      return new Response(emptyFeed, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    console.log(`Processing ${products.length} products...`);

    // Process each product and collect valid XML items
    const validItems: string[] = [];
    
    for (const product of products) {
      const xmlItem = generateProductXml(product, baseUrl);
      if (xmlItem) {
        validItems.push(xmlItem);
        productsProcessed++;
      } else {
        productsSkipped++;
      }
    }

    console.log(`Processed: ${productsProcessed}, Skipped: ${productsSkipped}`);

    // Build the complete XML feed
    const feed = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
      '  <channel>',
      '    <title>Sharkim Traders</title>',
      `    <link>${baseUrl}</link>`,
      '    <description>Official product feed for Sharkim Traders - Quality home appliances and electronics in Kenya</description>',
      '    <language>en-KE</language>',
      '    <g:country>KE</g:country>',
      '    <g:language>en</g:language>',
      `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      validItems.join('\n'),
      '  </channel>',
      '</rss>'
    ].join('\n');

    const duration = Date.now() - startTime;
    console.log(`Feed generated in ${duration}ms`);

    return new Response(feed, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Product-Count': productsProcessed.toString(),
        'X-Products-Skipped': productsSkipped.toString(),
        'X-Generation-Time': duration.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating product feed:', error);
    
    const errorFeed = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
      '  <channel>',
      '    <title>Sharkim Traders</title>',
      '    <link>https://sharkimtraders.co.ke/</link>',
      '    <description>Error generating product feed</description>',
      '  </channel>',
      '</rss>'
    ].join('\n');

    return new Response(errorFeed, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
});