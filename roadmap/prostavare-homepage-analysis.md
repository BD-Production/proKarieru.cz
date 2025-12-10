# Analyza: proStavare Homepage Specifikace

**Vytvoreno:** 2025-12-10
**Specifikace:** `roadmap/prostavare-homepage-spec.md`

---

## Shrnuti nove specifikace

Nova specifikace definuje transformaci projektu z "katalogu firem" na "karierniportal", kde homepage bude fungovat jako jobportal s vyhledavanim a kartami firem zobrazujicimi pracovni prilezitosti.

### Hlavni zmeny oproti stavajicimu stavu:

| Oblast | Aktualni stav | Nova specifikace |
|--------|---------------|------------------|
| Homepage typ | Rozcestnik (Katalog + Veletrh) | Jobportal s vyhledavanim |
| Firmy karty | Grid s logy | Karty s info (lokace, pozice, prilezitosti) |
| Vyhledavani | Pouze nazev firmy v katalogu | Fulltext: firma, pozice, obor, lokace |
| Hero sekce | Tagline portalu | "{pocet} firem hleda stavare jako jsi ty" |
| Sekundarni CTA | Neexistuje | Sekce "Pro firmy" |
| Kontaktni formular | Neexistuje | "Mam zajem" na detailu firmy |
| Trackovani | Zakladni GA4 | Trackovane odkazy + kontakty |

---

## Porovnani s implementaci

### 1. Portal Landing (`/portal/page.tsx`)

**Aktualni:**
- Rozcestnik s kartami "Katalog firem" a "Veletrh 2025"
- Nacita data z DB (portal podle slug z middleware)
- Minimalisticky design

**Nova specifikace vyzaduje:**
- Hero s dynamickym poctem firem
- Vyhledavaci pole
- Sekci "Proc proStavare" (3 body)
- Grid karet firem (ne log, ale s info o pozicich)
- Sekci "Pro firmy"
- Novy footer

**ZMENA: VELKA** - Uplne novy design a funkcionalita homepage

---

### 2. Katalog (`/katalog/page.tsx`)

**Aktualni:**
- Client-side rendering
- Grid s logy firem
- Filtrovani podle edice (funkcni!)
- Vyhledavani podle nazvu (funkcni!)
- Responzivni grid

**Nova specifikace:**
- Karty firem misto log
- Zobrazovat: lokace, sektory, prilezitosti
- Pokrocilejsi vyhledavani (pozice, obory)

**ZMENA: STREDNI** - Upgrade karet, rozsireni vyhledavani

---

### 3. Detail firmy (`/[companySlug]/page.tsx`)

**Aktualni:**
- Carousel stranek brozury
- Prepinani edici (funkcni)
- Zpetne odkazy

**Nova specifikace pridava:**
- Kontaktni formular "Mam zajem"
- Trackovane odkazy na kontakty firmy
- Mozna nova pole (HR kontakt, benefity, atd.)

**ZMENA: STREDNI** - Pridani formulare a trackovani

---

### 4. Datovy model

**Aktualni `companies` tabulka:**
```sql
- id, name, slug, logo_url, og_image_url, is_active
```

**Nova specifikace vyzaduje rozsireni:**
```typescript
interface Company {
  // Existujici
  id, name, slug, logo_url

  // NOVE - pro homepage karty
  location: string[];        // ["Praha", "Brno"]
  sectors: string[];         // ["Pozemni stavby", "Projektovani"]
  opportunities: string[];   // ["Trainee program", "Diplomka"]
  positions: string[];       // ["Projektant", "Stavbyvedouci"]

  // NOVE - pro detail
  description: string;
  employeeCount: string;
  yearsOnMarket: number;
  benefits: string[];
  hrContact: {
    name: string;
    email: string;
    phone: string;
  }
}
```

**ZMENA: VELKA** - Potreba DB migrace

---

### 5. Nove tabulky potrebne

```sql
-- Kontaktni formulare
CREATE TABLE contact_leads (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  gdpr_consent BOOLEAN,
  created_at TIMESTAMPTZ
);

-- Trackovani kliku
CREATE TABLE click_tracking (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  action_type VARCHAR(50),  -- 'email', 'phone', 'web'
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ
);
```

