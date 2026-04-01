<?php
/**
 * Sharkim Traders - Static Feed Generator
 * 
 * This script generates a static XML feed file from your Supabase products.
 * Run this script manually to create product-feed.xml, then upload it to your site.
 * 
 * USAGE:
 * 1. Upload this file to your website
 * 2. Visit: https://sharkimtraders.co.ke/generate-feed.php
 * 3. It will create product-feed.xml in the same directory
 * 4. Download product-feed.xml and upload it to your site root
 * 5. Use https://sharkimtraders.co.ke/product-feed.xml in Google Merchant
 * 
 * Note: You need to update the Supabase credentials below.
 */

// Supabase Credentials
$supabaseUrl = 'https://evmiakneqtoxvnzeiwlz.supabase.co';
$supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bWlha25lcXRveHZuemVpd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTU4NTEsImV4cCI6MjA2OTg5MTg1MX0.lgW9OGAg8etuIzWPs-t0Ek_P7y3_m5GEo-ZSzbqbsGc';

// Feed configuration
$baseUrl = 'https://sharkimtraders.co.ke/';
$outputFile = 'product-feed.xml';

// Fetch products from Supabase
$url = $supabaseUrl . '/rest/v1/products?status=eq.active&order=created_at.desc';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseAnonKey,
    'Authorization: Bearer ' . $supabaseAnonKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || empty($response)) {
    die("Error: Could not fetch products from Supabase. Check credentials.");
}

$products = json_decode($response, true);

if (!is_array($products)) {
    die("Error: Invalid response from Supabase.");
}

// XML escape function
function escapeXml($string) {
    return htmlspecialchars($string, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

// Build XML
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">' . "\n";
$xml .= '  <channel>' . "\n";
$xml .= '    <title>Sharkim Traders Products</title>' . "\n";
$xml .= '    <link>' . $baseUrl . '</link>' . "\n";
$xml .= '    <description>Quality home appliances and electronics in Kenya</description>' . "\n";
$xml .= '    <language>en-KE</language>' . "\n";
$xml .= '    <g:country>KE</g:country>' . "\n";
$xml .= '    <g:language>en</g:language>' . "\n";
$xml .= '    <lastBuildDate>' . date('r') . '</lastBuildDate>' . "\n";

$itemCount = 0;
foreach ($products as $product) {
    // Validate required fields
    $id = $product['id'] ?? $product['sku'] ?? null;
    $title = $product['title'] ?? $product['name'] ?? null;
    $price = $product['price'] ?? $product['sale_price'] ?? null;
    $imageUrl = $product['image_url'] ?? $product['image'] ?? ($product['images'][0] ?? null);
    
    if (!$id || !$title || !$price || !$imageUrl) {
        continue; // Skip incomplete products
    }
    
    // Ensure image is HTTPS
    if (!str_starts_with($imageUrl, 'https://')) {
        if (str_starts_with($imageUrl, 'http://')) {
            $imageUrl = str_replace('http://', 'https://', $imageUrl);
        } else {
            $imageUrl = $baseUrl . ltrim($imageUrl, '/');
        }
    }
    
    $xml .= '    <item>' . "\n";
    $xml .= '      <g:id>' . escapeXml($id) . '</g:id>' . "\n";
    $xml .= '      <g:title>' . escapeXml($title) . '</g:title>' . "\n";
    $xml .= '      <g:description>' . escapeXml($product['description'] ?? '') . '</g:description>' . "\n";
    $xml .= '      <g:link>' . $baseUrl . 'product.html?id=' . urlencode($id) . '</g:link>' . "\n";
    $xml .= '      <g:image_link>' . escapeXml($imageUrl) . '</g:image_link>' . "\n";
    $xml .= '      <g:price>' . number_format($price, 2, '.', '') . ' KES</g:price>' . "\n";
    $xml .= '      <g:brand>' . escapeXml($product['brand'] ?? 'Sharkim Traders') . '</g:brand>' . "\n";
    $xml .= '      <g:product_type>' . escapeXml($product['category'] ?? 'Electronics') . '</g:product_type>' . "\n";
    $xml .= '      <g:google_product_category>172</g:google_product_category>' . "\n";
    $xml .= '      <g:condition>new</g:condition>' . "\n";
    $xml .= '      <g:availability>' . (isset($product['stock_quantity']) && $product['stock_quantity'] > 0 ? 'in stock' : 'out of stock') . '</g:availability>' . "\n";
    $xml .= '      <g:identifier_exists>false</g:identifier_exists>' . "\n";
    $xml .= '      <g:shipping>' . "\n";
    $xml .= '        <g:country>KE</g:country>' . "\n";
    $xml .= '        <g:service>Standard</g:service>' . "\n";
    $xml .= '        <g:price>0.00 KES</g:price>' . "\n";
    $xml .= '      </g:shipping>' . "\n";
    $xml .= '    </item>' . "\n";
    
    $itemCount++;
}

$xml .= '  </channel>' . "\n";
$xml .= '</rss>';

// Save to file
if (file_put_contents($outputFile, $xml)) {
    echo "✅ Success! Generated $outputFile with $itemCount products.\n";
    echo "Download this file and upload it to your website root.\n";
    echo "Then use https://sharkimtraders.co.ke/$outputFile in Google Merchant Center.\n";
} else {
    echo "❌ Error: Could not save file. Check permissions.";
}