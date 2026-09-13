# Vercel-এ ফ্রন্টএন্ড আর ব্যাকএন্ড কানেক্ট করা

আপনার প্রজেক্টে দুইটা আলাদা অ্যাপ — Next.js স্টোরফ্রন্ট আর Express API।
Vercel-এ এই দুইটা **দুইটা আলাদা প্রজেক্ট** হিসেবে যাবে, ডাটাবেস যাবে MongoDB Atlas-এ।

```
ব্রাউজার  →  frontend (Vercel)  →  backend (Vercel)  →  MongoDB Atlas
                    ↑                      ↑                   ↑
           NEXT_PUBLIC_API_URL       CLIENT_URLS          MONGODB_URI
```

চেইনের একটা লিংক ভাঙলেই সাইটে প্রোডাক্ট আসবে না। তাই **ডান দিক থেকে বামে**
বানাতে হবে — আগে ডাটাবেস, তারপর ব্যাকএন্ড, সবার শেষে ফ্রন্টএন্ড।

---

## ০১ · MongoDB Atlas (ক্লাউড ডাটাবেস)

আপনার কম্পিউটারের MongoDB Vercel থেকে ধরা যাবে না। ফ্রি Atlas ক্লাস্টার লাগবে।

1. <https://cloud.mongodb.com> → **Create → M0 (Free)**
2. **Database Access** → নতুন user, পাসওয়ার্ড কপি করে রাখুন
3. **Network Access** → **Add IP Address** → `0.0.0.0/0`
4. **Connect → Drivers** থেকে connection string কপি করুন

শেষে `/mobile-shop` যোগ করে নিন, নাহলে ডাটা `test` ডাটাবেসে চলে যাবে:

```
mongodb+srv://user:PASSWORD@cluster0.xxxxx.mongodb.net/mobile-shop?retryWrites=true&w=majority
```

> ⚠️ **Network Access না দিলে** Vercel-এর সার্ভার আপনার ক্লাস্টারে পৌঁছাতেই
> পারবে না — API সবসময় `Database unavailable` দেখাবে। এটা সবচেয়ে বেশি হওয়া ভুল।

---

## ০২ · Atlas-এ ডাটা ভরুন (seed)

নিজের কম্পিউটার থেকেই Atlas-এ seed করা যায়। `backend\.env` ফাইলে
`MONGODB_URI` এর জায়গায় উপরের Atlas string বসিয়ে দিন, তারপর:

```bash
cd D:\myproject\backend
npm run seed
```

Compass দিয়ে Atlas-এ কানেক্ট করে দেখে নিন — `mobile-shop` ডাটাবেসে ৮৭টা
প্রোডাক্ট থাকা উচিত। এটা এখনই করুন; ডাটা ছাড়া পরে বোঝা যাবে না সমস্যা কোথায়।

---

## ০৩ · ব্যাকএন্ড GitHub-এ তুলুন

আপনার এখনকার repo `Next_mn` এ **শুধু ফ্রন্টএন্ড** আছে। ব্যাকএন্ডের জন্য
আলাদা repo লাগবে — GitHub-এ নতুন খালি repo বানান, নাম ধরুন `Next_mn_backend`।

```bash
cd D:\myproject\backend
git init
git add .
git commit -m "backend"
git branch -M main
git remote add origin https://github.com/MONIRHOSSAIN410/Next_mn_backend.git
git push -u origin main
```

`backend\.gitignore` এ `node_modules` আর `.env` আগে থেকেই লেখা আছে, তাই
`git add .` নিরাপদ। **`.env` কখনো GitHub-এ দেবেন না।**

---

## ০৪ · Vercel-এ ব্যাকএন্ড ডিপ্লয়

1. <https://vercel.com/new> → `Next_mn_backend` Import করুন
2. **Root Directory** → `./`
3. **Framework Preset** → **Other** (বাকি সেটিং ছুঁবেন না, `vercel.json` সব বলা আছে)
4. Environment Variables — তিনটা এনভায়রনমেন্টেই (Production, Preview, Development) টিক দিন:

| নাম | মান |
| --- | --- |
| `MONGODB_URI` | ধাপ ০১-এর Atlas string |
| `JWT_SECRET` | লম্বা র‍্যান্ডম স্ট্রিং |
| `OAUTH_SHARED_SECRET` | আরেকটা র‍্যান্ডম স্ট্রিং — **কপি করে রাখুন**, ফ্রন্টএন্ডেও লাগবে |
| `CLIENT_URLS` | আপাতত `http://localhost:3000` — ধাপ ০৬-এ ঠিক করব |

র‍্যান্ডম স্ট্রিং বানানোর কমান্ড:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Deploy চাপুন। হয়ে গেলে ব্রাউজারে খুলে দেখুন:

```
https://next-mn-backend.vercel.app/api/health
```

JSON দেখলে ব্যাকএন্ড জীবিত। `"database": "connected"` থাকলে Atlas-ও ঠিক।
**এই URL লিখে রাখুন** — পরের ধাপে লাগবে।

---

## ০৫ · Vercel-এ ফ্রন্টএন্ড ডিপ্লয়

পুশ করার আগে লোকালি একবার চেক:

```bash
cd D:\myproject\frontend
npm run preflight
```

সবুজ হলে push করে Vercel-এ `Next_mn` Import করুন।

