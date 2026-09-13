# Mobile.com.bd — full-stack e-commerce storefront

A Bangladeshi phone/gadget store built as a monorepo: a **Next.js 16** storefront
and a separate **Express 5 + MongoDB** API.

```
myproject/
├── frontend/     Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Motion · Auth.js
├── backend/      Express 5 · Mongoose 9 · JWT — routes / controllers / models
└── tools/        HD product-image generator (run from the repo root)
```

---

## 1. Quick start (5 minutes)

You need **Node 20+** and MongoDB — either installed locally or a free
[Atlas](https://www.mongodb.com/atlas) cluster.

### Step 1 — environment files (once)

From the project root:

```bash
npm install
npm run setup
```

That generates `backend/.env` and `frontend/.env.local` with fresh secrets,
including the one value that has to match in both files. Nothing is committed —
both files are git-ignored.

### Step 2 — backend

```bash
cd backend
npm install
npm run seed                  # loads 87 demo products, 23 brands, 7 categories
npm run dev                   # → http://localhost:5000
```

`npm run seed` must succeed before the storefront shows anything. If MongoDB is
not running you get a plain-English message telling you so.

The seed also creates an admin account: `admin@mobile.com.bd` / `admin123`.

### Step 3 — frontend

```bash
cd frontend
npm install
npm run dev                   # → http://localhost:3000
```

### Google sign-in (optional, 2 minutes)

The site runs fine without it — the Google button simply stays hidden and
email/password sign-in works as normal. To turn it on:

1. Open <https://console.cloud.google.com/apis/credentials> → **Create
   credentials → OAuth client ID → Web application**.
2. Authorised **JavaScript origins**: `http://localhost:3000`
   Authorised **redirect URIs**: `http://localhost:3000/api/auth/callback/google`
   (add the Vercel URLs too once you deploy).
3. Paste the client ID and secret into `AUTH_GOOGLE_ID` and
   `AUTH_GOOGLE_SECRET` in `frontend/.env.local`, then restart `npm run dev`.

### Product images

87 HD images ship with the repo in `frontend/public/products/`. To re-render
them, or to generate art for products you add:

```bash
npm install                 # from the repo root — playwright + sharp
npx playwright install chromium
npm run images              # only missing images
npm run images:force        # re-render everything
```

Drop a real photo in as `frontend/public/products/<slug>.webp` and it is used
instead — the generator never overwrites an existing file unless you pass
`--force`.

Open http://localhost:3000. If the API is not running the storefront still
renders — it shows a notice instead of crashing.

---

## 2. What is in the box

**Storefront**

- Home page with a parallax hero, category grid, autoplay carousels, a brand
  marquee and a parallax EMI promo band
- Product listing with URL-driven filters: price range + preset buckets,
  availability, brand (checkboxes **and** the chip row with a searchable
  "More brands" overflow), network, sort and pagination — all facet counts come
  from the API in one round-trip
- Product detail with hover-to-magnify, a pan-and-zoom dialog, specs table,
  tabs and related products
- Product cards with hover zoom, quick-zoom dialog, wishlist and add-to-cart
- Cart and checkout (order is priced server-side, never from the client)
- **Sign in with Google** (Auth.js v5) *and* email/password, both landing on
  the same MongoDB user — one order history either way
- Account area: profile, orders, wishlist; `/account/*` and `/checkout` are
  gated by a proxy redirect
- Login / register / order tracking / EMI page / 12 info pages
- **Dark mode** (light / dark / system) **and a live accent-colour switcher** —
  gold, emerald, azure, crimson, violet. Every colour is a CSS variable, so the
  whole site re-themes in one paint with no flash on reload.
- Fully responsive down to 360px, with a mobile tab bar and filter drawer
- Scroll-reveal animations, a scroll progress bar, a condensing sticky header —
  all of it respects `prefers-reduced-motion`

**API**

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/products` | listing + facet counts (all filters above) |
| GET | `/api/products/featured` | featured carousel |
| GET | `/api/products/deals` | biggest discounts |
| GET | `/api/products/suggest?q=` | search autocomplete |
| GET | `/api/products/:slug` | detail + related |
| GET | `/api/categories` · `/api/brands` | nav + chips, with live counts |
| POST | `/api/auth/register` · `/login` · `/logout` | JWT auth (cookie + bearer) |
| POST | `/api/auth/oauth` | server-to-server: swaps a verified Google identity for our token (shared-secret guarded) |
| GET/PATCH | `/api/auth/me` | profile |
| POST | `/api/orders` | place an order (auth) |
| GET | `/api/orders/my` · `/api/orders/:orderNumber` | order history / tracking |
| GET | `/api/health` | uptime + DB status |

Admin-only `POST/PATCH/DELETE` routes exist for products, brands, categories and
order status.

---

## 3. Deploying to Vercel

Full step-by-step with screenshots of every setting: **[`frontend/DEPLOY.md`](frontend/DEPLOY.md)**
— that file lives inside `frontend/`, so it travels with the repo even if you
push only the storefront.

### Frontend

**Before you push**, from `frontend/`:

```bash
npm run preflight
```

That builds your committed code with Vercel's environment — no `.env.local`, no
shell variables — and tells you if anything is missing. It is the difference
between finding a problem in 40 seconds and finding it in a red deployment.

Then:

1. Push to GitHub.
2. On Vercel → **New Project** → import the repo.
3. **Root Directory** — this depends on what you pushed:
   - pushed the whole monorepo → set it to `frontend`
   - pushed only the `frontend` folder (its `package.json` is at the repo root)
     → leave it as `./`
4. Environment variables (all of them, **Production + Preview + Development**):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url/api` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` |
   | `AUTH_SECRET` | any 32-byte random hex string |
   | `AUTH_BRIDGE_SECRET` | must be identical to the backend's value |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | only if you want Google sign-in |

   `NEXT_PUBLIC_*` values are compiled into the pages, so **changing one means
   redeploying** — restarting is not enough.

5. Add the Vercel URL to your Google OAuth client's origins and redirect URIs
   (`https://your-site.vercel.app/api/auth/callback/google`).
6. Deploy. Framework preset, build command and output are all detected.

### Backend

The backend runs anywhere Node runs. Two good options:

**a) Vercel serverless** — `backend/vercel.json` and `backend/api/index.js` are
already set up. Import the same repo a second time with **Root Directory** =
`backend`, and set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URLS`. The Mongo
connection is cached across invocations in `src/config/db.js`.

**b) Render / Railway / a VPS** — start command `npm start`, same three
environment variables. Better for long-lived connections.

Either way, set `CLIENT_URLS` to your frontend origin (comma-separated for
several). Any `*.vercel.app` preview URL is allowed automatically.

> **Note for Atlas:** add `0.0.0.0/0` to Network Access, otherwise the
> serverless function cannot reach your cluster.

---

## 4. Making it yours

- **Products** — edit `backend/src/seed/data.js` and re-run `npm run seed`, or
  POST to `/api/products` as the admin user.
- **Photos** — see *Product images* above. Products fall back to an inline SVG
  device mock if neither a file nor a URL is set, so nothing ever renders
  blank. Narrow `remotePatterns` in `frontend/next.config.ts` to your real
  image host before going live.
- **Device artwork** — `tools/device-art.mjs` draws every shape (phone,
  feature phone, tablet, watch, band, buds, charger, power bank, case,
  speaker, camera, TV stick, purifier). Brand body colours live at the top of
  that file.
- **Brand colour** — the default gold lives in `frontend/src/app/globals.css`
  (`--brand`, `--brand-strong`, `--brand-soft`). The switcher presets are in
  `frontend/src/lib/site.ts`.
- **Contact details / footer links** — `frontend/src/lib/site.ts`.
- **More shadcn components** — `npx shadcn@latest add <name>` works out of the
  box; `components.json` is configured.

---

## 5. When a change seems to do nothing

Next.js caches compiled pages and fetch results in `frontend/.next`. If a dev
server was running while files changed underneath it, it can keep serving the
old page — which looks exactly like the fix never arrived. Clear it:

```bash
npm run clean          # from the project root
```

Then start the servers again. `npm run dev:clean` inside `frontend/` does the
same thing in one step.

---

## 6. If something looks wrong

| What you see | What it means |
| --- | --- |
| **“Cannot reach the API”** on the products page | The backend is not running, or `NEXT_PUBLIC_API_URL` points somewhere else. Check <http://localhost:5000/api/health>. |
| Products show, but as flat coloured shapes | Those are the built-in SVG mocks. The image files live in `frontend/public/products/` — run `npm run images` from the root if the folder is empty. |
| **“There was a problem with the server configuration”** | `frontend/.env.local` is missing or has no `AUTH_SECRET`. Run `npm run setup` from the root. |
| **“Cannot connect to MongoDB”** | MongoDB is not running, or `MONGODB_URI` in `backend/.env` is wrong. Connecting MongoDB Compass to the same URI is the quickest check. |
| **“Your database has no products yet”** | The API is up but never seeded — run `npm run seed` in `backend/`. |
| **“Cannot reach the API”** on login | The backend is not running. The login form says so explicitly rather than blaming your password. |
| Registered users do not appear in Compass | Connect Compass to the URI from `backend/.env`, then look in the `mobile-shop` database → `users` collection. |

---

## 7. Checks

```bash
cd backend  && npm run check     # 58 assertions: query builder, schemas, auth, routes
cd frontend && npm run build     # type-check + production build
cd frontend && npx eslint src    # clean
```
