# proKarieru - Status projektu

**Posledni aktualizace:** 2025-12-06

---

## Aktualni stav: AKTIVNI VYVOJ (~70% MVP)

Projekt je v pokrocile fazi implementace. Mezi 2.12. a 6.12.2025 probehla intenzivni implementace - admin sekce je temer kompletni, verejne stranky jsou strukturalne hotove.

---

## Co existuje a FUNGUJE

| Oblast | Stav | Detail |
|--------|------|--------|
| Next.js 16 projekt | HOTOVO | Plne nakonfigurovany s TypeScript, Tailwind CSS 4, shadcn/ui |
| Supabase databaze | HOTOVO | 9 tabulek, RLS policies, Storage bucket, seed data |
| Middleware routing | HOTOVO | Multi-domain architektura funkcni |
| Supabase klienti | HOTOVO | Client + Server komponenty |
| TypeScript typy | HOTOVO | Typy pro celou databazi |
| Admin layout | HOTOVO | Sidebar, dashboard, navigace |
| Admin login | HOTOVO | Supabase Auth integrace |
| CRUD portalu | HOTOVO | List + New + Edit |
| CRUD firem | HOTOVO | List + New + Edit |
| CRUD edici | HOTOVO | List + New + Edit |
| Prirazeni firem k edicim | HOTOVO | UI hotove |
| Upload UI | HOTOVO | Komponenta pripravena |
| Landing prokarieru.cz | HOTOVO | Verejne dostupna |
| Portal landing | HOTOVO | prostavare.cz template |
| Katalog homepage | HOTOVO | Grid firem s UI |
| Detail firmy | HOTOVO | Stranka s carousel UI |

---

## Co CHYBI do MVP (Faze 1)

| Ukol | Priorita | Poznamka |
|------|----------|----------|
| Upload obrazku do Storage | VYSOKA | API endpoint pro skutecny upload |
| Client-side search | VYSOKA | Filtrovani firem v katalogu |
| Funkcni carousel | STREDNI | Zobrazeni stranek brozury |
| Prepinani edici | STREDNI | Vyber edice v katalogu |

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
| GA4 tracking | NEZAHAJENO |
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

## Odhad do dokonceni MVP

- **Hotovo:** ~70%
- **Zbyvajici prace:** 4 hlavni ukoly (upload, search, carousel, edice)
- **Odhadovana narocnost:** 1-2 dny intenzivni prace

---

## Dalsi kroky (v poradi priority)

1. **Implementovat upload obrazku** - API endpoint pro Supabase Storage
2. **Pridat client-side search** - Filtrovani v katalogu
3. **Zprovoznit carousel** - Prohlizeni stranek brozury
4. **Prepinac edici** - Vyber rocniku/edice v katalogu

Po dokonceni MVP: Zahajit Fazi 2 (Veletrh).
