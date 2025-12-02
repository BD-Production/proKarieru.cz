# proKariéru - Multi-tenant Job Portal System

## Přehled projektu

Systém pro správu více kariérních portálů (prostavare.cz, prostrojare.cz, prochemiky.cz...) z jednoho adminu. Každý portál má katalog firem (digitální verze tištěné brožury) a sekci pro veletrhy práce.

**Klíčový princip:** Jeden Vercel deploy + jedna Supabase instance = neomezený počet portálů.

---

## Architektura domén

```
┌─────────────────────────────────────────────────────────────────────┐
│                        JEDEN VERCEL DEPLOY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  prokarieru.cz            → Landing page (přehled všech portálů)    │
│  admin.prokarieru.cz      → Centrální administrace                  │
│                                                                     │
│  prostavare.cz            → Landing/rozcestník (Katalog + Veletrh)  │
│                             → Job portál (budoucnost)               │
│  katalog.prostavare.cz    → Katalog firem (grid s logy)             │
│  veletrh.prostavare.cz    → Veletrh info + mapa + soutěž            │
│                                                                     │
│  prostrojare.cz           → (budoucí portál - stejná struktura)     │
│  katalog.prostrojare.cz   → ...                                     │
│  veletrh.prostrojare.cz   → ...                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Routování:** Middleware detekuje doménu a směruje na správnou sekci aplikace.

---

## Tech Stack

| Technologie | Účel |
|-------------|------|
| **Next.js 14** (App Router) | Framework - nutný pro multi-domain routing |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI komponenty |
| **Supabase** | PostgreSQL + Storage + Auth |
| **Vercel** | Hosting |
| **Ecomail API** | Email marketing (soutěže) |
| **GA4** | Analytics |

---

## Databázové schéma (Supabase)

```sql
-- ============================================
-- PORTÁLY
-- ============================================
CREATE TABLE portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- "proStavaře"
  slug VARCHAR(50) UNIQUE NOT NULL,     -- "prostavare"
  domain VARCHAR(100) UNIQUE NOT NULL,  -- "prostavare.cz"
  tagline VARCHAR(255),                 -- "Propojujeme stavební firmy s talenty"
  primary_color VARCHAR(7) NOT NULL,    -- "#C34751"
  secondary_color VARCHAR(7),           -- "#6D6F7E"
  logo_url TEXT,
  og_image_url TEXT,                    -- OpenGraph image pro portál
  ga_measurement_id VARCHAR(20),        -- GA4 ID: "G-XXXXXXXXXX"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EDICE (brožury)
-- ============================================
CREATE TABLE editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,           -- "Jaro 2025 Praha"
  year INTEGER NOT NULL,                -- 2025
  season VARCHAR(20),                   -- "spring", "winter", "fall"
  location VARCHAR(100),                -- "Praha", "Brno + Ostrava"
  is_active BOOLEAN DEFAULT false,      -- Aktivní = default zobrazení
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FIRMY (globální entita)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,           -- "Metrostav"
  slug VARCHAR(100) UNIQUE NOT NULL,    -- "metrostav"
  logo_url TEXT,
  og_image_url TEXT,                    -- OpenGraph image (fallback: první stránka brožury)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPOJENÍ FIRMA ↔ EDICE
-- ============================================
CREATE TABLE company_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,      -- Pořadí na homepage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, edition_id)
);

-- ============================================
-- STRÁNKY BROŽURY (obrázky)
-- ============================================
CREATE TABLE company_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_edition_id UUID REFERENCES company_editions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,         -- 1, 2, 3, 4
  image_url TEXT NOT NULL,              -- URL v Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_edition_id, page_number)
);

-- ============================================
-- VELETRHY
-- ============================================
CREATE TABLE fairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,           -- "Veletrh práce pro stavaře 2025"
  date DATE,
  time_start TIME,
  time_end TIME,
  location_name VARCHAR(200),           -- "Výstaviště Praha"
  location_address TEXT,
  description TEXT,
  map_svg_url TEXT,                     -- SVG mapa areálu
  og_image_url TEXT,                    -- OpenGraph image (fallback: portál OG)
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VYSTAVOVATELÉ NA VELETRHU
-- ============================================
CREATE TABLE fair_exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  booth_id VARCHAR(50),                 -- ID stánku v SVG mapě
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fair_id, company_id)
);

