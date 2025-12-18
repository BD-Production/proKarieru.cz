# proKarieru - Log postupu

Chronologicky zaznam vsech provedenych praci.

---

## 2025-12-16

### Implementace Blog/Clanky systemu

Kompletni implementace blogove sekce pro portaly.

#### 1. Databazove schema (SQL migrace)
- Vytvorena migrace `supabase/migrations/add_articles.sql`
- **Nove tabulky:**
  - `article_tags` - tagy pro clanky (per portal, s unique slug)
  - `articles` - hlavni tabulka clanku (title, slug, perex, content v Markdown, featured_image, author, status, OG metadata)
  - `article_gallery` - galerie obrazku k clanku (s caption a razenim)
  - `article_tag_relations` - M:N vazba clanku a tagu
- **Indexy pro vykon:**
  - `idx_articles_portal_status`, `idx_articles_sort`, `idx_articles_published`
  - `idx_article_gallery_article`, `idx_article_tags_portal`
  - `idx_article_tag_relations_article`, `idx_article_tag_relations_tag`
- **RLS policies:**
  - Public read pro publikovane clanky
  - Admin full access pro authenticated users
- **Storage bucket:** `article-images` pro obrazky clanku

#### 2. TypeScript typy
- Rozsiren `src/types/database.ts`:
  - `ArticleTag` - tag clanku
  - `Article` - clanek s vsemi poli
  - `ArticleGalleryImage` - obrazek galerie
  - `ArticleTagRelation` - vazba clanek-tag
  - `ArticleWithTags` - clanek s tagy (joined)
  - `ArticleWithDetails` - clanek s tagy, galerii a portalem
  - `ArticleTagWithCount` - tag s poctem clanku

#### 3. API Endpointy

**Public API (portal):**
- `GET /api/articles` - seznam publikovanych clanku s filtrem podle portalu a tagu
- `GET /api/articles/[slug]` - detail clanku podle slug

**Admin API:**
- `GET/POST /api/admin/articles` - seznam a vytvoreni clanku
- `GET/PUT/DELETE /api/admin/articles/[id]` - CRUD operace pro konkretni clanek
- `POST/PUT /api/admin/articles/[id]/gallery` - upload a aktualizace galerie
- `GET/POST /api/admin/article-tags` - seznam a vytvoreni tagu
- `PUT/DELETE /api/admin/article-tags/[id]` - editace a smazani tagu
- `DELETE /api/admin/article-gallery/[id]` - smazani obrazku z galerie

#### 4. Admin rozhrani
- `/admin/articles` - seznam clanku s filtry podle portalu a statusu (`ArticlesPageClient.tsx`)
- `/admin/articles/new` - formular pro novy clanek
- `/admin/articles/[id]` - editace clanku vcetne galerie
- `/admin/articles/tags` - sprava tagu clanku (`ArticleTagsPageClient.tsx`)
- Pridano "Clanky" do navigace v `Sidebar.tsx`

#### 5. Frontend stranky (portal)
- `/clanky` - seznam clanku s filtrovanim podle tagu
- `/clanky/[slug]` - detail clanku s:
  - OpenGraph metadaty
  - SEO optimalizaci
  - Sdilenim na socialni site
- **Homepage sekce** - max 3 clanky, zobrazi se pouze pokud existuji publikovane clanky

#### 6. React komponenty
- `ArticleImageUpload.tsx` - upload hlavniho obrazku (drag&drop, resize na WebP)
- `ArticleGalleryUpload.tsx` - sprava galerie s drag&drop, caption editace, razeni
- `ArticleContent.tsx` - Markdown rendering s podporou:
  - GitHub Flavored Markdown (remark-gfm)
  - YouTube embed (`::youtube[VIDEO_ID]`)
  - Externi linky v novem tabu
  - Lazy loading obrazku
- `ArticleGallery.tsx` - lightbox galerie s klavesnicovou navigaci a swipe gesty
- `ArticlesSection.tsx` - sekce clanku pro homepage

#### 7. Zavislosti
- `react-markdown` - rendering Markdown obsahu
- `remark-gfm` - podpora GitHub Flavored Markdown

#### 8. Stav implementace
- Build prochazi bez chyb
- Vsechny routes jsou spravne zaregistrovany
- **ZBYVAJICI KROKY:**
  1. Spustit SQL migraci v Supabase Dashboard
  2. Otestovat funkcnost lokalne
  3. Deploy na Vercel

---

## 2025-12-10

### Nova specifikace proStavare Homepage

Pridana nova specifikace `prostavare-homepage-spec.md` ktera meni smer projektu:
- Transformace z "katalogu firem" na "karierniportal"
- Nova homepage s hero sekci, vyhledavanim, kartami firem
- Rozsireni datoveho modelu firem
- Kontaktni formular a trackovani kliku

