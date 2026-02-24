# SEO Blog — Next.js + Supabase

Minimal blog site jo automatically N8N se articles publish karta hai.

---

## Quick Setup (10 minutes)

### 1. Install
```bash
npm install
```

### 2. .env.local fill karo
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
PUBLISH_SECRET=koi-bhi-secret-string-likho
NEXT_PUBLIC_SITE_URL=https://tumhara-blog.vercel.app
```

### 3. Locally test karo
```bash
npm run dev
```
Open: http://localhost:3000

### 4. Vercel pe deploy karo
```bash
npx vercel
```
Environment variables Vercel dashboard mein add karo.

---

## N8N WF5 Publisher Update

Blogger HTTP Request node ko **replace karo** is new HTTP Request se:

| Setting | Value |
|---------|-------|
| Method | POST |
| URL | https://tumhara-blog.vercel.app/api/publish |
| Header: x-publish-secret | tumhara PUBLISH_SECRET value |
| Header: Content-Type | application/json |
| Body | {"article_id": "{{ $json.article_id }}"} |

Response mein `url` field aayega — isko Postgres mein `wp_url` mein save karo.

---

## How it Works

1. N8N WF5 → POST /api/publish → article_id bhejta hai
2. API article Supabase mein dhundti hai
3. status = 'published' update hota hai
4. Live URL return hoti hai
5. Homepage pe article turant dikh jaata hai
