# proKarieru - Memory (Kontext pro dalsi sessions)

Dulezite informace k zapamatovani mezi sessions.

**Posledni aktualizace:** 2025-12-23

---

## O projektu

**proKarieru** je multi-tenant system pro spravu vicero kariernich portalu z jednoho adminu.

- **Hlavni domena:** prokarieru.cz (landing page)
- **Admin:** admin.prokarieru.cz
- **Prvni portal:** prostavare.cz
  - katalog.prostavare.cz - Katalog firem (digitalni verze tistene brozury)
  - veletrh.prostavare.cz - Informace o veletrhu prace
  - /clanky - Blog/clanky pro portal

**Klicovy princip:** Jeden Vercel deploy + jedna Supabase instance = neomezeny pocet portalu.

---

## Tech Stack

- **Next.js 16** (App Router) - POZOR: Aktualizovano z puvodnich 14!
- **TypeScript**
- **Tailwind CSS 4** - POZOR: Nova verze 4!
- **shadcn/ui**
- **Supabase** (PostgreSQL + Storage + Auth)
- **Vercel**
- **Ecomail API** (pro souteze - credentials TBD)

---

## Aktualni stav

**Stav:** AKTIVNI VYVOJ - MVP 95% hotove
**Datum posledni aktualizace:** 2025-12-23

### Co je hotove:
- Kompletni infrastruktura (Next.js, Supabase, middleware)
- Admin sekce (CRUD pro portaly, firmy, edice, CLANKY)
- Verejne stranky (landing, katalog, detail firmy, CLANKY)
- Databaze s 13 tabulkami + RLS + seed data
- Search v katalogu (FUNGUJE!)
- Prepinani edici (FUNGUJE!)
- Carousel stranek (FUNGUJE - BrochureCarousel)
- Blog/Clanky system (DOKONCENO 2025-12-16)
- **NOVE (2025-12-23): Video podpora v clancich**
- **NOVE (2025-12-23): Opravy Markdown renderovani**

### Posledni implementace - Video + Markdown opravy (2025-12-23):

#### Video podpora:
- SQL migrace pro `article_gallery` (media_type, thumbnail_url, duration, file_size)
- Novy storage bucket `article-videos`
- Nova komponenta `VideoPlayer.tsx`
- Uprava `ArticleGalleryUpload.tsx` - nahravani videi (MP4, WebM, max 100MB)
- Uprava `ArticleContent.tsx` - syntaxe `::video[URL]`
- Uprava `ArticleGallery.tsx` - zobrazeni videi s Play ikonou

#### Markdown opravy:
- H1 nadpis - margin-bottom
- Seznamy - bullet points (disc/decimal)
- Odkazy bez protokolu - automaticka oprava
- Odkazy s mezerou - automaticka oprava
- Text v seznamech - cerna barva
- Perex - kurziva

### Dalsi kroky:
1. Testovani funkcnosti
2. Deploy na Vercel

---

## Dulezite odkazy

- **Referencni design:** https://prostavare.vercel.app/
- **Specifikace:** `roadmap/init.md`
- **Supabase:** https://stjedwggzxnglzcleeaw.supabase.co
- **GitHub:** https://github.com/BD-Production/proKarieru.cz.git
- **Domeny:** prokarieru.cz, prostavare.cz

---

## Struktura projektu

```
D:\dev\proKarieru.cz\
├── src/
│   ├── app/           # Next.js App Router stranky
│   ├── components/    # React komponenty
│   ├── lib/           # Utility, Supabase klienti
│   └── types/         # TypeScript typy
├── supabase/
│   └── schema.sql     # Databazove schema
├── roadmap/           # Projektova dokumentace
└── .env.local         # Supabase credentials
```

---

## Rozhodnuti a jejich duvody

1. **Multi-domain routing pres middleware** - Jeden deploy obsluhuje vsechny domeny, middleware smeruje na spravne sekce.

2. **GA4 per portal v DB** - Kazdy portal ma vlastni GA4 ID ulozene v databazi, ne v env variables.

3. **OG images s fallbacky** - Firma ma vlastni OG image, fallback na prvni stranku brozury, pak logo.

4. **Next.js 16 + Tailwind 4** - Pouzity nejnovejsi verze (upgrade z puvodnich 14/3).

---

## Co NIKDY nedelat

1. Nemenit strukturu DB bez aktualizace dokumentace
2. Nepridavat nove portaly bez odpovidajicich DNS zaznamu
3. Nepouzivat hardcoded domeny - vse nacitat z DB
4. Neprepisovat RLS policies bez pochopeni bezpecnostnich implikaci

---

## Kontakty a pristupy

| Sluzba | URL/Info | Stav |
|--------|----------|------|
| Supabase | https://stjedwggzxnglzcleeaw.supabase.co | Pripojeno |
| GitHub | https://github.com/BD-Production/proKarieru.cz.git | Pripojeno |
| Domeny | prokarieru.cz, prostavare.cz | Zaregistrovany |
| Ecomail | TBD | Ceka na credentials |

---

## Poznámky pro další session

### DULEZITE - Stav k 2025-12-23:
- MVP je na 95% (katalog, search, edice, carousel, CLANKY, VIDEO PODPORA)
- Blog/Clanky system DOKONCEN vcetne video podpory
- Markdown renderovani opraveno a vylepseno
- Fair data z DB zustava jako budouci ukol (Faze 2)

### Klicove soubory pro Blog/Clanky:
1. `supabase/migrations/add_articles.sql` - DB migrace (zakladni tabulky)
2. SQL migrace pro video rozsireni `article_gallery` (media_type, thumbnail_url, duration, file_size)
3. `src/types/database.ts` - TypeScript typy (Article*, ArticleTag*, atd.)
4. `src/app/admin/articles/` - Admin CRUD pro clanky
5. `src/app/clanky/` - Frontend stranky
6. `src/components/ArticleContent.tsx` - Markdown + YouTube + Video rendering
7. `src/components/ArticleGallery.tsx` - Lightbox galerie (obrazky + videa)
8. `src/components/VideoPlayer.tsx` - HTML5 video prehravac (NOVE)
9. `src/components/admin/ArticleGalleryUpload.tsx` - Upload obrazku a videi

### API Endpointy pro clanky:
**Public:**
- `GET /api/articles` - seznam clanku
- `GET /api/articles/[slug]` - detail clanku

**Admin:**
- `/api/admin/articles` - CRUD clanku
- `/api/admin/article-tags` - CRUD tagu
- `/api/admin/article-gallery` - sprava galerie (obrazky + videa)

### Markdown syntaxe v clancich:
- `::youtube[VIDEO_ID]` - YouTube embed
- `::video[URL]` - Video z galerie nebo externi URL (NOVE)

### Tech Stack:
- Next.js 16 + React 19
- Tailwind CSS 4
- Supabase (DB + Auth + Storage)
- shadcn/ui komponenty
- react-markdown + remark-gfm (pro clanky)
