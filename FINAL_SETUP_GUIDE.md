# 🎯 FINAL SETUP GUIDE - Google Merchant Center Feed

**Date:** April 1, 2026  
**Status:** Ready to Deploy

---

## ✅ WHAT'S READY

All your files are configured with your actual Supabase credentials:
- ✅ `js/config.js` - Supabase URL and anon key configured
- ✅ `generate-feed.php` - Supabase credentials added
- ✅ `product.html` - Enhanced structured data
- ✅ `js/product.js` - Updated JSON-LD handler
- ✅ `supabase/functions/merchant-feed/index.ts` - Edge Function ready

---

## 🚀 TWO OPTIONS TO GET YOUR FEED

### OPTION 1: Use Supabase Edge Function (RECOMMENDED)

**This is the easiest and most reliable method.**

#### Step 1: Deploy the Edge Function

Open your terminal and run:

```bash
# Navigate to your project folder
cd "c:\Users\Hamish\Documents\SHARkimWebsite"

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref evmiakneqtoxvnzeiwlz

# Deploy the merchant-feed function
supabase functions deploy merchant-feed
```

#### Step 2: Test the Feed

Open this URL in your browser:
```
https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

You should see XML with your products.

#### Step 3: Use in Google Merchant Center

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Products → Feeds → + button
3. Select Kenya as target country
4. Choose "Scheduled fetch"
5. **Feed URL:** `https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed`
6. Set fetch schedule to Daily
7. Click "Fetch now" to test

✅ **Done!** Your products will appear in Google Shopping.

---

### OPTION 2: Generate Static XML File

If you prefer a static file on your domain:

#### Step 1: Upload Files to Your Website

Upload these files to your website root:
- `generate-feed.php`
- `product.html` (updated)
- `js/product.js` (updated)
- `js/config.js` (already configured)

#### Step 2: Generate the Feed

1. Visit: `https://sharkimtraders.co.ke/generate-feed.php`
2. The script will fetch your products from Supabase
3. It creates `product-feed.xml` in the same directory
4. Download `product-feed.xml`

#### Step 3: Upload the Feed File

Upload `product-feed.xml` to your website root.

#### Step 4: Use in Google Merchant Center

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Products → Feeds → + button
3. Select Kenya as target country
4. Choose "Scheduled fetch"
5. **Feed URL:** `https://sharkimtraders.co.ke/product-feed.xml`
6. Set fetch schedule to Daily (you'll need to regenerate the file regularly)
7. Click "Fetch now" to test

⚠️ **Note:** With static files, you need to regenerate `product-feed.xml` whenever you add/update products.

---

## 🔄 REGENERATING THE STATIC FEED (OPTION 2 ONLY)

If you chose Option 2, you need to regenerate the feed regularly:

1. Visit: `https://sharkimtraders.co.ke/generate-feed.php`
2. Download the new `product-feed.xml`
3. Upload it to your website root (overwrite the old file)
4. In Google Merchant Center, click "Fetch now" on your feed

**Recommended:** Regenerate daily or whenever you update products.

---

## 📊 VERIFICATION CHECKLIST

After setup, verify:

- [ ] Feed URL opens in browser and shows XML
- [ ] XML contains your products
- [ ] Product links work (click on g:link)
- [ ] Image URLs are accessible (HTTPS)
- [ ] Prices match your website
- [ ] Google Merchant Center accepts the feed
- [ ] No critical errors in Diagnostics

---

## 🆘 TROUBLESHOOTING

### "Connection failed" in Google Merchant
- Ensure feed URL is publicly accessible
- Test in browser: `https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed`
- Check SSL certificate is valid

### "No products" in feed
- Ensure products have `status = 'active'` in Supabase
- Check products have: id, title, price, image_url

### "Invalid image URL"
- All product images must use HTTPS
- Update image URLs in Supabase to use HTTPS

### Website errors after upload
- Remove `.htaccess` if you get 500 errors
- Ensure `js/config.js` is uploaded correctly

---

## 📞 SUPPORT

If you need help:

1. **Supabase Edge Function issues:**
   - Check Supabase Dashboard → Edge Functions
   - View logs in Supabase Dashboard

2. **Google Merchant Center issues:**
   - Check Diagnostics tab
   - Review Google's feed requirements

3. **Website issues:**
   - Check browser console for errors
   - Verify all JS files are uploaded

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] Deploy Supabase Edge Function OR generate static feed
- [ ] Test feed URL in browser
- [ ] Upload updated website files
- [ ] Create Google Merchant Center account
- [ ] Verify website ownership
- [ ] Set up shipping settings
- [ ] Create product feed in Merchant Center
- [ ] Fix any diagnostic errors
- [ ] Enable products
- [ ] Monitor for first 48 hours

---

**You're all set!** Choose Option 1 (recommended) or Option 2 and get your products on Google Shopping! 🎉

---

**Important URLs:**
- Supabase Dashboard: https://app.supabase.com
- Google Merchant Center: https://merchants.google.com
- Your Website: https://sharkimtraders.co.ke