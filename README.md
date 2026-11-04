# NWCMC Chatbot — Next.js + Supabase + Groq (Vercel-ready)

This is the Django `nwcmc_chatbot` project converted to **Next.js 15 (App Router, TypeScript, Tailwind)**.
The database is **Supabase Postgres**, the LLM is **Groq**, and the app is built to deploy on **Vercel**.

Everything the Django app did is still here, on the **same URLs**, so the widget already embedded on
your websites keeps working:

| Django | Next.js |
|---|---|
| `/` chat page | `/` |
| `/api/chat/` (widget), `/api/query/` (chat page) | same, `src/app/api/chat`, `src/app/api/query` |
| `/api/dues/`, `/api/dues/water/` | same, `src/app/api/dues/...` |
| `/widget.js`, `/widget/demo/` | `public/widget.js` (unchanged file), `/widget/demo/` |
| `/admin-login/`, `/admin-logout/` | same |
| `/admin-panel/` (+ `faqs`, `file`, `summary`, `ai-summary`, `url`, `widget`) | same |
| `scheduler` management command (delete chat logs > 20 days) | Vercel Cron → `/api/cron/cleanup/` |
| Django staff user in the DB | `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` env variables |
| `django-cors-headers` | `CORS_ALLOWED_ORIGINS` env variable |
| Django cache rate limiter | Postgres-backed rate limiter (works across serverless instances) |

---

## ⚠️ Do this first: rotate your secrets

The `.env` file inside the Django zip contained a **live Groq API key**, the **database password** and
the **Django secret key**. Treat all of them as exposed:

1. Go to <https://console.groq.com/keys>, **delete the old key and create a new one**.
2. Change the old PostgreSQL password if that server is reachable from outside.
3. Never commit `.env` / `.env.local` to Git (they are already in `.gitignore`).

---

## Step 1 — Create the Supabase project

1. Sign in at <https://supabase.com> → **New project**.
2. Choose a strong **database password** (save it!) and a region. **Mumbai (ap-south-1)** is recommended —
   `vercel.json` pins the Vercel functions to `bom1` (Mumbai) so DB calls are fast. If you pick another
   Supabase region, change `"regions"` in `vercel.json` to the nearest Vercel region.
3. Wait until the project is ready.

## Step 2 — Create the tables

1. Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, paste the whole file and click **Run**.

This creates `chatbot_chatlog`, `chatbot_IVC`, `chatbot_faq`, `chatbot_url`, `chatbot_urlchunk_tbl`
(same names/columns as the Django models) and `chatbot_ratelimit`. It also turns on **Row Level Security**
with no policies, so nobody can read your data through Supabase's public REST API — only this app can,
through its server-side connection string.

*(Alternative: `npm run db:init` does the same from your terminal once `DATABASE_URL` is in `.env.local`.)*

## Step 3 — Get the connection string

Supabase dashboard → **Connect** (top bar) → **Transaction pooler** (port **6543**) → copy the URI:

```
postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

Replace `[YOUR-PASSWORD]` with your DB password. If the password has special characters
(`@ : / # ? %`), URL-encode them (`@` → `%40`, etc.).

> Use the **transaction pooler (6543)** for Vercel. The direct connection (5432) can exhaust connections
> with serverless functions. (The app already disables prepared statements, as the pooler requires.)

## Step 4 (optional) — Move your existing Django data to Supabase

Skip this if you are starting fresh. Otherwise, from a machine that can reach the old server (`10.10.1.13`)
and has the PostgreSQL client tools installed:

```bash
# 1. Export only the data (tables already exist in Supabase from Step 2)
pg_dump -h 10.10.1.13 -U postgres -d db_nwcmc_ai_chatbot \
  --data-only --column-inserts --no-owner \
  -t chatbot_faq -t '"chatbot_IVC"' -t chatbot_url -t chatbot_urlchunk_tbl -t chatbot_chatlog \
  -f data.sql

# 2. Import into Supabase (use the "Session pooler" or "Direct connection" string from Supabase -> Connect)
psql "postgresql://postgres.<ref>:<PASSWORD>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" -f data.sql
```

Then, in the Supabase SQL Editor, reset the ID counters so new rows don't collide with imported ones:

