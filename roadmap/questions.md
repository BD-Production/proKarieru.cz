# proKarieru - Otevrene otazky

Seznam otazek, ktere potrebuji objasneni pred nebo behem implementace.

**Posledni aktualizace:** 2025-12-06

---

## Aktivni otazky (K ROZHODNUTI)

### 1. Upload obrazku - implementace
- **Otazka:** Jak presne ma fungovat upload stranek brozury?
- **Kontext:** UI pro upload existuje, ale chybi backend (API endpoint)
- **Moznosti:**
  a) Primy upload do Supabase Storage z klienta
  b) Upload pres Next.js API route (lepsi kontrola, validace)
- **Status:** K ROZHODNUTI
- **Priorita:** VYSOKA (blokuje dokonceni MVP)

### 2. Carousel implementace
- **Otazka:** Jaka knihovna pro carousel stranek brozury?
- **Moznosti:**
  a) Embla Carousel (shadcn/ui doporucuje)
  b) Swiper.js
  c) Vlastni implementace
- **Status:** K ROZHODNUTI
- **Priorita:** STREDNI

### 3. Search funkcionalita
- **Otazka:** Ma byt search real-time nebo s debounce?
- **Kontext:** Katalog muze obsahovat desitky firem
- **Doporuceni:** Debounce 300ms pro lepsi UX
- **Status:** K ROZHODNUTI
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
