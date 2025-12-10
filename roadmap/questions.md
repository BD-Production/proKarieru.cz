# proKarieru - Otevrene otazky

Seznam otazek, ktere potrebuji objasneni pred nebo behem implementace.

**Posledni aktualizace:** 2025-12-10

---

## Aktivni otazky (K ROZHODNUTI)

### 0. SMER PROJEKTU (KRITICKA)
- **Otazka:** Implementovat novou homepage specifikaci nebo dokoncit puvodni MVP?
- **Kontext:** Nova specifikace `prostavare-homepage-spec.md` meni projekt z "katalogu firem" na "karierniportal"
- **Moznosti:**
  a) Dokoncit puvodni MVP (fair data), pak novou homepage
  b) Prejit rovnou na novou specifikaci
  c) Hybridni pristup - zachovat puvodni, pridat novou homepage
- **Status:** K ROZHODNUTI
- **Priorita:** KRITICKA
- **Detaily:** Viz `roadmap/prostavare-homepage-analysis.md`

### 1. DB migrace pro novou specifikaci
- **Otazka:** Jak pridat nova pole do `companies` tabulky?
- **Kontext:** Nova specifikace vyzaduje: location, sectors, opportunities, positions, description, employee_count, years_on_market, benefits, hr_contact
- **Moznosti:**
  a) ALTER TABLE prikazy v Supabase SQL editoru
  b) Nova migrace v `supabase/` slozce
- **Status:** K ROZHODNUTI (zavisi na otazce #0)
- **Priorita:** VYSOKA

### 2. Hero obrazek
- **Otazka:** Je k dispozici autenticka fotka mladych stavaru pro hero sekci?
- **Kontext:** Specifikace pozaduje "ne stock fotky"
- **Status:** CEKA NA ODPOVED
- **Priorita:** STREDNI

### 3. Stranky "Pro firmy" a "O projektu"
- **Otazka:** Existuji tyto stranky nebo je vytvorit?
- **Kontext:** Specifikace je zminuje jako soucasti homepage a footeru
- **Status:** CEKA NA ODPOVED
- **Priorita:** STREDNI

### 4. Lokalni vyvoj - multi-domain
- **Otazka:** Jak resit multi-domain routing lokalne?
- **Reseni:** Upravit `/etc/hosts` nebo `C:\Windows\System32\drivers\etc\hosts`
  - Pridat: `127.0.0.1 localhost katalog.localhost veletrh.localhost admin.localhost`
- **Status:** ZDOKUMENTOVANO (neni treba rozhodovat)

---

## Otazky pro Fazi 2 (Veletrh)

### 5. Ecomail API
- **Otazka:** Jsou k dispozici Ecomail API credentials?
- **Kontext:** Potrebne pro formular soutezi a odeslani do mailing listu
- **Status:** CEKA NA ODPOVED (bude doplneno pozdeji)
- **Priorita:** NIZKA (az pro Fazi 2)

### 6. SVG mapa veletrhu
- **Otazka:** Existuje jiz SVG mapa, nebo ji bude treba vytvorit?
- **Kontext:** Pro interaktivni mapu stanku na veletrhu
- **Status:** CEKA NA ODPOVED
- **Priorita:** NIZKA (az pro Fazi 2)

---

## Zodpovezene otazky

### Upload obrazku - implementace (2025-12-07)
- **Odpoved:** Implementovano v commit ddb15bc "Company logos"
- **Reseni:** Upload primo do Supabase Storage

### Carousel implementace (2025-12-10)
- **Odpoved:** Pouzit BrochureCarousel komponenta (jiz existuje)
- **Soubor:** `src/components/BrochureCarousel.tsx`

### Search funkcionalita (2025-12-10)
- **Odpoved:** Client-side search s URL parametry
- **Soubor:** `src/app/katalog/page.tsx`
- **Implementace:** Funguje real-time s URL sync

### Supabase projekt
- **Odpoved:** Existuje a je pripojen
- **URL:** https://stjedwggzxnglzcleeaw.supabase.co

### Domeny
- **Odpoved:** prokarieru.cz a prostavare.cz jsou zakoupeny

### Vercel + GitHub
- **Odpoved:** K dispozici
- **GitHub repo:** https://github.com/BD-Production/proKarieru.cz.git

### Testovaci obrazky
- **Odpoved:** Jsou k dispozici pro testovani

### Prvni portal
- **Odpoved:** Zacit s prokarieru.cz (admin), pak prostavare.cz

---

## Nove otazky z analyzy 2025-12-06

### 7. Verifikace implementace
- **Otazka:** Byly vsechny implementovane komponenty otestovany v prohlizeci?
- **Kontext:** Dokumentace ukazuje, ze hodne kodu bylo napsano, ale neni jasne, zda vse funguje
- **Status:** K OVERENI
- **Priorita:** VYSOKA

### 8. Supabase schema
- **Otazka:** Bylo SQL schema spusteno v Supabase?
- **Kontext:** Schema existuje v `supabase/schema.sql`, ale neni jasne, zda je databaze vytvorena
- **Status:** K OVERENI
- **Priorita:** VYSOKA

### 9. Seed data
- **Otazka:** Jsou seed data pro proStavare nahrana v databazi?
- **Kontext:** Seed existuje v dokumentaci, ale stav v DB neni znamy
- **Status:** K OVERENI
- **Priorita:** VYSOKA

---

## Postup pri pridavani novych otazek

1. Pridat otazku s jasnym kontextem
2. Urcit prioritu (VYSOKA/STREDNI/NIZKA)
3. Nastavit status (K ROZHODNUTI/CEKA NA ODPOVED/K OVERENI)
4. Po zodpovezeni presunout do sekce "Zodpovezene otazky"
