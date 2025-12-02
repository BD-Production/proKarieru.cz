# proKarieru - Memory (Kontext pro dalsi sessions)

Dulezite informace k zapamatovani mezi sessions.

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

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Storage + Auth)
- Vercel
- Ecomail API (pro souteze)

---

## Aktualni stav (aktualizovat prubezne)

**Stav:** PRE-IMPLEMENTACE (jen dokumentace, zadny kod)
**Datum posledni aktualizace:** 2025-12-02

---

## Dulezite odkazy

- Referencni design: https://prostavare.vercel.app/
- Specifikace: `roadmap/init.md`

---

## Rozhodnuti a jejich duvody

*Zde zaznamenavat dulezita rozhodnuti ucinna behem vyvoje.*

1. **Multi-domain routing pres middleware** - Jeden deploy obsluhuje vsechny domeny, middleware smeruje na spravne sekce.

2. **GA4 per portal v DB** - Kazdy portal ma vlastni GA4 ID ulozene v databazi, ne v env variables.

3. **OG images s fallbacky** - Firma ma vlastni OG image, fallback na prvni stranku brozury, pak logo.

---

## Co NIKDY nedelat

1. Nemenit strukturu DB bez aktualizace dokumentace
2. Nepridavat nove portaly bez odpovidajicich DNS zaznamu
3. Nepouzivat hardcoded domeny - vse nacitat z DB

---

## Kontakty a pristupy

*Doplnit az budou k dispozici:*
- Supabase projekt: [TBD]
- Vercel projekt: [TBD]
- Domeny: [TBD]
