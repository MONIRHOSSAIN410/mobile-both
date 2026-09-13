# Deploying this storefront to Vercel

Ten minutes, and most of it is waiting. Work through it in order.

---

## 0. Check it first — 40 seconds

```bash
npm run preflight
```

This builds **your committed code** with **Vercel's environment** — it ignores
`.env.local` and every variable exported in your shell, because Vercel has
neither. Almost every "works locally, fails on Vercel" build is one of two
things, and this catches both:

- a file you edited but never committed (Vercel clones the repo; your working
  folder does not exist there)
- something that only works because `.env.local` was quietly filling it in

If preflight is green, the build will be green on Vercel too.

---

## 1. Root Directory

Vercel needs to be pointed at the folder that holds `package.json`.

| What you pushed to GitHub | Root Directory |
| --- | --- |
| the whole monorepo (`frontend/`, `backend/`, `tools/`) | `frontend` |
| only the storefront (`package.json` sits at the repo root) | `./` — leave it alone |

Getting this wrong fails immediately, before dependencies install, with
*"The specified Root Directory … does not exist"*. If your log gets as far as
`added … packages`, the Root Directory is already right.

---

## 2. Environment variables

**Settings → Environment Variables.** Tick all three environments
(Production, Preview, Development) for each one.

| Name | Value | What breaks without it |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend/api` | No products, no brands — the site calls its own localhost and finds nothing |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` | Wrong canonical URLs in the sitemap and share cards |
| `AUTH_SECRET` | 32 random bytes as hex | Everyone is signed out again on every deploy |
| `AUTH_BRIDGE_SECRET` | the same string as the backend's | Google sign-in cannot create the matching user |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | The Google button stays hidden (email/password still works) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | same |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> `NEXT_PUBLIC_*` values are **compiled into the pages at build time**. After
> adding or changing one you must **redeploy** — Deployments → ⋯ → Redeploy.
> Nothing else picks up the new value.

---

## 3. The backend has to be deployed too

The storefront is only half the project. On its own it deploys fine and shows
an honest "this deployment has no API address" panel instead of products.

Deploy `backend/` separately — Vercel (import the same repo again with Root
Directory `backend`), Render, Railway, or any VPS — and set there:

| Name | Value |
| --- | --- |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | any long random string |
| `AUTH_BRIDGE_SECRET` | **identical** to the frontend's |
| `CLIENT_URLS` | `https://your-site.vercel.app` |

MongoDB Atlas → **Network Access** → add `0.0.0.0/0`, otherwise a serverless
function can never reach your cluster.

Then confirm it by opening `https://your-backend/api/health` in a browser. If
that does not return JSON, no amount of frontend configuration will help.

Seed it once (from your machine, with `MONGODB_URI` pointing at Atlas):

```bash
cd backend && npm run seed
```

---

## 4. When the deployment goes red

Open the failing deployment → **Building** → scroll to the **first** red line.
Everything after it is noise.

| In the log | What it means |
| --- | --- |
| `The specified Root Directory … does not exist` | Section 1 |
| `Module not found: Can't resolve './something'` | That file is not committed, or the case does not match. Vercel's Linux is case-sensitive; Windows is not — `Card.tsx` and `card.tsx` are two different files there. |
| `Type error:` / `Failed to compile` | `npm run preflight` reproduces it locally |
| `npm error code ERESOLVE` | Your `package-lock.json` is out of date. `npm install`, commit the lockfile, push. |
| `JavaScript heap out of memory` | Rare at this size. Settings → set Build Machine to a larger size, or remove `node_modules` from git if it was committed. |
| The log simply stops after `added … packages` | Not a build failure — the page is still streaming, or the step that failed is further down. Reload the deployment page and read to the bottom. |

`npm warn deprecated eslint@…` and `npm warn allow-scripts unrs-resolver@…` are
**warnings, not errors**. Every Next.js 16 project prints them. They never fail
a build — keep scrolling.

---

## 5. It deployed, but something is wrong on the site

| What you see | Cause |
| --- | --- |
| "This deployment has no API address" | `NEXT_PUBLIC_API_URL` missing — set it, then **redeploy** |
| "Cannot reach the API" | The URL is set but the backend is down, or `CLIENT_URLS` on the backend does not include your Vercel URL (CORS) |
| Products listed, but grey SVG shapes instead of photos | `public/products/` was not committed. `git add -f public/products && git commit && git push` |
| Signed out after every deploy | `AUTH_SECRET` is not set — the server log says so in plain English |
| Google button missing | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` not set (by design — a half-configured provider would break every page) |
| `redirect_uri_mismatch` from Google | Add `https://your-site.vercel.app/api/auth/callback/google` to the OAuth client's **Authorised redirect URIs** |
| Logging in returns "server configuration" | The backend is unreachable from Vercel. Check `https://your-backend/api/health`. |

Runtime problems show up in **Vercel → your project → Logs**, not in the build
log. This app writes a plain-sentence explanation there for every one of the
cases above.