-- ============================================
-- SOUTĚŽE
-- ============================================
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,           -- "Vyhraj profifocení"
  description TEXT,
  prize TEXT,                           -- "Profesionální focení s fotografem"
  ecomail_list_id VARCHAR(100),         -- ID listu v Ecomail
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PŘIHLÁŠKY DO SOUTĚŽE
-- ============================================
CREATE TABLE contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  gdpr_consent BOOLEAN DEFAULT true,
  synced_to_ecomail BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, email)
);

-- ============================================
-- INDEXY
-- ============================================
CREATE INDEX idx_editions_portal ON editions(portal_id);
CREATE INDEX idx_editions_active ON editions(portal_id, is_active);
CREATE INDEX idx_company_editions_edition ON company_editions(edition_id);
CREATE INDEX idx_company_editions_company ON company_editions(company_id);
CREATE INDEX idx_company_pages_edition ON company_pages(company_edition_id);
CREATE INDEX idx_fairs_portal ON fairs(portal_id);
CREATE INDEX idx_fair_exhibitors_fair ON fair_exhibitors(fair_id);
CREATE INDEX idx_contest_entries_contest ON contest_entries(contest_id);

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;

-- Public read access pro aktivní obsah
CREATE POLICY "Public read portals" ON portals FOR SELECT USING (is_active = true);
CREATE POLICY "Public read editions" ON editions FOR SELECT USING (true);
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read company_editions" ON company_editions FOR SELECT USING (true);
CREATE POLICY "Public read company_pages" ON company_pages FOR SELECT USING (true);
CREATE POLICY "Public read fairs" ON fairs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read fair_exhibitors" ON fair_exhibitors FOR SELECT USING (true);
CREATE POLICY "Public read contests" ON contests FOR SELECT USING (is_active = true);

