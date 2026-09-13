# API “Cannot reach the API” — কী সমস্যা ছিল আর কী ঠিক করা হলো

## আসল কারণ

`backend/server.js` আগে এভাবে চলত:

```
await connectDB();      // ১) আগে MongoDB
app.listen(5000);       // ২) তারপর সার্ভার চালু
```

MongoDB Atlas-এ কানেকশন ফেল করলেই `process.exit(1)` — অর্থাৎ **পোর্ট ৫০০০-এ কেউ
listen-ই করত না**। তাই Next.js ফ্রন্টএন্ড `http://localhost:5000/api` ডাকলে কোনো
উত্তর পেত না এবং “Cannot reach the API” দেখাত। মানে সমস্যা ফ্রন্টএন্ডে নয় —
Atlas কানেকশন ফেল হওয়ায় পুরো API-ই বন্ধ হয়ে যাচ্ছিল।

## যা পরিবর্তন করা হয়েছে

| ফাইল | পরিবর্তন |
|---|---|
| `backend/server.js` | আগে সার্ভার চালু হয়, MongoDB পেছনে কানেক্ট হয় (৫→৩০ সেকেন্ড ব্যবধানে অটো-রিট্রাই)। DB ডাউন থাকলেও API আর মরে না। পোর্ট দখল থাকলে (`EADDRINUSE`) পরিষ্কার বার্তা দেয়। |
| `backend/src/config/db.js` | Atlas-এর `mongodb+srv://` এর SRV DNS lookup এই পিসির DNS-এ ফেল করলে স্বয়ংক্রিয়ভাবে 8.8.8.8 / 1.1.1.1 দিয়ে আবার resolve করে সাধারণ `mongodb://host1,host2,host3/...` URI বানিয়ে কানেক্ট করে। IPv4-first + ভুলের ধরন অনুযায়ী (bad auth / DNS / IP whitelist) আলাদা বাংলা-বান্ধব হিন্ট। |
| `backend/src/routes/index.js` | DB কানেক্ট না থাকলে ডাটা রুট সাথে সাথে `503 DB_NOT_CONNECTED` দেয় (১০ সেকেন্ড ঝুলে থাকে না)। `/api/health` এখন db state, host, dbName দেখায়। |
| `backend/src/config/env.js` | `MONGODB_URI` থেকে বাড়তি quote ছাঁটে, নতুন `DB_TIMEOUT_MS` ও `DNS_SERVERS` সাপোর্ট। |
| `backend/scripts/db-doctor.mjs` (নতুন) | `npm run db:check` — DNS → TCP → হ্যান্ডশেক → auth ধাপে ধাপে টেস্ট করে বলে দেয় ঠিক কোথায় আটকাচ্ছে, আর আপনার পাবলিক IP দেখায় (Atlas whitelist-এর জন্য)। |

## এখন যা করতে হবে (ধাপে ধাপে)

### ১. Atlas-এ IP whitelist (সবচেয়ে বড় কারণ)

MongoDB Atlas → **Network Access** → **Add IP Address** →
**Allow access from anywhere (0.0.0.0/0)** → Confirm। ১ মিনিট অপেক্ষা করুন।

### ২. ডায়াগনসিস চালান

```bash
cd D:\myproject\backend
npm run db:check
```

এটা পরিষ্কার করে বলবে সমস্যা DNS, ফায়ারওয়াল, পাসওয়ার্ড না IP whitelist।

### ৩. ডাটা সিড + সার্ভার চালু

```bash
cd D:\myproject\backend
npm run seed
npm run dev
```

ব্রাউজারে দেখুন: <http://localhost:5000/api/health> →
`"db": "connected"` আসতে হবে।

### ৪. ফ্রন্টএন্ড

```bash
cd D:\myproject\frontend
npm run dev
```

## দুটো env ফাইল হাতে বসাতে হবে

নিরাপত্তার কারণে `.env` / `.env.local` রিমোট টুল দিয়ে লেখা যায় না। প্রজেক্টে
`backend/env.NEW.txt` আর `frontend/env.local.NEW.txt` রেখে দিয়েছি —

* `backend/env.NEW.txt` এর ভেতরের লেখা কপি করে `backend/.env` এ পেস্ট করুন
  (আসল JWT_SECRET + OAUTH_SHARED_SECRET বসানো আছে)।
* `frontend/env.local.NEW.txt` কপি করে নতুন ফাইল `frontend/.env.local` বানান
  (এটা ছাড়া লগইন/রেজিস্টার পেজ NextAuth এরর দেবে)।

দুই ফাইলের `OAUTH_SHARED_SECRET` আর `AUTH_BRIDGE_SECRET` একই থাকতে হবে — আমি
একই ভ্যালু বসিয়ে দিয়েছি।

> নোট: `mongopass.txt` ফাইলে ডাটাবেজের পাসওয়ার্ড প্লেইন টেক্সটে আছে এবং
> `.env`-এর পাসওয়ার্ডও এখন GitHub-এ চলে যেতে পারে। রিপো পাবলিক হলে Atlas →
> Database Access থেকে পাসওয়ার্ড বদলে নেবেন।

## এখনো “Cannot reach the API” দেখালে

1. `http://localhost:5000/api/health` খুলুন।
   * খোলে না → ব্যাকএন্ড টার্মিনাল দেখুন, `npm run dev` চলছে কি না।
   * খোলে কিন্তু `"db": "disconnected"` → `npm run db:check` চালান, উপরের ১ নম্বর ধাপ।
2. ব্যাকএন্ড পোর্ট বদলালে `frontend/.env.local` এর `NEXT_PUBLIC_API_URL`ও বদলান,
   তারপর Next.js রিস্টার্ট (env পরিবর্তন হট-রিলোড হয় না)।