---

## Prioritizace implementace

### Faze 1 - MVP Homepage (DOPORUCENO ZACIT)

1. **Rozsireni DB schema**
   - Pridat nova pole do `companies`
   - Vytvorit tabulku `contact_leads`
   - Aktualizovat admin formulare

2. **Nova Homepage (`/portal/page.tsx`)**
   - Hero sekce s dynamickym poctem firem
   - Sekce "Proc proStavare"
   - Grid karet firem (ne log)
   - Sekce "Pro firmy"
   - Novy footer

3. **Zakladni vyhledavani**
   - Jedno pole
   - Prohledava nazev firmy (jako ted)
   - Pozdeji rozsirit

### Faze 2 - Konverze

4. **Kontaktni formular**
   - Komponenta na detailu firmy
   - API endpoint pro ulozeni
   - Email notifikace (volitelne)

5. **Trackovani kliku**
   - API endpoint `/api/track`
   - Redirect wrapper pro odkazy
   - Logovani do DB

6. **Admin dashboard pro leady**
   - Prehled kontaktnich formularu
   - Export do CSV
   - Statistiky

### Faze 3 - Polish

7. **Pokrocile vyhledavani**
   - Real-time filtr
   - Prohledavani vsech poli
   - Dropdown s vysledky

8. **Email notifikace**
   - Notifikace pro adminy
   - (Volitelne) notifikace firmam

---

## Otevrene otazky k rozhodnuti

### VYSOKA PRIORITA

1. **Ma se zmenit aktualni portal homepage nebo vytvorit novou?**
   - Moznost A: Prepsat `/portal/page.tsx`
   - Moznost B: Vytvorit `/homepage/page.tsx` a postupne migrovat
   - **Doporuceni:** Moznost A - existujici homepage neni slozita

2. **Jak resit zpetnou kompatibilitu katalogu?**
   - Aktualni katalog funguje dobre pro stary model
   - Nova specifikace ho meni na "nabidky prace"
   - **Doporuceni:** Zachovat katalog jako alternativni view, homepage je nova

3. **DB migrace - jak pridat nova pole?**
   - Potreba: `location`, `sectors`, `opportunities`, `positions`, `hrContact`
   - **Navrh:** SQL migrace + aktualizace TypeScript typu

### STREDNI PRIORITA

4. **Obrazek do hero sekce**
   - Specifikace zminuje "autenticka fotka mladych stavaru"
   - **Otazka:** Je fotka k dispozici, nebo pouzit placeholder?

5. **Stranka "Pro firmy"**
   - Specifikace ji zminuje jako CTA
   - **Otazka:** Existuje, nebo vytvorit novou?

6. **Stranka "O projektu"**
   - Zminena ve footeru
   - **Otazka:** Existuje, nebo vytvorit novou?

---

## Technicke poznamky

### Zachovat:
- Next.js 16 + React 19
- Tailwind CSS 4
- Supabase (DB + Auth + Storage)
- Existujici admin sekce
- Multi-domain middleware

### Pridat:
- Nova DB schema/migrace
- Komponenty pro karty firem
- Kontaktni formular
- API pro trackovani
- Stranky "Pro firmy" a "O projektu"

---

## Doporuceny postup

1. **Nejprve** - Rozhodnout o otevrenych otazkach (zvlaste #1, #2, #3)
2. **Pak** - DB migrace (pridat nova pole)
3. **Pak** - Aktualizovat admin formulare pro nova pole
4. **Pak** - Implementovat novou homepage
5. **Nakonec** - Kontaktni formular a trackovani

---

## Dalsi kroky

Pro pokracovani v implementaci je potreba:

1. Potvrzeni smeru od product ownera
2. Rozhodnuti o otevrenych otazkach
3. Priprava DB migrace
4. Vytvoreni wireframu/designu (nebo pouziti specifikace)

---

**Poznamka:** Tato analyza je zalozena na porovnani specifikace `prostavare-homepage-spec.md` s existujicim kodem projektu ke dni 2025-12-10.
