# 🛒 Google Merchant Center Product Feed - Complete Setup Guide

**Website:** Sharkim Traders (https://sharkimtraders.co.ke/)  
**Date:** March 31, 2026  
**Status:** ✅ Implementation Complete - Ready for Deployment

---

## 📋 OVERVIEW

This guide explains how to set up a production-ready Google Merchant Center product feed using a Supabase Edge Function. The feed dynamically generates valid XML from your Supabase product database.

### Architecture Flow:
```
Supabase Database → Supabase Edge Function → XML Feed → Public URL → Google Merchant Center
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy the Supabase Edge Function

Open your terminal and run these commands:

```bash
# Navigate to your project directory
cd c:/Users/Hamish/Documents/SHARkimWebsite

# Login to Supabase (if not already logged in)
supabase login

# Link to your project (use your actual project reference)
supabase link --project-ref evmiakneqtoxvnzeiwlz

# Deploy the merchant-feed function
supabase functions deploy merchant-feed
```

### Step 2: Set Environment Variables

In your Supabase Dashboard:
1. Go to **Edge Functions** → **merchant-feed**
2. Click **Settings** → **Environment Variables**
3. Add these variables (they should already exist):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Step 3: Test the Function

After deployment, test the function:

```bash
# Get the function URL from the deployment output
# It should be: https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed

# Test with curl
curl https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

You should receive XML output with your products.

---

## 📝 FEED CONFIGURATION

### Function Location:
```
/supabase/functions/merchant-feed/index.ts
```

### What the Function Does:
1. Connects to Supabase using the anon key
2. Fetches all active products from the `products` table
3. Transforms data into Google Merchant XML format
4. Returns properly formatted XML with correct headers
5. Handles CORS for cross-origin requests

### Product Fields Mapped:
| Supabase Field | Google Merchant Field |
|----------------|----------------------|
| `id` or `sku` | `g:id` |
| `title` or `name` | `g:title` |
| `description` | `g:description` |
| `price` or `sale_price` | `g:price` (formatted as "2999.00 KES") |
| `image_url`, `image`, or `images[0]` | `g:image_link` |
| `category` | `g:product_type` |
| `brand` | `g:brand` |
| `stock_quantity` | `g:availability` |
| `condition` | `g:condition` |

### Additional Fields Added:
- `g:link`: Product URL (https://sharkimtraders.co.ke/product.html?id=PRODUCT_ID)
- `g:identifier_exists`: false (for products without GTIN/MPN)

---

## 🔗 PUBLIC FEED URL

### Primary URL (Supabase Edge Function):
```
https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

### Alternative URL (if you set up proxy):
```
https://sharkimtraders.co.ke/merchant-products.xml
```

**Note:** The alternative URL requires setting up a proxy or redirect from your domain to the Supabase function.

---

## 🛡️ SECURITY

### What's Secure:
- ✅ Only uses Supabase **anon key** (public/safe)
- ✅ No service_role key exposed
- ✅ No secrets in frontend code
- ✅ CORS headers properly configured
- ✅ XML escaping prevents injection attacks

### What's Protected:
- Product data is read-only
- No sensitive customer information exposed
- Function validates all inputs

---

## 📊 GOOGLE MERCHANT CENTER SETUP

### Step 1: Create a New Product Feed

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Click **Products** → **Feeds**
3. Click the **+** button to add a new feed
4. Select your target country: **Kenya**
5. Choose input method: **Scheduled fetch**

### Step 2: Configure Feed Settings

- **Feed name:** Sharkim Traders Products
- **Input file:** URL
- **Fetch URL:** `https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed`
- **Fetch schedule:** Daily (recommended)
- **Time zone:** Africa/Nairobi

### Step 3: Complete Setup

1. Click **Fetch now** to test
2. Review any warnings or errors
3. Fix any issues in your Supabase data
4. Save and activate the feed

---

## 🔍 FEED VALIDATION

### Check Feed Output:

```bash
# View the raw XML
curl -s https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed | head -50

# Check product count (look for X-Product-Count header)
curl -I https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

### Validate with Google:
1. Use [Google's Feed Diagnostic Tool](https://merchants.google.com/support/answer/10011292)
2. Upload a sample of your feed
3. Fix any critical errors

---

## 🏷️ PRODUCT PAGE SCHEMA.ORG

### Enhanced Structured Data:

The `product.html` page now includes complete schema.org Product markup:

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Name",
  "image": [],
  "description": "Product description",
  "sku": "SKU",
  "brand": {
    "@type": "Brand",
    "name": "Sharkim Traders"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "KES",
    "price": "0.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Sharkim Traders"
    }
  }
}
```

This structured data is dynamically updated by `js/product.js` when a product is loaded.

---

## 📄 ROBOTS.TXT UPDATE

The `robots.txt` file has been updated to include the feed URL:

```txt
User-agent: *
Allow: /

# Sitemap for search engines
Sitemap: https://sharkimtraders.co.ke/sitemap.xml

# Google Merchant Center Product Feed
Sitemap: https://sharkimtraders.co.ke/merchant-products.xml
```

---

## ⚠️ IMPORTANT NOTES

### Database Requirements:

Your Supabase `products` table should have these columns:
- `id` (primary key)
- `title` or `name`
- `description`
- `price` or `sale_price`
- `image_url`, `image`, or `images` (array)
- `category`
- `brand`
- `stock_quantity` (optional)
- `status` (active/inactive)
- `condition` (new/used/refurbished)

### If Products Don't Appear:

1. Check that products have `status = 'active'`
2. Verify the table name is `products` (lowercase)
3. Ensure the anon key has read permissions on the table

### Feed Caching:

The function caches responses for 1 hour (`Cache-Control: max-age=3600`). This:
- Reduces database load
- Improves response time
- Is respected by Google Merchant

---

## 🔄 AUTOMATIC UPDATES

The feed automatically updates when:
- Products are added to Supabase
- Product details are modified
- Products are marked as out of stock
- Prices are changed

No manual intervention required!

---

## 📞 TROUBLESHOOTING

### Error: "Missing Supabase environment variables"
**Solution:** Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in the function settings.

### Error: "Table 'products' does not exist"
**Solution:** Check your table name matches exactly (case-sensitive).

### Feed shows 0 products
**Solution:** 
1. Verify products exist in the database
2. Check that `status = 'active'`
3. Ensure the anon key has read permissions

### Google Merchant rejects the feed
**Solution:**
1. Check the Diagnostics tab in Merchant Center
2. Fix any critical errors
3. Ensure all required fields are present
4. Verify prices match your website

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] Deploy Supabase Edge Function
- [ ] Test function URL returns valid XML
- [ ] Verify all products appear in feed
- [ ] Check product links resolve correctly
- [ ] Confirm prices match website
- [ ] Validate with Google Merchant Center
- [ ] Fix any critical errors
- [ ] Set up daily fetch schedule
- [ ] Monitor feed for first 48 hours

---

## 📊 EXPECTED XML OUTPUT FORMAT

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Sharkim Traders</title>
    <link>https://sharkimtraders.co.ke/</link>
    <description>Official product feed for Sharkim Traders</description>
    <language>en-KE</language>
    <g:country>KE</g:country>
    <g:language>en</g:language>
    <lastBuildDate>Wed, 31 Mar 2026 18:00:00 GMT</lastBuildDate>
    
    <item>
      <g:id>PRODUCT_ID</g:id>
      <g:title>Product Name</g:title>
      <g:description>Product description...</g:description>
      <g:link>https://sharkimtraders.co.ke/product.html?id=PRODUCT_ID</g:link>
      <g:image_link>https://sharkimtraders.co.ke/images/product.jpg</g:image_link>
      <g:price>2999.00 KES</g:price>
      <g:brand>Sharkim Traders</g:brand>
      <g:product_type>Electronics</g:product_type>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:identifier_exists>false</g:identifier_exists>
    </item>
    
  </channel>
</rss>
```

---

## 🎯 SUCCESS CRITERIA

Your Google Merchant feed implementation is successful when:

1. ✅ Function deploys without errors
2. ✅ XML output is valid and well-formed
3. ✅ All active products appear in the feed
4. ✅ Product links resolve to correct pages
5. ✅ Prices match website exactly
6. ✅ Images are publicly accessible
7. ✅ Google Merchant Center accepts the feed
8. ✅ No critical errors in diagnostics
9. ✅ Products start appearing in Google Shopping

---

**Implementation completed by:** Claude Code Refactoring Agent  
**Date:** March 31, 2026  
**Status:** ✅ Ready for Deployment