- **Root Directory** → `./` — আপনার repo-র রুটেই ফ্রন্টএন্ড আছে, তাই `frontend` লিখবেন **না**
- Framework নিজেই Next.js ধরে নেবে

| নাম | মান |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://next-mn-backend.vercel.app/api` — শেষে **`/api`** দিতে ভুলবেন না |
| `NEXT_PUBLIC_SITE_URL` | `https://next-mn.vercel.app` |
| `AUTH_SECRET` | নতুন র‍্যান্ডম স্ট্রিং — না দিলে প্রতি ডিপ্লয়ে সবাই লগআউট হবে |
| `AUTH_BRIDGE_SECRET` | ব্যাকএন্ডের `OAUTH_SHARED_SECRET` এর **হুবহু** একই |

> ⚠️ **নাম দুইটা আলাদা, মান একটাই।** ফ্রন্টএন্ডে `AUTH_BRIDGE_SECRET`,
> ব্যাকএন্ডে `OAUTH_SHARED_SECRET` — ভেতরের স্ট্রিং একদম এক হতে হবে,
> নাহলে Google লগইন কাজ করবে না।

---

## ০৬ · দুইটাকে একসাথে বাঁধুন

এখন দুইটা URL আছে। শেষ কাজ — একে অন্যকে চেনানো।

**ব্যাকএন্ড প্রজেক্টে ফিরে যান**, `CLIENT_URLS` বদলে ফ্রন্টএন্ডের আসল ঠিকানা দিন,
তারপর **Deployments → ⋯ → Redeploy**:

```
CLIENT_URLS = https://next-mn.vercel.app
```

এটা CORS — ব্রাউজারকে বলা হচ্ছে "এই সাইটটাকে আমার API পড়তে দাও"। না দিলে
প্রোডাক্ট আসবে না, আর Console-এ লাল `CORS` এরর দেখাবে।

**তারপর ফ্রন্টএন্ড প্রজেক্টেও একবার Redeploy দিন।**

> ⚠️ `NEXT_PUBLIC_` দিয়ে শুরু হওয়া ভ্যারিয়েবল **বিল্ডের সময়** কোডের ভেতর বসে যায়।
> তাই মান বদলালে শুধু restart-এ কাজ হবে না — নতুন করে **Redeploy** করতেই হবে।
> এই এক জায়গায় বেশিরভাগ মানুষ আটকায়।

---

## ০৭ · Google লগইন (না চাইলে বাদ দিন)

এটা না করলেও সাইট চলবে — Google বাটনটা শুধু লুকানো থাকবে, ইমেইল-পাসওয়ার্ড
লগইন আগের মতোই কাজ করবে।

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Create credentials → OAuth client ID → Web application**
2. **Authorised JavaScript origins** → `https://next-mn.vercel.app`
3. **Authorised redirect URIs** → `https://next-mn.vercel.app/api/auth/callback/google`
4. ফ্রন্টএন্ডে `AUTH_GOOGLE_ID` আর `AUTH_GOOGLE_SECRET` যোগ করে Redeploy

---

## শেষ চেক

- [ ] Atlas-এ Network Access `0.0.0.0/0` দেওয়া আছে
- [ ] Compass-এ Atlas খুললে `mobile-shop` ডাটাবেসে ৮৭টা প্রোডাক্ট দেখা যায়
- [ ] `https://…backend.vercel.app/api/health` খুললে JSON আসে
- [ ] ব্যাকএন্ডের `CLIENT_URLS` এ ফ্রন্টএন্ডের আসল URL বসানো
- [ ] ফ্রন্টএন্ডের `NEXT_PUBLIC_API_URL` এর শেষে `/api` আছে
- [ ] `AUTH_BRIDGE_SECRET` = `OAUTH_SHARED_SECRET` (হুবহু এক)
- [ ] env বসানোর পর **দুইটা প্রজেক্টই** একবার Redeploy করা হয়েছে

---

## সমস্যা হলে

| যা দেখছেন | কারণ |
| --- | --- |
| "This deployment has no API address" | `NEXT_PUBLIC_API_URL` বসেনি, বা বসিয়ে Redeploy হয়নি |
| "Cannot reach the API" | URL ঠিক, কিন্তু ব্যাকএন্ড সাড়া দিচ্ছে না — আগে `/api/health` দেখুন |
| Console-এ লাল CORS এরর | ব্যাকএন্ডের `CLIENT_URLS` এ আপনার URL নাই (ধাপ ০৬) |
| প্রোডাক্ট আসে, ছবির বদলে ধূসর আকৃতি | `public/products` GitHub-এ যায়নি → `git add -f public/products` |
| "Database unavailable" | Atlas Network Access, নাহলে `MONGODB_URI`-এর পাসওয়ার্ড ভুল |
| Google লগইনে `redirect_uri_mismatch` | redirect URI হুবহু `https://…/api/auth/callback/google` হতে হবে |

বিল্ড ভাঙলে Vercel-এর লগে **প্রথম লাল লাইনটা** খুঁজুন — তার পরের সব লাইন
ওই এক সমস্যারই ফল। `npm warn deprecated` আর `npm warn allow-scripts` এরর না,
শুধু সতর্কবার্তা — ওগুলোতে বিল্ড কখনো ভাঙে না।
