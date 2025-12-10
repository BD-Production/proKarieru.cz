# proStavaře – Specifikace Homepage

## Shrnutí projektu

proStavaře je kariérní portál zaměřený exkluzivně na stavebnictví. Aktuálně funguje jako digitální verze tištěné brožury – katalog firem s prezentacemi. Cílem je transformace na plnohodnotný jobportál, ale už teď se chceme prezentovat jako jobportál.

## Cílová skupina

- **Kdo:** Studenti VŠ stavebního oboru (různé ročníky)
- **Odkud přichází:** QR kód z tištěné brožury, Instagram
- **Co hledají:** Práci, stáž, trainee program, téma diplomky – mix "jen koukám" až "potřebuju teď"
- **Zařízení:** Převážně mobil (QR kód traffic)

## Unikátní hodnota (USP)

1. **Oborová exkluzivita** – pouze stavebnictví, žádný šum
2. **Od studentů pro studenty** – autenticita, vzájemné porozumění

## Hlavní cíl homepage

Student kontaktuje firmu – a proStavaře to vidí (data pro prokázání hodnoty firmám).

## Konverzní mechanismy

1. **Formulář "Mám zájem"** – student vyplní, data jdou vám, přepošlete firmě
2. **Trackované odkazy** – klik na kontakt firmy jde přes váš redirect

---

## Struktura Homepage

### 1. Hero sekce

#### Nadpis
```
{počet} firem hledá stavaře jako jsi ty
```
- Dynamické číslo z databáze
- Konkrétní + emocionální

#### Podnapis (volitelný)
Krátké vysvětlení projektu, např.:
```
Kariérní portál od studentů stavařiny pro studenty stavařiny.
Najdi svou první práci, stáž nebo téma diplomky.
```

#### Obrázek
- Fotografie mladých stavařů na stavbě / v pracovním prostředí
- Autentické, ne stock fotky
- Podporuje positioning "pro studenty"

#### Vyhledávání
- Jedno textové pole
- Placeholder: "Hledej firmu, pozici nebo obor..."
- Prohledává: názvy firem, typy pozic (Projektant, Stavbyvedoucí...), obory (Pozemní stavby...)
- Enter nebo kliknutí → přesměruje na výsledky / katalog s filtrem

#### CTA tlačítko
```
[Prohlížet firmy]
```
Pro ty, co nechtějí hledat, ale jen brouzdat.

---

### 2. Sekce "O projektu" (krátká)

Řeší problém: "nedostatek informací o projektu"

```
Proč proStavaře?

🎯 Jen stavebnictví – žádné rušivé nabídky z jiných oborů
🎓 Od studentů pro studenty – víme, co hledáš
🏢 Ověřené firmy – spolupracujeme s předními zaměstnavateli v oboru
```

Stručné, 3 body, ikony. Žádné rozsáhlé texty.

---

### 3. Sekce "Firmy v katalogu"

Náhled firem stylizovaný jako "nabídky práce":

```
┌─────────────────────────────────────┐
│ [Logo]  STRABAG                     │
│         Pozemní stavby, Praha       │
│                                     │
│         Hledají: Projektant,        │
│         Trainee program, Diplomka   │
│                                     │
│         [Zobrazit profil →]         │
└─────────────────────────────────────┘
```

- Karty firem (ne jen loga)
- Ukazují klíčové info: co firma dělá, kde působí, koho hledá
- Vypadá to jako jobportál, i když vede na prezentaci firmy

---

### 4. Sekce "Pro firmy" (sekundární CTA)

```
Jste firma a chcete být v katalogu?

Vaše nabídka se dostane k tisícům studentů stavebních oborů.

[Zjistit více →]
```

- Malá sekce před footerem
- Link na stránku s informacemi pro firmy / kontaktní formulář

---

### 5. Footer

- O projektu (link)
- Kontakt
- Instagram
- © 2025 proKariéru

---

## Wireframe (Mobile-first)

```
┌─────────────────────────────────────┐
│  🏗️ proStavaře              [≡]    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    [Fotka mladých           │    │
│  │     stavařů]                │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  32 firem hledá stavaře             │
│  jako jsi ty                        │
│                                     │
│  Kariérní portál od studentů        │
│  stavařiny pro studenty stavařiny.  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔍 Hledej firmu, pozici...  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Prohlížet všechny firmy]          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Proč proStavaře?                   │
│                                     │
│  🎯 Jen stavebnictví                │
│  🎓 Od studentů pro studenty        │
│  🏢 Ověřené firmy                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Firmy, které hledají stavaře       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Logo] STRABAG              │    │
│  │ Pozemní stavby · Praha      │    │
│  │ Trainee, Diplomka           │    │
│  │ [Zobrazit →]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Logo] METROSTAV            │    │
│  │ Dopravní stavby · Brno      │    │
│  │ Plný úvazek, Stáž           │    │
│  │ [Zobrazit →]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Zobrazit všechny firmy →]         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Jste firma?                        │
│  [Chci být v katalogu →]            │
│                                     │
├─────────────────────────────────────┤
│  O projektu · Kontakt · Instagram   │
│  © 2025 proKariéru                  │
└─────────────────────────────────────┘
```

---

