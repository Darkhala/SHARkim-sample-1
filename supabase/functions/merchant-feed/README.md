# Merchant Feed Edge Function

This Supabase Edge Function generates a Google Merchant Center-compliant XML product feed.

## ⚠️ VS Code TypeScript Errors - EXPECTED

You may see TypeScript errors in VS Code like:
- "Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'"
- "Cannot find name 'Deno'"
- "Parameter 'req' implicitly has an 'any' type"

**These errors are EXPECTED and WILL NOT affect deployment.**

### Why the errors appear:

1. **Deno Runtime**: Supabase Edge Functions use Deno, not Node.js
2. **Import Maps**: The function uses Deno import maps (import_map.json)
3. **Type Definitions**: VS Code doesn't automatically recognize Deno types

### The function will work because:

- ✅ Supabase deploys to a Deno runtime
- ✅ Import maps are resolved at runtime
- ✅ All Deno globals (like `Deno.env`) are available
- ✅ The code follows Deno TypeScript conventions

## 📁 Files

- **index.ts** - Main function code (Deno TypeScript)
- **import_map.json** - Deno import mappings
- **deno.json** - Deno configuration (helps with local development)
- **README.md** - This file

## 🚀 Deployment

```bash
supabase functions deploy merchant-feed
```

The deployment process handles all Deno-specific configuration automatically.

## 🧪 Testing Locally

To test locally with Deno:

```bash
# Install Deno if you haven't
curl -fsSL https://deno.land/install.sh | sh

# Run the function locally
deno run --allow-net --allow-env supabase/functions/merchant-feed/index.ts
```

## 📝 Note

Do not remove or modify the import_map.json file - it's essential for the function to work in the Deno runtime.