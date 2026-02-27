# Testing Setup Guide

## Disable Email Verification for Instant Registration

To allow users to register and login instantly without email verification (for testing only):

### Step-by-Step Instructions

1. **Open your Supabase Dashboard**
   - Go to: https://dyzmugafsqtrlzajgkpr.supabase.co
   - Or navigate to https://supabase.com and select your project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers**
   - Find and click on **Email** provider

3. **Disable Email Confirmation**
   - Scroll down to **Confirm email** setting
   - Toggle it to **Disabled** (turn it off)
   - Click **Save** at the bottom

4. **Verify the Change**
   - Try registering a new user through your app
   - User should be logged in immediately without confirmation

### What This Does

- Users can register and login instantly
- No email confirmation required
- Perfect for development and testing
- User accounts are automatically activated

### Important Notes

⚠️ **Before Production Deployment:**

- **Re-enable email confirmation** in the Supabase dashboard
- Enable email verification for security
- Test the email flow works correctly
- Configure proper email templates

### Current Behavior

With email verification **disabled**:

- `auth.signUp()` creates user AND logs them in immediately
- User can access the app right away
- Faster testing workflow

With email verification **enabled** (default):

- `auth.signUp()` creates user but doesn't log them in
- User must click confirmation link in email
- More secure but slower for testing

### Alternative: Manual Confirmation

If you prefer to keep email verification enabled but want to test:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Find the user you just created
3. Click on the user
4. Manually mark email as confirmed

---

## Additional Testing Tips

### Quick Test User Credentials

For rapid testing, create these test accounts:

```
Manager:
Email: manager@test.com
Password: TestPass123!
Role: manager

Owner:
Email: owner@test.com
Password: TestPass123!
Role: owner

QC Rep:
Email: qc@test.com
Password: TestPass123!
Role: qc_rep
```

### Reset Test Data

To reset your test environment:

1. Delete test users from **Authentication** → **Users**
2. Truncate test data from **Table Editor**
3. Re-run seed data if needed

### Rate Limiting

If you hit "Too many requests" error:

- Wait 5-10 minutes
- Or increase rate limits in Supabase dashboard
- Go to **Settings** → **API** → **Rate Limiting**

---

**Last Updated**: February 27, 2026
