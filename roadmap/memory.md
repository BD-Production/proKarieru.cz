# proKarieru - Memory (Kontext pro dalsi sessions)

Dulezite informace k zapamatovani mezi sessions.

**Posledni aktualizace:** 2025-12-16

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

**Stav:** AKTIVNI VYVOJ - MVP skoro hotove
**Datum posledni aktualizace:** 2025-12-16

### Co je hotove:
- Kompletni infrastruktura (Next.js, Supabase, middleware)
- Admin sekce (CRUD pro portaly, firmy, edice, CLANKY)
- Verejne stranky (landing, katalog, detail firmy, CLANKY)
- Databaze s 13 tabulkami + RLS + seed data
- Search v katalogu (FUNGUJE!)
- Prepinani edici (FUNGUJE!)
- Carousel stranek (FUNGUJE - BrochureCarousel)
- **NOVE (2025-12-16): Blog/Clanky system**

### Posledni implementace - Blog/Clanky (2025-12-16):
- 4 nove DB tabulky: `article_tags`, `articles`, `article_gallery`, `article_tag_relations`
- Storage bucket `article-images`
- Admin: `/admin/articles` (seznam, new, edit, tags)
- Frontend: `/clanky`, `/clanky/[slug]`
- Komponenty: ArticleContent (Markdown + YouTube), ArticleGallery (lightbox)
- **STAV:** Kod hotovy, ceka na DB migraci

### Dalsi kroky:
1. Spustit SQL migraci `add_articles.sql` v Supabase Dashboard
2. Otestovat funkcnost lokalne
3. Deploy na Vercel

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

### DULEZITE - Stav k 2025-12-16:
- MVP je prakticky HOTOVY (katalog, search, edice, carousel, CLANKY)
- Blog/Clanky system IMPLEMENTOVAN - ceka na DB migraci
- Fair data z DB zustava jako budouci ukol (Faze 2)

### Klicove soubory pro Blog/Clanky:
1. `supabase/migrations/add_articles.sql` - DB migrace (SPUSTIT!)
2. `src/types/database.ts` - TypeScript typy (Article*, ArticleTag*, atd.)
3. `src/app/admin/articles/` - Admin CRUD pro clanky
4. `src/app/clanky/` - Frontend stranky
5. `src/components/ArticleContent.tsx` - Markdown rendering
6. `src/components/ArticleGallery.tsx` - Lightbox galerie

### API Endpointy pro clanky:
**Public:**
- `GET /api/articles` - seznam clanku
- `GET /api/articles/[slug]` - detail clanku

**Admin:**
- `/api/admin/articles` - CRUD clanku
- `/api/admin/article-tags` - CRUD tagu
- `/api/admin/article-gallery` - sprava galerie

### Tech Stack:
- Next.js 16 + React 19
- Tailwind CSS 4
- Supabase (DB + Auth + Storage)
- shadcn/ui komponenty
- react-markdown + remark-gfm (pro clanky)
