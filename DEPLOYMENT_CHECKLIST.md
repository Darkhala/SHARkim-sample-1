# 🚀 Production Deployment Checklist - Google Merchant Feed

**Website:** Sharkim Traders (https://sharkimtraders.co.ke/)  
**Date:** April 1, 2026  
**Status:** Ready for Deployment

---

## 📁 Files Ready for Deployment

### 1. Supabase Edge Function
- [x] `supabase/functions/merchant-feed/index.ts` - Main function (production-ready)
- [x] `supabase/functions/merchant-feed/import_map.json` - Deno imports
- [x] `supabase/functions/merchant-feed/deno.json` - Deno configuration
- [x] `supabase/functions/merchant-feed/README.md` - Documentation

### 2. Website Files
- [x] `product.xml` - Clean XML fallback (will be proxied by .htaccess)
- [x] `.htaccess` - Apache proxy configuration
- [x] `robots.txt` - Updated with feed URLs

### 3. Documentation
- [x] `GOOGLE_MERCHANT_CENTER_SETUP_STEPS.md` - Complete setup guide
- [x] `GOOGLE_MERCHANT_FEED_SETUP.md` - Technical documentation
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

---

## 🔧 Deployment Steps

### Step 1: Deploy Supabase Edge Function

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref evmiakneqtoxvnzeiwlz

# Deploy the function
supabase functions deploy merchant-feed
```

### Step 2: Verify Environment Variables

In Supabase Dashboard:
1. Go to **Edge Functions** → **merchant-feed**
2. Click **Settings** → **Environment Variables**
3. Ensure these are set:
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anon key

### Step 3: Test the Edge Function

```bash
# Test the function directly
curl https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

Expected output: Valid XML with your products

### Step 4: Upload Website Files

Upload these files to your website root:
- `product.xml`
- `.htaccess`
- `robots.txt` (updated)

### Step 5: Test the Feed URL

```bash
# Test the proxied URL
curl https://sharkimtraders.co.ke/product.xml
```

Expected output: Same XML as Step 3

### Step 6: Set Up Google Merchant Center

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Create account / Sign in
3. Verify website ownership
4. Create product feed:
   - **Feed name:** Sharkim Traders Products
   - **Fetch URL:** `https://sharkimtraders.co.ke/product.xml`
   - **Schedule:** Daily
5. Fix any diagnostics errors

---

## ✅ Pre-Deployment Verification

### Edge Function
- [x] XML escaping uses proper entities (`&`, `<`, etc.)
- [x] Google product category is `172` (Electronics)
- [x] Shipping block included for each product
- [x] Only HTTPS image URLs accepted
- [x] Products validated (title, price, image, ID required)
- [x] SEO-friendly product URLs
- [x] Proper error handling
- [x] Cache headers set (1 hour)
- [x] CORS headers configured

### Website
- [x] `.htaccess` proxies `product.xml` to Supabase function
- [x] `robots.txt` includes feed URLs
- [x] `product.xml` is clean fallback XML

---

## 🔍 Testing Checklist

### After Deployment:

- [ ] Edge function returns valid XML
- [ ] All products appear in feed
- [ ] Product links work correctly
- [ ] Images are accessible
- [ ] Prices match website
- [ ] `product.xml` URL returns same XML
- [ ] Google Merchant Center accepts feed
- [ ] No critical errors in diagnostics

---

## 📊 Expected XML Output

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
    
    <item>
      <g:id>PRODUCT_ID</g:id>
      <g:title>Product Name</g:title>
      <g:description>Product description</g:description>
      <g:link>https://sharkimtraders.co.ke/product.html?id=PRODUCT_ID</g:link>
      <g:image_link>https://example.com/image.jpg</g:image_link>
      <g:price>2999.00 KES</g:price>
      <g:brand>Sharkim Traders</g:brand>
      <g:product_type>Category</g:product_type>
      <g:google_product_category>172</g:google_product_category>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>KE</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 KES</g:price>
      </g:shipping>
    </item>
    
  </channel>
</rss>
```

---

## 🆘 Troubleshooting

### Feed Returns Empty
- Check products have `status = 'active'` in Supabase
- Verify environment variables are set

### Products Missing Images
- Ensure image URLs start with `https://`
- HTTP URLs are rejected for security

### Google Merchant Errors
- Check Diagnostics tab for specific issues
- Update product data in Supabase
- Re-fetch feed in Merchant Center

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Google Merchant Help:** https://support.google.com/merchants

---

**Ready to deploy!** Follow the steps above to get your products on Google Shopping.