-- Public insert pro soutěže
CREATE POLICY "Public insert contest_entries" ON contest_entries FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access portals" ON portals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access editions" ON editions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access companies" ON companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access company_editions" ON company_editions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access company_pages" ON company_pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access fairs" ON fairs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access fair_exhibitors" ON fair_exhibitors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contests" ON contests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contest_entries" ON contest_entries FOR ALL USING (auth.role() = 'authenticated');
```

---

## Struktura projektu

```
src/
├── app/
│   ├── (public)/                       # Veřejné stránky
│   │   ├── landing/                    # prokarieru.cz (hlavní landing)
│   │   │   └── page.tsx
│   │   ├── portal/                     # prostavare.cz (portál landing/rozcestník)
│   │   │   └── page.tsx
│   │   ├── catalog/                    # katalog.prostavare.cz
│   │   │   ├── page.tsx                # Homepage s logy
│   │   │   └── [companySlug]/
│   │   │       └── page.tsx            # Detail firmy
│   │   └── fair/                       # veletrh.prostavare.cz
│   │       ├── page.tsx                # Info o veletrhu
│   │       ├── map/
│   │       │   └── page.tsx            # Interaktivní mapa
│   │       └── contest/
│   │           └── page.tsx            # Soutěž formulář
│   │
│   ├── (admin)/                        # Admin sekce
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin layout s navigací
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── portals/
│   │   │   │   ├── page.tsx            # Seznam portálů
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Detail/edit portálu
│   │   │   ├── editions/
│   │   │   │   ├── page.tsx            # Seznam edicí
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Detail edice
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx            # Seznam firem
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Detail firmy
│   │   │   │       └── editions/
│   │   │   │           └── page.tsx    # Přiřazení k edicím + upload
│   │   │   ├── fairs/
│   │   │   │   ├── page.tsx            # Seznam veletrhů
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Detail veletrhu
│   │   │   │       ├── exhibitors/
│   │   │   │       │   └── page.tsx    # Vystavovatelé
│   │   │   │       └── map/
│   │   │   │           └── page.tsx    # Nastavení mapy
│   │   │   └── contests/
│   │   │       ├── page.tsx            # Seznam soutěží
│   │   │       └── [id]/
│   │   │           ├── page.tsx        # Detail soutěže
│   │   │           └── entries/
│   │   │               └── page.tsx    # Přihlášky
│   │   │
│   ├── api/
│   │   ├── ecomail/
│   │   │   └── sync/
│   │   │       └── route.ts            # Sync s Ecomail
│   │   └── upload/
│   │       └── route.ts                # Upload obrázků
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                             # shadcn/ui komponenty
│   ├── catalog/
│   │   ├── CompanyGrid.tsx             # Grid s logy firem
│   │   ├── CompanyCard.tsx             # Karta firmy
│   │   ├── SearchBar.tsx               # Vyhledávání
│   │   ├── EditionSwitcher.tsx         # Přepínač edicí
│   │   └── PageViewer.tsx              # Carousel stránek brožury
│   ├── fair/
│   │   ├── FairInfo.tsx                # Info o veletrhu
│   │   ├── InteractiveMap.tsx          # SVG mapa s hover efekty
│   │   ├── ExhibitorList.tsx           # Seznam vystavovatelů
│   │   └── ContestForm.tsx             # Formulář soutěže
│   ├── admin/
│   │   ├── Sidebar.tsx                 # Admin navigace
│   │   ├── DataTable.tsx               # Tabulka s daty
│   │   ├── ImageUpload.tsx             # Drag & drop upload
│   │   └── ColorPicker.tsx             # Výběr barvy portálu
│   └── shared/
│       ├── Header.tsx                  # Header s logem portálu
│       ├── Footer.tsx
│       └── PortalProvider.tsx          # Context s daty portálu
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── admin.ts                    # Service role client
│   ├── ecomail.ts                      # Ecomail API wrapper
│   ├── utils.ts                        # Utility funkce
│   └── domain.ts                       # Domain routing logic
│
├── hooks/
│   ├── usePortal.ts                    # Hook pro data portálu
│   ├── useEdition.ts                   # Hook pro aktivní edici
│   └── useCompanies.ts                 # Hook pro firmy
│
├── types/
│   └── database.ts                     # TypeScript typy z Supabase
│
└── middleware.ts                       # Domain routing middleware
```

---

## Middleware - Domain Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Ignoruj statické soubory a API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // prokarieru.cz → landing page
  if (hostname === 'prokarieru.cz' || hostname === 'www.prokarieru.cz') {
    return NextResponse.rewrite(new URL('/landing', request.url))
  }

  // admin.prokarieru.cz → admin sekce
  if (hostname === 'admin.prokarieru.cz') {
    // Admin routes jsou přímo v /admin, nepotřebujeme rewrite
    return NextResponse.next()
  }

  // Extrahuj portál a subdoménu
  // Formát: [subdomena.]portal.cz
  const parts = hostname.replace('www.', '').split('.')
  
  if (parts.length >= 2) {
    const tld = parts.pop() // 'cz'
    const portalSlug = parts.pop() // 'prostavare'
    const subdomain = parts.pop() // 'katalog', 'veletrh', nebo undefined

    // Ulož portal slug do headers pro další použití
    const response = NextResponse.next()
    response.headers.set('x-portal-slug', portalSlug || '')
    response.headers.set('x-subdomain', subdomain || '')

    // katalog.prostavare.cz → /catalog
    if (subdomain === 'katalog') {
      return NextResponse.rewrite(
        new URL(`/catalog${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // veletrh.prostavare.cz → /fair
    if (subdomain === 'veletrh') {
      return NextResponse.rewrite(
        new URL(`/fair${pathname}`, request.url),
        { headers: response.headers }
      )
    }

    // prostavare.cz → /portal (landing page s rozcestníkem, později job portál)
    if (!subdomain) {
      return NextResponse.rewrite(
        new URL(`/portal${pathname}`, request.url),
        { headers: response.headers }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Branding & Design

### Portál: proStavaře

| Prvek | Hodnota |
|-------|---------|
| Primary color | `#C34751` |
| Secondary color | `#6D6F7E` |
| Font | Helvetica Neue LT Pro (fallback: Inter, system) |
| Tagline | "Propojujeme stavební firmy s talenty" |

### Design principy

1. **Minimalistický** - čistý, profesionální, žádné zbytečnosti
2. **Mobile first** - většina traffic z QR kódů v tištěné brožuře
3. **Rychlý** - lazy loading obrázků, optimalizace
4. **Konzistentní** - stejný layout pro všechny portály, jen jiné barvy

---

## Wireframes

### Landing page (prokarieru.cz)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [proKariéru logo]                        │
│                                                             │
│           Propojujeme firmy s talenty                       │
│           napříč průmyslovými obory                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │             │  │             │  │             │        │
│   │ proStavaře  │  │ proStrojaře │  │ proChemiky  │        │
│   │   [logo]    │  │   [logo]    │  │  [coming]   │        │
│   │             │  │             │  │             │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│           Klikni na portál pro vstup →                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Portál landing page (prostavare.cz)

**Referenční design:** https://prostavare.vercel.app/ - toto je SPRÁVNÝ směr.

Hlavní stránka portálu slouží jako rozcestník na jednotlivé sekce (Katalog, Veletrh).

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [proStavaře logo]                       │
│              Propojujeme stavební firmy s talenty           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────┐  ┌─────────────────────────┐ │
│   │                         │  │                         │ │
│   │     📚 Katalog firem    │  │     🎪 Veletrh 2025    │ │
│   │                         │  │                         │ │
│   │   Prohlédněte si firmy  │  │   15. března 2025      │ │
│   │   z naší brožury        │  │   Výstaviště Praha     │ │
│   │                         │  │                         │ │
│   │      [Otevřít →]        │  │      [Více info →]     │ │
│   │                         │  │                         │ │
│   └─────────────────────────┘  └─────────────────────────┘ │
│    → katalog.prostavare.cz      → veletrh.prostavare.cz    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Footer: © 2025 proStavaře | Kontakt | O projektu]        │
└─────────────────────────────────────────────────────────────┘
```

**Chování:**
- Karta "Katalog" → odkaz na katalog.prostavare.cz
- Karta "Veletrh" → odkaz na veletrh.prostavare.cz (zobrazí se jen pokud existuje aktivní veletrh)
- Minimalistický design s barvami portálu
- V budoucnu se zde zobrazí plnohodnotný job portál

---

### Katalog homepage (katalog.prostavare.cz)

Katalog zobrazuje přímo grid s logy firem - žádný další rozcestník.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [proStavaře logo]                       │
│                        Katalog firem                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────┐  ┌─────────────────────┐            │
│     │ Praha 2025      │  │ Brno+Ostrava 2025   │            │
│     │    [active]     │  │                     │            │
│     └─────────────────┘  └─────────────────────┘            │
│              (tabs/přepínač edicí)                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔍 Hledat firmu...                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │           │ │           │ │           │ │           │  │
│  │   [logo]  │ │   [logo]  │ │   [logo]  │ │   [logo]  │  │
│  │           │ │           │ │           │ │           │  │
│  │ Metrostav │ │  STRABAG  │ │  Skanska  │ │ HOCHTIEF  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │           │ │           │ │           │ │           │  │
│  │   [logo]  │ │   [logo]  │ │   [logo]  │ │   [logo]  │  │
│  │           │ │           │ │           │ │           │  │
│  │  Eurovia  │ │  Geosan   │ │ Subterra  │ │    OHL    │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                             │
│                        ... další firmy ...                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Footer: © 2025 proStavaře | Kontakt | ← Zpět na portál]  │
└─────────────────────────────────────────────────────────────┘
```

**Chování:**
- Přepínač edicí nahoře (tabs) - přepne zobrazené firmy
- Search filtruje firmy v reálném čase podle názvu
- Klik na logo → přechod na `katalog.prostavare.cz/metrostav` (detail firmy)
- Grid je responzivní: 4 sloupce desktop, 3 tablet, 2 mobil
- Loga mají hover efekt (mírný zoom nebo stín)
- Minimalistický design - hodně bílého prostoru, čisté linie

### Detail firmy (prostavare.cz/metrostav)

```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Metrostav                        [Praha ▼]            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                                                     │   │
│  │              [STRÁNKA BROŽURY 1/2]                 │   │
│  │                   (webp obrázek)                    │   │
│  │                                                     │   │
│  │                                                     │   │
│  │   [<]                                       [>]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    ● ○                                      │
│                  (page dots)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Veletrh (veletrh.prostavare.cz)

```
┌─────────────────────────────────────────────────────────────┐
│  [logo]  Veletrh práce pro stavaře                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 15. března 2025                                         │
│  📍 Výstaviště Praha, Hala 3                               │
│  🕐 9:00 - 16:00                                            │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   [Mapa areálu]  │  │ [Přihlásit se    │                │
│  │        →         │  │  do soutěže]     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ─────────────────────────────────────────                  │
│  Vystavovatelé:                                             │
│                                                             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                  │
│  │Metrost│ │ STRAB │ │ Skans │ │  ...  │                  │
│  └───────┘ └───────┘ └───────┘ └───────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Admin - Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  [≡] proKariéru Admin                    [user@email.cz ▼] │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  Dashboard │   Dashboard                                    │
│  ─────────│                                                │
│  Portály   │   ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  Edice     │   │ 3       │ │ 45      │ │ 2       │        │
│  Firmy     │   │ Portály │ │ Firmy   │ │ Veletrhy│        │
│  Veletrhy  │   └─────────┘ └─────────┘ └─────────┘        │
│  Soutěže   │                                                │
│            │   Rychlé akce:                                 │
│  ─────────│   [+ Přidat firmu]  [+ Nová edice]             │
│  Odhlásit  │                                                │
│            │   Poslední aktivita:                           │
│            │   • Metrostav - přidány stránky               │
│            │   • Nová edice "Jaro 2025 Praha"              │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

---

## API Endpoints

### Public API (pro web)

```
GET /api/portals
GET /api/portals/[slug]
GET /api/portals/[slug]/editions
GET /api/portals/[slug]/editions/[id]/companies
GET /api/companies/[slug]
GET /api/companies/[slug]/pages?edition=[id]
GET /api/fairs/[portalSlug]/active
GET /api/fairs/[id]/exhibitors
POST /api/contests/[id]/enter
```

### Admin API (autentizované)

```
# Portály
GET    /api/admin/portals
POST   /api/admin/portals
PUT    /api/admin/portals/[id]
DELETE /api/admin/portals/[id]

# Edice
GET    /api/admin/editions
POST   /api/admin/editions
PUT    /api/admin/editions/[id]
DELETE /api/admin/editions/[id]

# Firmy
GET    /api/admin/companies
POST   /api/admin/companies
PUT    /api/admin/companies/[id]
DELETE /api/admin/companies/[id]
POST   /api/admin/companies/[id]/editions      # Přiřazení k edici
DELETE /api/admin/companies/[id]/editions/[eid]
POST   /api/admin/companies/[id]/pages         # Upload stránek

# Veletrhy
GET    /api/admin/fairs
POST   /api/admin/fairs
PUT    /api/admin/fairs/[id]
DELETE /api/admin/fairs/[id]
POST   /api/admin/fairs/[id]/exhibitors
DELETE /api/admin/fairs/[id]/exhibitors/[eid]

# Soutěže
GET    /api/admin/contests
POST   /api/admin/contests
PUT    /api/admin/contests/[id]
GET    /api/admin/contests/[id]/entries
POST   /api/admin/contests/[id]/sync-ecomail

# Upload
POST   /api/admin/upload                       # Supabase Storage
```

---

## Ecomail integrace

```typescript
// lib/ecomail.ts
const ECOMAIL_API_URL = 'https://api2.ecomail.cz'

export async function addSubscriber(
  listId: string,
  email: string,
  name: string,
  tags?: string[]
) {
  const response = await fetch(
    `${ECOMAIL_API_URL}/lists/${listId}/subscribe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Key': process.env.ECOMAIL_API_KEY!,
      },
      body: JSON.stringify({
        subscriber_data: {
          email,
          name,
          tags,
        },
        resubscribe: true,
        update_existing: true,
        trigger_autoresponders: true,
      }),
    }
  )
  
  return response.json()
}
```

---

## Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Ecomail
ECOMAIL_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://prokarieru.cz
```

