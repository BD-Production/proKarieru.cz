# proKarieru - Status projektu

**Posledni aktualizace:** 2025-12-23

---

## Aktualni stav: AKTIVNI VYVOJ

Projekt je v pokrocile fazi implementace (~85% MVP). Prave byly dokonceny vylepseni pro clanky - podpora videi a opravy Markdown renderovani.

---

## Posledni dokoncene prace: Video podpora + Markdown opravy (2025-12-23)

### 1. Implementace nahravani videi do clanku
- SQL migrace pro rozsireni tabulky `article_gallery` (media_type, thumbnail_url, duration, file_size)
- Novy storage bucket `article-videos` pro Supabase
- Nova komponenta `VideoPlayer.tsx` - HTML5 prehravac s vlastnimi ovladacimi prvky
- Uprava `ArticleGalleryUpload.tsx` - podpora nahravani videi (MP4, WebM, max 100MB)
- Uprava `ArticleContent.tsx` - podpora syntaxe `::video[URL]` v Markdown
- Uprava `ArticleGallery.tsx` - zobrazeni videi v galerii s Play ikonou a delkou
- Uprava API endpointu pro galerii

### 2. Opravy Markdown renderovani
- H1 nadpis - pridan margin-bottom
- Seznamy - pridany bullet points (disc/decimal)
- Odkazy bez protokolu - automaticka oprava `[text](www.example.com)` na `[text](https://www.example.com)`
- Odkazy s mezerou - automaticka oprava `[text] (url)` na `[text](url)`
- Text v seznamech - zmenen na cernou barvu (gray-900)
- Perex (prvni odstavec) - pridana kurziva

**Stav:** Kod hotovy, pripraveno k testovani

---

## Predchozi dokoncena feature: Blog/Clanky (2025-12-16)

Kompletni blogovy system pro portaly:
- 4 DB tabulky: `article_tags`, `articles`, `article_gallery`, `article_tag_relations`
- Storage bucket `article-images`
- Admin CRUD pro clanky a tagy
- Public stranky `/clanky` a `/clanky/[slug]`
- Markdown obsah s YouTube embed podporou
- Galerie s lightboxem

**Stav:** DOKONCENO

---

## Co existuje a FUNGUJE

| Oblast | Stav | Detail |
|--------|------|--------|
| Next.js 16 projekt | HOTOVO | Plne nakonfigurovany s TypeScript, Tailwind CSS 4, shadcn/ui |
| Supabase databaze | HOTOVO | 13 tabulek, RLS policies, Storage buckets, seed data |
| Middleware routing | HOTOVO | Multi-domain architektura funkcni |
| Supabase klienti | HOTOVO | Client + Server komponenty |
| TypeScript typy | HOTOVO | Typy pro celou databazi vcetne clanku |
| Admin layout | HOTOVO | Sidebar, dashboard, navigace |
| Admin login | HOTOVO | Supabase Auth integrace |
| CRUD portalu | HOTOVO | List + New + Edit |
| CRUD firem | HOTOVO | List + New + Edit |
| CRUD edici | HOTOVO | List + New + Edit |
| CRUD clanku | HOTOVO | List + New + Edit + Tags + Gallery |
| Prirazeni firem k edicim | HOTOVO | UI hotove |
| Upload UI | HOTOVO | Komponenty pro loga, brozury, clanky |
| Landing prokarieru.cz | HOTOVO | Verejne dostupna |
| Portal landing | HOTOVO | prostavare.cz - rozcestnik |
| Katalog homepage | HOTOVO | Grid firem s logy, filtry funkcni |
| Detail firmy | HOTOVO | Carousel stranek brozury |
| Blog/Clanky | HOTOVO* | Seznam + detail + tagy (*ceka na DB migraci) |

---

## NOVA SPECIFIKACE: proStavare Homepage (2025-12-10)

Nova specifikace (`roadmap/prostavare-homepage-spec.md`) definuje transformaci na jobportal.

### Hlavni zmeny:
1. **Nova homepage** - Hero s poctem firem, vyhledavani, karty firem s pozicemi
2. **Rozsireni DB** - Nova pole pro firmy (lokace, sektory, prilezitosti, HR kontakt)
3. **Kontaktni formular** - "Mam zajem" na detailu firmy
4. **Trackovani** - Sledovani kliku na kontakty firem
5. **Nove stranky** - "Pro firmy", "O projektu"

