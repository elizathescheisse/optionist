# Supabase Auth setup for Optionist

Epic: [#90](https://github.com/elizathescheisse/optionist/issues/90) · Project ref: `kogremaqbwrkktemfcim`

## App environment variables

Copy [`.env.example`](../.env.example) to `.env.local`:

| Variable | Where to find it |
|----------|------------------|
| `VITE_SUPABASE_URL` | Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon / publishable key |

Add the same variables in **Vercel → Project → Environment Variables** for production.

Never commit `.env.local` or use the **service_role** key in the frontend.

Without these variables, the app falls back to demo login (`test@test.com` / `test`) so local dev and CI keep working.

## Dashboard: Site URL and redirects

Authentication → URL configuration:

| Setting | Local | Production |
|---------|-------|------------|
| **Site URL** | `http://localhost:5173` | `https://optionist.vercel.app` |
| **Redirect URLs** | `http://localhost:5173/auth/callback` | `https://optionist.vercel.app/auth/callback` |
| | `http://localhost:5173/**` | `https://optionist.vercel.app/**` |

Also allow password-reset landing if you add a dedicated route later:

- `http://localhost:5173/forgot-password`
- `https://optionist.vercel.app/forgot-password`

## Email / password

Authentication → Providers → Email:

- Enable email provider
- Confirm email: your choice (if enabled, unverified users need a confirmation step in the UI)

## Social providers

Enable each provider under Authentication → Providers. Callback URL for all OAuth apps is always:

```
https://kogremaqbwrkktemfcim.supabase.co/auth/v1/callback
```

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client ID (Web)
2. Authorized JavaScript origins: `http://localhost:5173`, `https://optionist.vercel.app`
3. Authorized redirect URI: Supabase callback URL above
4. Paste Client ID + Secret into Supabase Google provider settings

### Apple

Follow [Supabase Apple auth guide](https://supabase.com/docs/guides/auth/social-login/auth-apple).

### Facebook

1. [Meta for Developers](https://developers.facebook.com/) → create app → Facebook Login
2. Valid OAuth redirect URI: Supabase callback URL above
3. Paste App ID + App Secret into Supabase Facebook provider settings

## Identity linking

Supabase links identities with the same email to one user when enabled (Authentication → Providers → settings). Optionist assumes **one profile per auth user**, regardless of sign-in method.

## Verify locally

1. Copy `.env.example` → `.env.local` and add keys
2. `npm run dev`
3. Sign in with email/password or a configured OAuth provider
4. Refresh the page — session should persist
5. Sign out — protected routes should redirect to `/login`

## Related GitHub issues

- #102 Configure Supabase Auth project settings
- #103 Add provider credentials
- #104 Build auth client integration