```sql
select setval(pg_get_serial_sequence('public.chatbot_faq','id'),            coalesce(max(id),1)) from public.chatbot_faq;
select setval(pg_get_serial_sequence('public."chatbot_IVC"','id'),          coalesce(max(id),1)) from public."chatbot_IVC";
select setval(pg_get_serial_sequence('public.chatbot_url','id'),            coalesce(max(id),1)) from public.chatbot_url;
select setval(pg_get_serial_sequence('public.chatbot_urlchunk_tbl','id'),   coalesce(max(id),1)) from public.chatbot_urlchunk_tbl;
select setval(pg_get_serial_sequence('public.chatbot_chatlog','id'),        coalesce(max(id),1)) from public.chatbot_chatlog;
```

If the import complains about a column that doesn't exist (e.g. an old `question_embedding` column), remove
that column from the `INSERT` lines in `data.sql` (or re-export with `--inserts` after dropping it).

## Step 5 — Environment variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase transaction-pooler URI from Step 3 |
| `GROQ_API_KEY` | ✅ | **New** Groq key (see the warning above) |
| `GROQ_CHAT_MODEL` | – | Default `openai/gpt-oss-120b` |
| `ADMIN_USERNAME` | ✅ | Admin login name |
| `ADMIN_PASSWORD_HASH` **or** `ADMIN_PASSWORD` | ✅ one of them | Bcrypt hash (recommended) or plain password |
| `ADMIN_SESSION_SECRET` | ✅ | Random string, 32+ chars: `openssl rand -base64 48` |
| `DUES_API_URL`, `DUES_API_URL_WATER` | ✅ for dues | Same two URLs as your old `.env` |
| `CORS_ALLOWED_ORIGINS` | recommended | Sites allowed to embed the widget, comma-separated, e.g. `https://nwcmc.gov.in,https://www.nwcmc.gov.in`. Empty = any site (`*`) |
| `CRON_SECRET` | ✅ | Random string protecting the cleanup job: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | – | Public URL used in the embed snippet (defaults to the current host) |
| `DISPLAY_TIMEZONE` | – | Default `Asia/Kolkata` |

**Create the admin password hash** (recommended over a plain password):

```bash
npm install
npm run hash-password -- "YourStrongPassword"
```

* On **Vercel** paste the printed hash exactly as it is.
* In **`.env.local`** use the second, escaped line the script prints (every `$` becomes `\$`), otherwise Next.js treats `$` as a variable.

## Step 6 — Run it locally

```bash
npm install
cp .env.example .env.local     # then edit the values
npm run dev
```

Open <http://localhost:3000> (chat), <http://localhost:3000/admin-login/> (admin) and
<http://localhost:3000/widget/demo/> (widget demo).

Quick first-run checklist: log in → **FAQ Management** → add a FAQ → ask it on the chat page.

## Step 7 — Deploy to Vercel

1. Push this folder to a new **GitHub** repository (`.env.local` is ignored — do not force-add it).
   ```bash
   git init && git add . && git commit -m "NWCMC chatbot (Next.js)"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. <https://vercel.com/new> → **Import** the repository. Framework is auto-detected as **Next.js**; keep the defaults.
3. Before clicking Deploy, open **Environment Variables** and add every variable from Step 5
   (at minimum `DATABASE_URL`, `GROQ_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`,
   `ADMIN_SESSION_SECRET`, `DUES_API_URL`, `DUES_API_URL_WATER`, `CORS_ALLOWED_ORIGINS`, `CRON_SECRET`).
4. Click **Deploy**.
5. *(Optional)* **Settings → Domains** → add your own domain (e.g. `chatbot.nwcmc.gov.in`).

Prefer the CLI? `npm i -g vercel && vercel` and then `vercel --prod` — add the env vars with `vercel env add`.

> Environment variables are read at build/start time: after changing one in Vercel, **redeploy**.

### Cron job (replaces the Django `scheduler` command)

`vercel.json` already contains a daily job at **21:30 UTC (03:00 IST)** that calls `/api/cron/cleanup/`,
which deletes chat logs older than 20 days. Vercel automatically sends `Authorization: Bearer $CRON_SECRET`,
so just make sure `CRON_SECRET` is set. You can check it under **Project → Settings → Cron Jobs**
(there is a *Run* button to test it).

## Step 8 — Embed the widget on your website

Log in → **Embed Widget** (or `/admin-panel/widget/`) and copy the snippet. It looks like this
(replace the host with your Vercel domain):

```html
<script src="https://YOUR-APP.vercel.app/widget.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    if (window.AIChatbot) {
      window.AIChatbot.init({
        apiUrl: 'https://YOUR-APP.vercel.app/api/chat/',
        theme: { primaryColor: '#2a3864', fontFamily: 'sans-serif' }
      });
    }
  });
