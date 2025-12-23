# proKarieru - Milniky projektu

Prehled hlavnich milniku a jejich stavu.

**Posledni aktualizace:** 2025-12-23

---

## Faze 1 - MVP (Katalog firem + Blog) - 95% DOKONCENO

**Cil:** Funkcni katalog firem a blog na prostavare.cz s admin rozhranim.

| # | Ukol | Stav | Poznamka |
|---|------|------|----------|
| 1 | Setup Next.js projektu | DOKONCENO | Next.js 16, TypeScript, Tailwind CSS 4 |
| 2 | Supabase setup + DB schema | DOKONCENO | 13 tabulek, RLS, Storage buckets |
| 3 | Middleware pro domain routing | DOKONCENO | Multi-tenant funkcni |
| 4 | Admin login (Supabase Auth) | DOKONCENO | Login stranka hotova |
| 5 | Admin: CRUD portalu | DOKONCENO | List + New + Edit |
| 6 | Admin: CRUD edici | DOKONCENO | List + New + Edit |
| 7 | Admin: CRUD firem + prirazeni k edicim | DOKONCENO | List + New + Edit + prirazeni |
| 8 | Admin: Upload stranek brozury | DOKONCENO | Drag&drop, resize na WebP |
| 9 | Katalog homepage (grid s logy + search) | DOKONCENO | Grid + filtry + search |
| 10 | Detail firmy (carousel stranek) | DOKONCENO | BrochureCarousel komponenta |
| 11 | Prepinac edici | DOKONCENO | URL parametry, filtry |
| 12 | Landing page prokarieru.cz | DOKONCENO | Plne funkcni |
| 13 | Blog/Clanky - DB schema | DOKONCENO | 4 tabulky + video rozsireni |
| 14 | Blog/Clanky - Admin CRUD | DOKONCENO | Clanky + tagy + galerie + videa |
| 15 | Blog/Clanky - Frontend | DOKONCENO | Seznam + detail + homepage sekce |
| 16 | Blog/Clanky - Video podpora | DOKONCENO | VideoPlayer, upload, ::video[] syntax |
| 17 | Blog/Clanky - Markdown opravy | DOKONCENO | H1, seznamy, odkazy, perex kurziva |

**Zbyva:** Testovani, deploy

---

## Faze 2 - Veletrh - NEZAHAJENO

**Cil:** Funkcni veletrh sekce s interaktivni mapou a soutezemi.

| # | Ukol | Stav | Poznamka |
|---|------|------|----------|
| 13 | Admin: CRUD veletrhu | NEZAHAJENO | Placeholder existuje |
| 14 | Admin: Sprava vystavovatelu | NEZAHAJENO | |
| 15 | Admin: Upload SVG mapy + prirazeni stanku | NEZAHAJENO | |
| 16 | Admin: CRUD soutezi | NEZAHAJENO | Placeholder existuje |
| 17 | Veletrh landing page | NEZAHAJENO | Zakladni struktura existuje |
| 18 | Interaktivni mapa (SVG s hover) | NEZAHAJENO | |
| 19 | Formular souteze + Ecomail integrace | NEZAHAJENO | Credentials TBD |
| 20 | Admin: Prehled prihlasek | NEZAHAJENO | |

**Deadline:** Neurcen

---

## Faze 3 - Polish - NEZAHAJENO

**Cil:** Produkcni kvalita, SEO, analytics.

| # | Ukol | Stav |
|---|------|------|
| 21 | GA4 tracking (per portal z DB) | NEZAHAJENO |
| 22 | SEO meta tagy | NEZAHAJENO |
| 23 | OpenGraph images s fallbacky | NEZAHAJENO |
| 24 | Performance optimalizace | NEZAHAJENO |
| 25 | Error handling & loading states | NEZAHAJENO |

---

## Faze 4 - Budoucnost - PLANOVANO

**Cil:** Rozsireni o dalsi portaly a funkcionalitu.

| # | Ukol | Stav |
|---|------|------|
| 26 | Dalsi portaly (prostrojare, prochemiky...) | BUDOUCI |
| 27 | Job portal funkcionalita | BUDOUCI |
| 28 | Firemni ucty | BUDOUCI |

---

## Souhrn postupu

| Faze | Dokonceno | Celkem | Procenta |
|------|-----------|--------|----------|
| Faze 1 - MVP + Blog | 17 | 17 | 100% |
| Faze 2 - Veletrh | 0 | 8 | 0% |
| Faze 3 - Polish | 0 | 5 | 0% |
| Faze 4 - Budoucnost | 0 | 3 | 0% |
| **Celkem** | **17** | **33** | **52%** |

*Pozn: Faze 1 kod kompletni, pripraveno k testovani a deploy

---

## Legenda stavu

- **NEZAHAJENO** - Prace nezacala
- **PROBIHKA** - Aktivne se pracuje
- **ROZPRACOVANO** - Castecne hotovo, chybi dokonceni
- **DOKONCENO** - Hotovo a overeno
- **BLOKOVANO** - Ceka na neco/nekoho
- **BUDOUCI** - Planovano na pozdeji
