# proKarieru - Memory (Kontext pro dalsi sessions)

Dulezite informace k zapamatovani mezi sessions.

**Posledni aktualizace:** 2025-12-10

---

## O projektu

**proKarieru** je multi-tenant system pro spravu vicero kariernich portalu z jednoho adminu.

- **Hlavni domena:** prokarieru.cz (landing page)
- **Admin:** admin.prokarieru.cz
- **Prvni portal:** prostavare.cz
  - katalog.prostavare.cz - Katalog firem (digitalni verze tistene brozury)
  - veletrh.prostavare.cz - Informace o veletrhu prace

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

**Stav:** ROZHODNUTI O SMERU - Nova specifikace meni projekt
**Datum posledni aktualizace:** 2025-12-10

### Co je hotove:
- Kompletni infrastruktura (Next.js, Supabase, middleware)
- Admin sekce (CRUD pro portaly, firmy, edice)
- Verejne stranky (landing, katalog, detail firmy)
- Databaze s 9 tabulkami + RLS + seed data
- Search v katalogu (FUNGUJE!)
- Prepinani edici (FUNGUJE!)
- Carousel stranek (FUNGUJE - BrochureCarousel)

### NOVA SPECIFIKACE (2025-12-10):
Soubor `prostavare-homepage-spec.md` definuje transformaci na jobportal:
- Nova homepage s hero sekci a vyhledavanim
- Karty firem s pozicemi misto gridu s logy
- Rozsireni DB o nova pole (lokace, sektory, pozice, HR kontakt)
- Kontaktni formular "Mam zajem"
- Trackovani kliku na kontakty

### Klicova otazka k rozhodnuti:
Prejit na novou specifikaci nebo dokoncit puvodni MVP (pouze fair data chybi)?

**Detailni analyza:** `roadmap/prostavare-homepage-analysis.md`

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

### DULEZITE - Stav k 2025-12-10:
- Puvodni MVP je prakticky HOTOVY (search, edice, carousel funguje)
- Jediny zbyvajici ukol z puvodniho MVP: fair data z DB
- NOVA SPECIFIKACE meni smer projektu na jobportal

### Klicove soubory:
1. `roadmap/prostavare-homepage-spec.md` - Nova specifikace (PRECIST!)
2. `roadmap/prostavare-homepage-analysis.md` - Analyza zmien
3. `src/app/portal/page.tsx` - Aktualni homepage (rozcestnik)
4. `src/app/katalog/page.tsx` - Aktualni katalog (grid s logy)

### Pro implementaci nove specifikace potreba:
1. Rozhodnuti o smeru (prejit na novou spec?)
2. DB migrace (nova pole pro firmy)
3. Nova homepage komponenta
4. Kontaktni formular
5. Trackovani kliku

### Tech Stack:
- Next.js 16 + React 19
- Tailwind CSS 4
- Supabase (DB + Auth + Storage)
- shadcn/ui komponenty
