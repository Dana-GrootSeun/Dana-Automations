# AGENTS.md — Dana Automations site

Freelance site for Dana Theron (South Africa). Sells small-business admin automation (invoice
reminders, reports, spreadsheets, scheduling) and promo videos. Static site +
Supabase backend for the contact form. Keep claims honest/early-stage; keep it cheap (free tiers).

## Stack & layout
- Dark, minimal, Proxio-inspired. Hero = `assets/hero-orb.webp` (square, spins via CSS).
- No build step, no framework, no dependencies. Edit HTML directly.

## Deploy
GitHub → Cloudflare Workers auto-deploys `main`. Flow: edit → commit → **Dana pushes via
GitHub Desktop** → Cloudflare builds (~2 min) → hard-refresh (Ctrl+Shift+R).
Live: https://dana-automates.therondana65.workers.dev

## Backend (Supabase, project ref `kcgfunowuvfovknqkmuc`, region eu-west-1)
- Table `public.leads`: name,email,phone,service,details,status(new→contacted→quoted→won→lost),
  source,ip,user_agent,created_at. **RLS on, zero policies** = deny-all to anon. Writes only via
  the edge function (service role, bypasses RLS). Don't add anon policies.
- Edge function `submit-lead` (verify_jwt=false, public contact endpoint). Does: honeypot
  (`company` field) → validate email+details → rate limit 3/min/IP → insert → best-effort email
  via Resend. CORS allowlist = the workers.dev origin.
- Contact form in `index.html` POSTs to
  `https://kcgfunowuvfovknqkmuc.supabase.co/functions/v1/submit-lead`.
- Notification email → therondana65@gmail.com (Resend's test sender only delivers to the Resend login,
  which is therondana65), sent from `onboarding@resend.dev`. The PUBLIC address everywhere on the site
  is dana.automates@gmail.com — don't change NOTIFY_TO without a verified Resend domain.
- Keep-alive: `.github/workflows/keepalive.yml` pings Postgres twice a week (free tier pauses after ~7 days).

## Site files
`index.html` (markup only) · `styles.css` · `main.js` · `privacy.html` (POPIA notice + #terms) ·
`_headers` (strict CSP — keep JS/CSS external, no inline `<script>`/`style=`) · `robots.txt` · `sitemap.xml`.
Promo videos live in `assets/video/` (H.264 720p, CRF 28, poster .webp, `preload="none"`).

## Secrets — never in the repo
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` — auto-injected in the edge function.
- `RESEND_API_KEY` — set as a Supabase edge-function secret (Supabase dashboard only). Function no-ops
  email if it's missing.
- Only the Supabase publishable key + public function URL may appear in client code. Nothing else.

## Editing the backend — WARNING
Table + function were deployed directly (Supabase MCP), NOT from a `supabase/` folder in the repo.
Supabase↔GitHub integration is connected but has nothing to deploy. If you add
`supabase/migrations/*`, guard against re-running `create table leads` (it exists) or the
integration deploy will error "already exists".

## Launch checklist (as of last session)
- [ ] Approve + deploy edge-function update (client IP from proxy, drop user_agent, log Resend failures).
- [ ] pg_cron job enforcing the privacy-notice retention (IP after 30 days, stale leads after 12 months).
- [ ] Later: Resend custom domain (stop sending from onboarding@resend.dev).

## Preferences
Honest, early-stage tone (starter prices in ZAR, no fake clients/logos). Non-technical, sequential
instructions for Dana. Commit changes; Dana does the final push.