### Analyza a dokumentace
- Vytvorena detailni analyza `prostavare-homepage-analysis.md`
- Porovnani nove specifikace s aktualnim stavem implementace
- Identifikovany potrebne zmeny v DB schema
- Definovany otevrene otazky k rozhodnuti

### Zjisteni o aktualnim stavu
Pri analyze zjisteno, ze puvodni MVP je prakticky hotove:
- Search v katalogu FUNGUJE (client-side filtrovani)
- Prepinani edici FUNGUJE (URL parametry)
- Carousel EXISTUJE (BrochureCarousel komponenta)
- Portal detection FUNGUJE (middleware + DB dotaz)

**Aktualni stav:** Ceka se na rozhodnuti o smeru - pokracovat v puvodni specifikaci nebo prejit na novou.

---

## 2025-12-07

### Revize roadmapy a identifikace dalsich kroku
- Provedena komplexni analyza TODOs v kodu
- Aktualizovany priority - upload obrazku je jiz HOTOVY (commit ddb15bc)
- Identifikovany 4 hlavni ukoly pro dokonceni MVP:
  1. Portal detection z middleware (hardcoded v `/portal/page.tsx`)
  2. Client-side search v katalogu
  3. Prepinani edici
  4. Carousel pro stranky brozury

### Zjistene TODOs v kodu:
- `src/app/catalog/page.tsx:10` - Portal detection z middleware
- `src/app/portal/page.tsx:6` - Portal detection z middleware
- `src/app/fair/page.tsx:7` - Fair data z databaze
- `src/app/catalog/[companySlug]/page.tsx:84` - Carousel pro stranky

---

## 2025-12-06

### Audit a aktualizace dokumentace
- Provedena komplexni analyza stavu projektu
- Zjisteno, ze projekt je na ~70% MVP (ne PRE-IMPLEMENTACE jak ukazovala stara dokumentace)
- Aktualizovany vsechny roadmap soubory

---

## 2025-12-02 az 2025-12-06

### Kompletni implementace zakladni infrastruktury
- **Next.js 16 projekt** - Plna konfigurace s TypeScript
- **Tailwind CSS 4** - Styling framework
- **shadcn/ui komponenty** - UI knihovna integrovana
- **Vsechny zavislosti** - Nainstalovany a funkcni
- **.env.local** - Supabase credentials nastaveny

### Databazova vrstva (Supabase)
- **SQL schema** - Kompletni v `supabase/schema.sql`
- **9 tabulek** - portals, editions, companies, company_editions, company_pages, fairs, fair_exhibitors, competitions, competition_entries
- **RLS policies** - Row Level Security pro vsechny tabulky
- **Storage bucket** - Pro obrazky (loga, stranky brozur)
- **Seed data** - Prvni portal "proStavare" s testovacimi daty

### Middleware a routing
- **Multi-domain middleware** - Rozpoznani domen a smerovani
- **Supabase klienti** - Client-side i Server-side komponenty
- **TypeScript typy** - Generovane typy pro databazi

### Admin sekce (temer kompletni)
- **Admin layout** - Sidebar, hlavicka, navigace
- **Dashboard** - Prehledova stranka
- **Login stranka** - Supabase Auth
- **Portaly** - List + New + Edit formulare
- **Firmy** - List + New + Edit formulare
- **Edice** - List + New + Edit formulare
- **Prirazeni firem k edicim** - Funkcni UI
- **Upload UI** - Komponenta pro nahravani obrazku (backend TBD)
- **Veletrhy** - Placeholder stranka
- **Souteze** - Placeholder stranka

### Verejne stranky (strukturalne hotove)
- **Landing prokarieru.cz** - Hlavni landing page systemu
- **Portal landing** - Template pro prostavare.cz
- **Katalog homepage** - Grid firem s logy
- **Detail firmy** - Stranka s carousel UI pro stranky brozury
- **Veletrh placeholder** - Zakladni struktura

---

## 2025-12-02

### Inicializace roadmap systemu
- Vytvoreny soubory pro sledovani postupu projektu:
  - `status.md` - aktualni stav projektu
  - `progress-log.md` - tento log
  - `questions.md` - otevrene otazky
  - `milestones.md` - milniky projektu
  - `memory.md` - kontext mezi sessions

### Analyza projektu
- Projekt byl ve fazi PRE-IMPLEMENTACE
- Existovala pouze dokumentace (init.md)
- Specifikace pripravena k implementaci

---

## Sablona pro dalsi zaznamy

```
## YYYY-MM-DD

### [Nazev ukolu/feature]
- Co bylo udelano
- Technicke detaily
- Problemy a jejich reseni
- Navazujici ukoly
```