### Detailni analyza:
Viz `roadmap/prostavare-homepage-analysis.md`

---

## Otevrene otazky (K ROZHODNUTI)

### 1. Smer implementace
**Otazka:** Implementovat novou homepage specifikaci, nebo nejprve dokoncit puvodni MVP?

**Moznosti:**
- A) Dokoncit puvodni MVP (carousel, fair data), pak implementovat novou homepage
- B) Prejit rovnou na novou specifikaci, ignorovat puvodni TODO
- C) Hybridni pristup - zachovat puvodni a pridat novou homepage jako novou cestu

### 2. DB migrace
**Otazka:** Jak pridat nova pole do `companies` tabulky?

**Potrebna pole:**
- `location` (array)
- `sectors` (array)
- `opportunities` (array)
- `positions` (array)
- `description` (text)
- `employee_count` (string)
- `years_on_market` (integer)
- `benefits` (array)
- `hr_contact` (jsonb)

### 3. Obrazek do hero
**Otazka:** Je k dispozici autenticka fotka mladych stavaru pro hero sekci?

### 4. Stranky "Pro firmy" a "O projektu"
**Otazka:** Existuji tyto stranky, nebo je vytvorit?

---

## Puvodni MVP ukoly (POZASTAVENO)

Tyto ukoly byly planovany pred novou specifikaci:

| Ukol | Priorita | Status |
|------|----------|--------|
| Portal detection z middleware | VYSOKA | HOTOVO (overeno v kodu) |
| Client-side search | VYSOKA | HOTOVO (funguje v `/katalog`) |
| Prepinani edici | STREDNI | HOTOVO (funguje v `/katalog`) |
| Carousel pro stranky | STREDNI | HOTOVO (BrochureCarousel) |
| Fair data z DB | NIZKA | NEZAHAJENO |

**Poznamka:** Pri analyze jsem zjistil, ze vetsina puvodniho MVP je vlastne hotova! Search a edice filtry v katalogu fungujici, carousel existuje.

---

## Faze 2 - Veletrh (NEZAHAJENO)

| Ukol | Stav |
|------|------|
| Admin CRUD veletrhu | NEZAHAJENO (placeholder existuje) |
| Sprava vystavovatelu | NEZAHAJENO |
| SVG mapa + stanky | NEZAHAJENO |
| Soutezni formular | NEZAHAJENO |
| Ecomail integrace | NEZAHAJENO (credentials TBD) |

---

## Faze 3 - Polish (NEZAHAJENO)

| Ukol | Stav |
|------|------|
| GA4 tracking | ROZPRACOVANO (komponenta existuje) |
| SEO meta tagy | NEZAHAJENO |
| OpenGraph images | NEZAHAJENO |
| Performance | NEZAHAJENO |
| Error handling | NEZAHAJENO |

---

## Infrastruktura

| Sluzba | Stav | URL/Info |
|--------|------|----------|
| Supabase | PRIPOJENO | https://stjedwggzxnglzcleeaw.supabase.co |
| GitHub | PRIPOJENO | https://github.com/BD-Production/proKarieru.cz.git |
| Domeny | ZAREGISTROVANY | prokarieru.cz, prostavare.cz |
| .env.local | NAKONFIGUROVANO | Supabase credentials nastaveny |

---

## Doporuceny dalsi postup

### Pokud se rozhodnete pro NOVOU SPECIFIKACI:

1. **DB migrace** - Pridat nova pole do `companies`
2. **Admin formulare** - Aktualizovat pro nova pole
3. **Nova homepage** - Implementovat podle specifikace
4. **Kontaktni formular** - Na detailu firmy
5. **Trackovani** - API pro sledovani kliku

### Pokud se rozhodnete DOKONCIT PUVODNI MVP:

1. Fair data z DB (jediny zbyvajici ukol)
2. Pak prejit na novou specifikaci

---

## Soubory k prostudovani

- `roadmap/prostavare-homepage-spec.md` - Nova specifikace homepage
- `roadmap/prostavare-homepage-analysis.md` - Analyza a porovnani s aktualnim stavem
- `roadmap/init.md` - Puvodni specifikace projektu