**Poznámka:** GA4 Measurement ID je uloženo v databázi per portál, ne v env variables.

---

## OpenGraph strategie

### Hierarchie OG images (s fallbacky)

| Stránka | Primární OG | Fallback 1 | Fallback 2 |
|---------|-------------|------------|------------|
| `/metrostav` | `companies.og_image_url` | První stránka brožury | Logo firmy |
| Katalog homepage | `portals.og_image_url` | Logo portálu | - |
| Veletrh | `fairs.og_image_url` | `portals.og_image_url` | Logo portálu |

### Implementace v Next.js

```typescript
// app/(public)/catalog/[companySlug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const company = await getCompany(params.companySlug)
  const portal = await getCurrentPortal()
  
  // Fallback chain: og_image → první stránka → logo
  const ogImage = company.og_image_url 
    || company.pages?.[0]?.image_url 
    || company.logo_url

  return {
    title: `${company.name} | ${portal.name}`,
    description: `${company.name} - kariérní příležitosti`,
    openGraph: {
      title: company.name,
      description: `Kariérní příležitosti ve firmě ${company.name}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: company.name,
      images: ogImage ? [ogImage] : [],
    },
  }
}
```

### Admin UI pro OG images

V adminu bude u každé entity (portál, firma, veletrh):
- Preview jak bude vypadat sdílení na sociálních sítích
- Upload vlastního OG image (doporučená velikost: 1200x630px)
- Možnost použít automatický fallback

---

## GA4 strategie

### Jeden GA4 property per portál

Každý portál má vlastní `ga_measurement_id` v databázi. Výhody:
- Čistá data bez filtrování
- Oddělené přístupy pro partnery
- Různé cíle a konverze per portál

### Implementace

```typescript
// components/shared/Analytics.tsx
'use client'

