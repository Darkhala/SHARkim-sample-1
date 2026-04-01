# 🚨 URGENT: Fix "Connection Failed" Error

**Problem:** Google Merchant Center shows "Connection failed" because your feed URL is not accessible yet.

**Root Cause:** The Supabase Edge Function must be deployed before Google can access it.

---

## ✅ IMMEDIATE FIX - Deploy the Edge Function

### Step 1: Open Terminal/Command Prompt

Press `Win + R`, type `cmd`, press Enter.

### Step 2: Navigate to Your Project

```cmd
cd "c:\Users\Hamish\Documents\SHARkimWebsite"
```

### Step 3: Login to Supabase

```cmd
supabase login
```

This will open a browser. Log in with your GitHub/Google account.

### Step 4: Link to Your Project

```cmd
supabase link --project-ref evmiakneqtoxvnzeiwlz
```

### Step 5: Deploy the Merchant Feed Function

```cmd
supabase functions deploy merchant-feed
```

**Wait for it to say "Deployment complete"** ✅

---

## 🧪 Step 6: Test the Feed

Open your browser and visit:

```
https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
```

**Expected result:** You should see XML code with your products.

If you see XML, the function is deployed successfully! ✅

---

## 🔄 Step 7: Update Google Merchant Center

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Products → Feeds
3. Click on your feed
4. Settings → Edit
5. **Feed URL:** Change to:
   ```
   https://evmiakneqtoxvnzeiwlz.supabase.co/functions/v1/merchant-feed
   ```
6. Click "Fetch now" to test
7. Save

---

## ❓ Troubleshooting

### If `supabase` command is not found:

Install Supabase CLI:
```cmd
npm install -g supabase
```

Or download from: https://supabase.com/docs/guides/cli

### If you get "not logged in":

Run `supabase login` again.

### If you get "project not found":

Make sure you used the correct project reference: `evmiakneqtoxvnzeiwlz`

### If the feed URL shows error:

1. Check Supabase Dashboard → Edge Functions
2. Make sure the function is deployed
3. Check if environment variables are set:
   - Go to Edge Functions → merchant-feed → Settings
   - Add: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## 📞 Need Help?

If you're still stuck, I can help you:

1. Share your screen and I'll guide you through deployment
2. Or provide remote access to deploy for you

---

**Once deployed, the "Connection failed" error will be resolved!** 🎉