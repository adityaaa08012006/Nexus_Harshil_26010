# Supabase Integration

## Setup Complete ✅

Supabase has been successfully configured and tested for your warehouse management system.

### Files Created

1. **`.env`** - Environment variables with Supabase credentials
2. **`config/supabase.js`** - Supabase client configuration
3. **`test-supabase.js`** - Connection test script

### Configuration

```env
SUPABASE_URL=https://dyzmugafsqtrlzajgkpr.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
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

### Testing Connection

Run the test script anytime to verify your connection:

```bash
node test-supabase.js
```

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Your Supabase Dashboard](https://dyzmugafsqtrlzajgkpr.supabase.co)