## Wireframe (Desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏗️ proStavaře                          [O projektu] [Pro firmy]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────┐    32 firem hledá stavaře                  │
│   │                     │    jako jsi ty                             │
│   │  [Fotka mladých     │                                            │
│   │   stavařů]          │    Kariérní portál od studentů stavařiny   │
│   │                     │    pro studenty stavařiny.                 │
│   │                     │                                            │
│   └─────────────────────┘    ┌────────────────────────────────────┐  │
│                              │ 🔍 Hledej firmu, pozici nebo obor  │  │
│                              └────────────────────────────────────┘  │
│                                                                      │
│                              [Prohlížet všechny firmy]               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     🎯 Jen stavebnictví    🎓 Od studentů      🏢 Ověřené firmy      │
│        Žádný šum              pro studenty        z oboru            │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Firmy, které hledají stavaře                                        │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ STRABAG      │ │ METROSTAV    │ │ SKANSKA      │ │ IP Polná     │ │
│  │ [Logo]       │ │ [Logo]       │ │ [Logo]       │ │ [Logo]       │ │
│  │ Praha        │ │ Brno         │ │ Praha        │ │ Celostátní   │ │
│  │ Trainee...   │ │ Plný úvazek  │ │ Diplomka     │ │ Trainee...   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                      │
│                    [Zobrazit všechny firmy →]                        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│        Jste firma a chcete být v katalogu?                           │
│        [Zjistit více o inzerci →]                                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  © 2025 proKariéru     O projektu · Kontakt · Instagram              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Datový model pro firmy (rozšíření)

Pro zobrazení na homepage potřebuješ u každé firmy:

```typescript
interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  
  // Pro homepage karty
  location: string[];           // ["Praha", "Brno"]
  sectors: string[];            // ["Pozemní stavby", "Projektování"]
  opportunities: string[];      // ["Trainee program", "Diplomka", "Plný úvazek"]
  
  // Pro vyhledávání
  positions: string[];          // ["Projektant", "Stavbyvedoucí", "Přípravář"]
  
  // Pro detail
  description: string;
  employeeCount: string;        // "101-500"
  yearsOnMarket: number;
  benefits: string[];
  hrContact: {
    name: string;
    email: string;
    phone: string;
  }
}
```

---

## Vyhledávání – implementace

### Co se prohledává:
- `name` – název firmy
- `sectors` – obory působení
- `positions` – typy pozic
- `opportunities` – typy příležitostí
- `location` – lokality

### Chování:
1. Student píše do pole
2. Real-time filtrování (debounce 300ms)
3. Výsledky se zobrazují pod polem jako dropdown NEBO
4. Enter přesměruje na stránku katalogu s aplikovaným filtrem

### Příklady:
- "STRABAG" → najde firmu STRABAG
- "Projektant" → najde firmy, které hledají projektanty
- "Praha" → najde firmy působící v Praze
- "Trainee" → najde firmy s trainee programem

---

## Kontaktní formulář (detail firmy)

Na stránce firmy bude formulář:

```
┌─────────────────────────────────────┐
│  Mám zájem o tuto firmu             │
│                                     │
│  Jméno: [_______________]           │
│  Email: [_______________]           │
│  Telefon: [_______________]         │
│  Zpráva: [_______________]          │
│           [_______________]         │
│                                     │
│  [ ] Souhlasím se zpracováním       │
│      osobních údajů                 │
│                                     │
│  [Odeslat zájem]                    │
└─────────────────────────────────────┘
```

### Flow:
1. Student vyplní formulář
2. Data se uloží do databáze (Supabase)
3. Notifikace vám na email
4. Vy přepošlete firmě (nebo automaticky)
5. Firma vidí, že proStavaře přináší leady

---

## Trackování kliků

Každý odkaz na externí kontakt (email, telefon, web firmy) jde přes redirect:

```
/api/track?type=email&company=strabag&redirect=mailto:hr@strabag.cz
```

Loguje se:
- Timestamp
- Firma
- Typ akce (email/phone/web)
- Session ID (anonymní)

---

## Priorita implementace

### Fáze 1 (MVP homepage)
1. Hero sekce s nadpisem, obrázkem, vyhledáváním
2. Sekce "Proč proStavaře"
3. Grid/seznam firem (základní karty)
4. Footer

### Fáze 2 (konverze)
5. Kontaktní formulář na detailu firmy
6. Trackování kliků
7. Admin dashboard pro zobrazení leadů

### Fáze 3 (budoucnost)
8. Fulltextové vyhledávání
9. Email notifikace pro firmy
10. Inzeráty (až budou)

---

## Technické poznámky

- **Framework:** Next.js (Vercel)
- **Databáze:** Supabase
- **Styling:** Tailwind CSS
- **Obrázky:** WebP, optimalizované
- **Mobile-first:** Vždy nejdřív mobil, pak desktop
- **Barvy:** Zachovat branding z brožury (červená jako akcent)

---

## Otevřené otázky

1. **Fotka do hero** – máte k dispozici autentickou fotku mladých stavařů? Nebo použijeme placeholder?
2. **Počet firem** – je to dynamické z DB, nebo hardcoded?
3. **Stránka "Pro firmy"** – existuje, nebo vytvořit?
4. **Stránka "O projektu"** – existuje, nebo vytvořit?