import Script from 'next/script'
import { usePortal } from '@/hooks/usePortal'

export function Analytics() {
  const { portal } = usePortal()
  
  if (!portal?.ga_measurement_id) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${portal.ga_measurement_id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${portal.ga_measurement_id}');
        `}
      </Script>
    </>
  )
}
```

### Admin UI

V nastavení portálu:
- Input pro GA4 Measurement ID (formát: `G-XXXXXXXXXX`)
- Odkaz na návod jak vytvořit GA4 property
- Volitelné: test spojení

---

## Deployment (Vercel)

### Domény v Vercel dashboardu

```
prokarieru.cz
www.prokarieru.cz
admin.prokarieru.cz

prostavare.cz
www.prostavare.cz
katalog.prostavare.cz
veletrh.prostavare.cz

# Budoucí portály přidáš stejně:
prostrojare.cz
www.prostrojare.cz
katalog.prostrojare.cz
veletrh.prostrojare.cz
```

### vercel.json

```json
{
  "regions": ["fra1"],
  "framework": "nextjs"
}
```

---

## Fáze implementace

### Fáze 1 - MVP (PRIORITA)

1. ✅ Setup Next.js projektu s TypeScript a Tailwind
2. ✅ Supabase setup + databázové schéma
3. ✅ Middleware pro domain routing
4. ✅ Admin login (Supabase Auth)
5. ✅ Admin: CRUD portálů
6. ✅ Admin: CRUD edicí
7. ✅ Admin: CRUD firem + přiřazení k edicím
8. ✅ Admin: Upload stránek brožury
9. ✅ Katalog homepage (grid s logy + search)
10. ✅ Detail firmy (carousel stránek)
11. ✅ Přepínač edicí
12. ✅ Landing page prokarieru.cz

### Fáze 2 - Veletrh (BRZY)

13. ⏳ Admin: CRUD veletrhů
14. ⏳ Admin: Správa vystavovatelů
15. ⏳ Admin: Upload SVG mapy + přiřazení stánků
16. ⏳ Admin: CRUD soutěží
17. ⏳ Veletrh landing page
18. ⏳ Interaktivní mapa (SVG s hover)
19. ⏳ Formulář soutěže + Ecomail integrace
20. ⏳ Admin: Přehled přihlášek

### Fáze 3 - Polish

21. ⏳ GA4 tracking (per portál z DB)
22. ⏳ SEO meta tagy
23. ⏳ OpenGraph images s fallbacky
24. ⏳ Performance optimalizace
25. ⏳ Error handling & loading states

### Fáze 4 - Budoucnost

26. 🔮 Další portály (prostrojare, prochemiky...)
27. 🔮 Job portál funkcionalita
28. 🔮 Firemní účty

---

## Důležité poznámky

1. **PORTÁL LANDING = ROZCESTNÍK** - prostavare.cz má karty "Katalog" a "Veletrh" jako na https://prostavare.vercel.app/. Katalog samotný je na subdoméně katalog.prostavare.cz.

2. **STRÁNKY JSOU OBRÁZKY** - Vše je na webp, nepotřebujeme ukládat kontakty

3. **SLUG JE EDITOVATELNÝ** - Admin může změnit URL firmy

4. **FIRMA = GLOBÁLNÍ** - Jedna firma, více portálů, různý obsah

5. **MOBILE FIRST** - Většina traffic z QR kódů v tištěné brožuře

6. **MINIMALISTICKÝ DESIGN** - Čistý, profesionální, rychlý, hodně bílého prostoru

7. **MULTI-TENANT** - Jeden deploy = všechny portály

8. **OG IMAGES S FALLBACKY** - Firma má vlastní OG, fallback na první stránku brožury

9. **GA4 PER PORTÁL** - Každý portál má vlastní GA4 ID v databázi, ne v env

---

## Příkazy pro setup

```bash
# 1. Vytvoření projektu
npx create-next-app@latest prokarieru --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Závislosti
cd prokarieru
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install embla-carousel-react
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install react-hook-form @hookform/resolvers zod
npm install sonner

# 3. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu table form toast

# 4. Dev server
npm run dev
```

---

## Kontakt

Projekt: proKariéru  
Doména: prokarieru.cz  
První portál: prostavare.cz
