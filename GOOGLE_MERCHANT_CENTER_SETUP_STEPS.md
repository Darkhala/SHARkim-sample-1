# 🛒 Google Merchant Center - Complete Setup Guide

**Website:** Sharkim Traders (https://sharkimtraders.co.ke/)

This guide walks you through setting up your Google Merchant Center account and getting your products approved for Google Shopping.

---

## 📋 PREREQUISITES

Before starting, ensure:

1. ✅ Supabase Edge Function is deployed
2. ✅ Feed URL is accessible: `https://sharkimtraders.co.ke/product.xml`
3. ✅ Website has complete contact information
4. ✅ Product pages have clear prices and availability

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Create Google Merchant Center Account

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Click **"Get Started"** or **"Create Account"**
3. Sign in with your Google account
4. Fill in business information:
   - **Business name:** Sharkim Traders
   - **Website:** https://sharkimtraders.co.ke/
   - **Country:** Kenya
   - **Time zone:** Africa/Nairobi

### Step 2: Verify and Claim Your Website

Google needs to verify you own the website:

**Option A: HTML File Upload**
1. Download the verification HTML file from Merchant Center
2. Upload it to your website root: `https://sharkimtraders.co.ke/googleXXXXXXXXXXXX.html`
3. Click "Verify" in Merchant Center

**Option B: HTML Tag (Recommended for static sites)**
1. Copy the meta tag provided by Google
2. Add it to the `<head>` section of all your HTML pages:
   ```html
   <meta name="google-site-verification" content="your-verification-code">
   ```
3. Deploy the changes to your website
4. Click "Verify" in Merchant Center

**Option C: Google Analytics**
- If you have Google Analytics installed, you can verify through that

### Step 3: Complete Business Information

Go to **Settings** → **Business information**:

1. **Address:** Add your business address
   - Royal Palms Mall, Mombasa Road
   - Nairobi, Kenya
2. **Phone:** +254704843554
3. **Email:** sharkimtraders97@gmail.com
4. **Customer service:** Add contact details

### Step 4: Set Up Shipping

Go to **Settings** → **Shipping**:

1. Click **"+ Add shipping"**
2. Set up Kenya domestic shipping:
   - **Country:** Kenya
   - **Service:** Standard Delivery
   - **Price:** Set your shipping rates (or free shipping)
   - **Delivery time:** 2-5 business days (adjust as needed)

**Recommended shipping settings:**
- Free shipping for orders over a certain amount
- Flat rate shipping for smaller orders
- Express delivery option if available

### Step 5: Set Up Tax Settings

Go to **Settings** → **Tax**:

1. Kenya typically doesn't require tax settings for most products
2. If needed, set up VAT (16% in Kenya)
3. Mark prices as "Includes tax" if your prices include VAT

### Step 6: Create Your First Product Feed

1. Go to **Products** → **Feeds**
2. Click the **blue "+" button**
3. Select your target country: **Kenya**
4. Choose input method: **Scheduled fetch**
5. Fill in feed details:
   - **Feed name:** Sharkim Traders Products
   - **Input file:** URL
   - **Fetch URL:** `https://sharkimtraders.co.ke/product.xml`
   - **Fetch schedule:** Daily (recommended)
   - **Time zone:** Africa/Nairobi

6. Click **"Fetch now"** to test
7. Review the products for any errors

### Step 7: Fix Any Feed Errors

After fetching, check the **Diagnostics** tab:

**Common issues to fix:**
- ❌ **Missing images:** Ensure all products have HTTPS image URLs
- ❌ **Invalid prices:** Check price format matches website
- ❌ **Missing identifiers:** Set `identifier_exists` to false (already done)
- ❌ **Policy violations:** Review Google's shopping policies

**To fix:**
1. Update product data in Supabase
2. Wait for next scheduled fetch, or manually re-fetch
3. Check diagnostics again

### Step 8: Enable Products

Once your feed passes validation:

1. Go to **Products** → **All products**
2. Select products you want to show
3. Click **"Enable"** to make them active
4. Products will now appear in Google Shopping

---

## 🎯 OPTIMIZATION TIPS

### Product Titles
- Use clear, descriptive titles
- Include brand, model, key features
- Keep under 150 characters
- Example: "Ramtons RM-399 Corded Electric Kettle – 1.7L, Fast Boil, Auto Shut-Off"

### Product Descriptions
- Write detailed, unique descriptions
- Include key features and specifications
- Use natural language (not keyword stuffing)
- Keep between 500-5000 characters

### Product Images
- Use high-quality images (minimum 800x800 pixels)
- White or neutral backgrounds preferred
- Show the actual product clearly
- No watermarks or promotional text

### Pricing
- Ensure prices match your website exactly
- Include any applicable taxes
- Keep prices competitive

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks
1. **Diagnostics tab:** Check for new errors
2. **Performance reports:** Monitor clicks and impressions
3. **Feed status:** Ensure feed is updating successfully

### Weekly Tasks
1. Review product performance
2. Update prices and availability
3. Add new products to inventory
4. Fix any policy warnings

### Monthly Reviews
1. Analyze shopping performance
2. Optimize underperforming products
3. Update shipping settings if needed
4. Review competitor pricing

---

## 🔧 TROUBLESHOOTING

### Feed Not Fetching
**Problem:** Feed shows "Never fetched" or errors

**Solutions:**
1. Check feed URL is accessible: `https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed`
2. Verify Supabase function is deployed
3. Check browser for XML output
4. Ensure environment variables are set in Supabase

### Products Disapproved
**Problem:** Products show "Disapproved" status

**Common reasons:**
- ❌ Policy violations (review Google's policies)
- ❌ Inaccurate data (prices, availability)
- ❌ Poor image quality
- ❌ Missing required information

**Fix:**
1. Click on disapproved product
2. Read the specific reason
3. Update product data in Supabase
4. Request review in Merchant Center

### Website Not Verified
**Problem:** Can't verify website ownership

**Solutions:**
1. Try HTML tag method (easiest for static sites)
2. Ensure meta tag is in all pages
3. Clear website cache
4. Wait 24 hours and try again

### Low Impressions/Clicks
**Problem:** Products not showing in Google Shopping

**Solutions:**
1. Ensure products are "Enabled" in Merchant Center
2. Check product titles and descriptions for relevance
3. Verify prices are competitive
4. Consider running Google Shopping ads
5. Improve product data quality

---

## 📞 SUPPORT RESOURCES

### Google Merchant Center Help
- [Merchant Center Help Center](https://support.google.com/merchants/)
- [Shopping Ads Policies](https://support.google.com/merchants/answer/6149970)
- [Product Data Specifications](https://support.google.com/merchants/answer/188494)

### Community Forums
- [Google Merchant Center Community](https://support.google.com/merchants/community)

### Contact Google Support
- Available in Merchant Center under **Help** → **Contact us**

---

## ✅ CHECKLIST

Before launching:

- [ ] Supabase Edge Function deployed
- [ ] Feed URL accessible and returns valid XML
- [ ] Google Merchant Center account created
- [ ] Website verified and claimed
- [ ] Business information complete
- [ ] Shipping settings configured
- [ ] Tax settings configured (if needed)
- [ ] Product feed created and fetched
- [ ] All feed errors fixed
- [ ] Products enabled
- [ ] First products appearing in Google Shopping

---

## 🎉 YOU'RE READY!

Once you've completed these steps, your products will start appearing in Google Shopping results for relevant searches in Kenya.

**Next steps:**
1. Monitor performance in Merchant Center
2. Consider setting up Google Shopping ads
3. Continuously optimize product data
4. Expand to additional markets when ready

**Good luck with your Google Shopping launch!** 🚀

---

**Need help?** Check the Google Merchant Center Help Center or contact Google Support directly through your Merchant Center account.