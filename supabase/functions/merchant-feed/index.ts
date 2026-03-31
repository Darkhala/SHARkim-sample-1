/**
 * Sharkim Traders - Google Merchant Center Product Feed
 * Supabase Edge Function
 * 
 * This function generates a valid XML product feed for Google Merchant Center
 * by pulling live product data from Supabase.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// XML escape function to prevent invalid characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

// Sanitize description for Google Merchant (remove HTML tags, limit length)
function sanitizeDescription(text: string): string {
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  const cleaned = withoutHtml.replace(/\s+/g, ' ').trim();
  return cleaned.length > 5000 ? cleaned.substring(0, 4997) + '...' : cleaned;
}

// Map Supabase stock status to Google Merchant availability
function mapAvailability(stock: number | null | undefined, status?: string): string {
  if (status === 'out_of_stock' || status === 'discontinued') {
    return 'out of stock';
  }
  if (typeof stock === 'number') {
    return stock > 0 ? 'in stock' : 'out of stock';
  }
  return 'in stock';
}

// Format price for Google Merchant (requires currency code)
function formatPrice(price: number | string | null | undefined): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice as number) || numPrice === null || numPrice === undefined) {
    return '0.00 KES';
  }
  return `${numPrice.toFixed(2)} KES`;
}

// Generate product XML item
function generateProductXml(product: any, baseUrl: string): string {
  const productId = product.id || product.sku || `product-${Math.random().toString(36).substr(2, 9)}`;
  const title = product.title || product.name || 'Unnamed Product';
  const description = product.description || product.title || '';
  const price = product.price || product.sale_price || 0;
  const imageUrl = product.image_url || product.image || product.images?.[0] || '';
  const category = product.category || 'Electronics';
  const brand = product.brand || 'Sharkim Traders';
  const condition = product.condition || 'new';
  const availability = mapAvailability(product.stock_quantity, product.status);
  const productUrl = `${baseUrl}product.html?id=${encodeURIComponent(productId)}`;

  const absoluteImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : imageUrl.startsWith('/') 
      ? `${baseUrl}${imageUrl.slice(1)}` 
      : `${baseUrl}images/${imageUrl}`;

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
    `      <g:condition>${condition}</g:condition>`,
    `      <g:availability>${availability}</g:availability>`,
    '      <g:identifier_exists>false</g:identifier_exists>',
    '    </item>'
  ].join('\n');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://sharkimtraders.co.ke/';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const productItems = products.map(product => generateProductXml(product, baseUrl)).join('\n');

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
      productItems,
      '  </channel>',
      '</rss>'
    ].join('\n');

    return new Response(feed, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Product-Count': products.length.toString(),
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
        'Content-Type': 'application/xml',
      },
    });
  }
});