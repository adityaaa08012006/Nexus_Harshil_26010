# Supabase Integration

## Setup Complete ✅

Supabase has been successfully configured and tested for your warehouse management system.

### Database Structure

**User Authentication Tables:**

- **`auth.users`** - Supabase's built-in auth table (managed by Supabase, stores credentials)
- **`user_profiles`** - Your custom table that extends auth.users with app-specific data (name, role, warehouse_id)

⚠️ **Important:** Do NOT create a separate `users` table. The `user_profiles` table references `auth.users` via foreign key and is automatically populated by a trigger when users sign up.

### Files Created

1. **`.env`** - Environment variables with Supabase credentials
2. **`config/supabase.js`** - Supabase client configuration
3. **`test-supabase.js`** - Connection test script
4. **`database/schema.sql`** - Complete database schema
5. **`database/migration_remove_users_table.sql`** - Migration to remove redundant users table

### Configuration

```env
SUPABASE_URL=https://dyzmugafsqtrlzajgkpr.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
```

### Usage Examples

#### Basic Query Example

```javascript
import { supabase } from "./config/supabase.js";

// Select data
const { data, error } = await supabase.from("inventory").select("*");

// Insert data
const { data, error } = await supabase
  .from("inventory")
  .insert([{ name: "Product 1", quantity: 100 }]);

// Update data
const { data, error } = await supabase
  .from("inventory")
  .update({ quantity: 150 })
  .eq("id", 1);

// Delete data
const { data, error } = await supabase.from("inventory").delete().eq("id", 1);
```

#### Using in Express Routes

```javascript
import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/items", async (req, res) => {
  try {
    const { data, error } = await supabase.from("inventory").select("*");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### Admin Operations (using service key)

```javascript
import { supabaseAdmin } from "./config/supabase.js";

// Delete user (admin only)
const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
```

### Next Steps

1. **Create Tables** - Go to your Supabase dashboard and create the necessary tables
2. **Set up Authentication** - Use Supabase Auth for user management
3. **Configure Row Level Security (RLS)** - Set up security policies for your tables
4. **Storage** - Use Supabase Storage for file uploads if needed

### Testing Configuration (Disable Email Verification)

For testing purposes, you can disable email verification:

1. Go to your [Supabase Dashboard](https://dyzmugafsqtrlzajgkpr.supabase.co)
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **Confirm email** setting
4. Toggle it to **Disabled**
5. Click **Save**

This allows users to register and login instantly without email verification.

⚠️ **Important**: Re-enable email confirmation before deploying to production!

### Testing Connection

Run the test script anytime to verify your connection:

```bash
node test-supabase.js
```

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Your Supabase Dashboard](https://dyzmugafsqtrlzajgkpr.supabase.co)