</script>
```

Make sure the site that embeds it is listed in `CORS_ALLOWED_ORIGINS`, otherwise the browser will block the chat requests.
If you move from the old Django server to a new domain, update the `src` / `apiUrl` in the embedded snippet once.

---

## Post-deployment checklist

- [ ] `https://<app>/` loads and answers a question
- [ ] `https://<app>/admin-login/` → log in works → dashboard shows counts
- [ ] Add a FAQ and ask it in the chat
- [ ] Upload a small `.txt`/`.pdf` in **File Ingestion** and ask something from it
- [ ] Connect a public URL in **Live URL**
- [ ] **Embed Widget** page shows the chat bubble; the dues flow works from the widget
- [ ] Vercel → **Cron Jobs** shows `/api/cron/cleanup/`
- [ ] Old Groq key deleted, old DB password changed

---

## What is different from the Django version (please read)

* **Upload limit is 4 MB** (was 10 MB). Vercel rejects request bodies above 4.5 MB.
  Uploaded files are **not stored on disk** any more (serverless has no persistent disk); only the extracted text chunks
  go into the database, which is all the chatbot ever used.
* **Admin login** uses the env variables above instead of a Django staff user. Sessions last 8 hours and end when the browser closes.
  There is no Django `/admin/` site; use the Supabase **Table Editor** to browse/edit/delete rows (e.g. to remove an uploaded document).
* **Rate limits are the same** (chat 20/min, dues 10/min, admin login 10/min per IP) but are stored in Postgres so they work across serverless instances.
* **Search behaviour is unchanged**: FAQ → connected website → uploaded documents, keyword based, with the same prompts and the same FAQ similarity scoring.
  The *connected website* used for answers is the most recently added URL, as before.
* **AI Summary** page: each logged message is trimmed (500/600 characters) before being sent to Groq so 500 logs stay within the model's limit.
* **Dates** in the admin panel are shown in `Asia/Kolkata` (the Django project had no `TIME_ZONE` set, so it showed US Central time).
* **Adding a URL** that cannot be fetched is now rejected instead of being saved empty. URLs are checked against private/internal addresses (SSRF) including DNS resolution and redirects.
* **Trailing slashes matter**: use `/api/chat/` (with the slash), exactly as the existing widget does.
* Long operations (uploading a big PDF, syncing a big website, AI summary) can take several seconds; the pages allow up to 60 s.

## Project structure

```
supabase/schema.sql        tables + RLS (run once in Supabase)
vercel.json                region (Mumbai) + daily cleanup cron
public/widget.js           the embeddable widget (unchanged from Django)
src/middleware.ts          protects /admin-panel/*
src/lib/                   db, auth, search, answer (Groq), ingest (PDF/URL), security, rate-limit
src/app/api/               chat, query, dues, dues/water, cron/cleanup
src/app/admin-*/           login, logout, dashboard, FAQs, files, summary, AI summary, URL, widget
src/components/            chat UI, shared admin UI
scripts/                   db-init.mjs, hash-password.mjs
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL is not set` / connection errors | Add the variable in Vercel and **redeploy**; use the **6543** pooler URL; check the password encoding |
| `prepared statement ... already exists` | You are using a pooler string without this app's settings — make sure it's the unmodified code (it sets `prepare: false`) |
| Login says "Server is not configured correctly" | Set `ADMIN_USERNAME`, `ADMIN_SESSION_SECRET` (32+ chars) and one of `ADMIN_PASSWORD_HASH` / `ADMIN_PASSWORD` |
| Admin login always fails with a hash in `.env.local` | Escape `$` as `\$` (use the second line printed by `npm run hash-password`) |
| Chat always answers "I don't have information…" | No FAQ/document/URL matches the words, or `GROQ_API_KEY` is wrong — check Vercel → Logs |
| Widget works on `nwcmc.gov.in` but not elsewhere | Add that site to `CORS_ALLOWED_ORIGINS` and redeploy |
| Dues lookups fail with 502 | The municipal dues servers must be reachable from the internet (Vercel cannot reach private LAN addresses like `10.x.x.x`) |
| Cron returns 401 | `CRON_SECRET` is not set in Vercel |
| "Could not read any content from that URL" | The page must be public HTML; sites that block bots or need JavaScript to render text can't be indexed |
