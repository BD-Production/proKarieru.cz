# Blog/Clanky - Dokumentace feature

**Datum implementace:** 2025-12-16
**Posledni aktualizace:** 2025-12-23
**Stav:** DOKONCENO

---

## Prehled

Blogovy system umoznuje spravovat clanky pro kazdy portal zvlast. Clanky podporuji:
- Markdown obsah s GitHub Flavored Markdown
- YouTube video embed (`::youtube[VIDEO_ID]`)
- Video embed z galerie (`::video[URL]`)
- Galerii obrazku a videi s lightboxem
- Tagovani (per portal)
- SEO a OpenGraph metadata

---

## Databazove schema

### Tabulky

```sql
-- article_tags: Tagy pro clanky (per portal)
CREATE TABLE article_tags (
  id UUID PRIMARY KEY,
  portal_id UUID REFERENCES portals(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ,
  UNIQUE(portal_id, slug)
);

-- articles: Hlavni tabulka clanku
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  portal_id UUID REFERENCES portals(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  perex TEXT NOT NULL,
  content TEXT NOT NULL,  -- Markdown format
  featured_image_url TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',  -- draft/published/archived
  sort_order INTEGER DEFAULT 0,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(portal_id, slug)
);

-- article_gallery: Galerie obrazku a videi k clanku
CREATE TABLE article_gallery (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  -- Nove sloupce pro video podporu (2025-12-23):
  media_type VARCHAR(10) DEFAULT 'image',  -- 'image' nebo 'video'
  thumbnail_url TEXT,                       -- nahledovy obrazek pro videa
  duration INTEGER,                         -- delka videa v sekundach
  file_size BIGINT                          -- velikost souboru v bytech
);

-- article_tag_relations: M:N vazba
CREATE TABLE article_tag_relations (
  article_id UUID REFERENCES articles(id),
  tag_id UUID REFERENCES article_tags(id),
  PRIMARY KEY (article_id, tag_id)
);
```

### Migracni soubor

`supabase/migrations/add_articles.sql`

Obsahuje:
- Vytvoreni 4 tabulek
- 7 indexu pro vykon
- RLS policies (public read, admin full access)
- Storage bucket `article-images`
- Storage bucket `article-videos` (pridano 2025-12-23)

---

## API Endpointy

### Public API

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api/articles` | Seznam publikovanych clanku |
| GET | `/api/articles/[slug]` | Detail clanku podle slug |

**Query parametry pro /api/articles:**
- `portal_id` (required) - ID portalu
- `tag` (optional) - slug tagu pro filtrovani
- `limit` (optional) - max pocet clanku

### Admin API

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api/admin/articles` | Seznam vsech clanku |
| POST | `/api/admin/articles` | Vytvoreni noveho clanku |
| GET | `/api/admin/articles/[id]` | Detail clanku |
| PUT | `/api/admin/articles/[id]` | Aktualizace clanku |
| DELETE | `/api/admin/articles/[id]` | Smazani clanku |
| POST | `/api/admin/articles/[id]/gallery` | Upload obrazku do galerie |
| PUT | `/api/admin/articles/[id]/gallery` | Aktualizace galerie (razeni, caption) |
| GET | `/api/admin/article-tags` | Seznam tagu |
| POST | `/api/admin/article-tags` | Vytvoreni tagu |
| PUT | `/api/admin/article-tags/[id]` | Aktualizace tagu |
| DELETE | `/api/admin/article-tags/[id]` | Smazani tagu |
| DELETE | `/api/admin/article-gallery/[id]` | Smazani obrazku z galerie |

---

## Soubory a struktura

### Admin rozhrani

```
src/app/admin/articles/
  page.tsx                    # Server component wrapper
  ArticlesPageClient.tsx      # Client component - seznam clanku
  new/
    page.tsx                  # Formular pro novy clanek
  [id]/
    page.tsx                  # Editace clanku
  tags/
    page.tsx                  # Server wrapper
    ArticleTagsPageClient.tsx # Sprava tagu
```

### Frontend stranky

```
src/app/clanky/
  page.tsx       # Seznam clanku s filtrovanim podle tagu
  [slug]/
    page.tsx     # Detail clanku s OG metadata
```

### Komponenty

```
src/components/
  ArticleContent.tsx       # Markdown rendering + YouTube/Video embed
  ArticleGallery.tsx       # Lightbox galerie (obrazky + videa)
  ArticlesSection.tsx      # Sekce clanku pro homepage
  VideoPlayer.tsx          # HTML5 video prehravac (pridano 2025-12-23)
  admin/
    ArticleImageUpload.tsx   # Upload hlavniho obrazku
    ArticleGalleryUpload.tsx # Sprava galerie (obrazky + videa)
```

### API Routes

```
src/app/api/
  articles/
    route.ts           # GET - public seznam clanku
    [slug]/
      route.ts         # GET - public detail clanku
  admin/
    articles/
      route.ts         # GET/POST - admin seznam a vytvoreni
      [id]/
        route.ts       # GET/PUT/DELETE - admin CRUD
        gallery/
          route.ts     # POST/PUT - sprava galerie
    article-tags/
      route.ts         # GET/POST - tagy
      [id]/
        route.ts       # PUT/DELETE - editace tagu
    article-gallery/
      [id]/
        route.ts       # DELETE - smazani obrazku
```

### TypeScript typy

V `src/types/database.ts`:

```typescript
interface ArticleTag {
  id: string
  portal_id: string
  name: string
  slug: string
  created_at: string
}

interface Article {
  id: string
  portal_id: string
  title: string
  slug: string
  perex: string
  content: string  // Markdown
  featured_image_url: string
  author_name: string
  status: 'draft' | 'published' | 'archived'
  sort_order: number
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

interface ArticleGalleryImage {
  id: string
  article_id: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

interface ArticleTagRelation {
  article_id: string
  tag_id: string
}

// Joined types
interface ArticleWithTags extends Article {
  tags?: ArticleTag[]
}

interface ArticleWithDetails extends Article {
  tags?: ArticleTag[]
  gallery?: ArticleGalleryImage[]
  portal?: Portal
}

interface ArticleTagWithCount extends ArticleTag {
  article_count?: number
}
```

---

## Funkcionalita

### Markdown obsah

Clanek pouziva Markdown s podporou:
- Headings (h1-h6)
- Bold, italic, strikethrough
- Seznamy (ordered, unordered)
- Odkazy (externi se otviraji v novem tabu)
- Obrazky (lazy loading)
- Bloky kodu
- Citace (blockquote)
- Tabulky (GFM)

### YouTube embed

Specialni syntax pro vlozeni YouTube videa:

```markdown
::youtube[VIDEO_ID]
```

Napriklad:
```markdown
::youtube[dQw4w9WgXcQ]
```

### Video embed (pridano 2025-12-23)

Specialni syntax pro vlozeni videa z galerie nebo externiho zdroje:

```markdown
::video[URL]
```

Napriklad:
```markdown
::video[https://example.supabase.co/storage/v1/object/public/article-videos/video.mp4]
```

Pouziva komponentu VideoPlayer s vlastnimi ovladacimi prvky.

### Galerie

- Drag&drop upload obrazku a videi (MP4, WebM do 100MB)
- Editace popisku (caption)
- Razeni pretazenim
- Zobrazeni videi s Play ikonou a delkou
- Lightbox zobrazeni s:
  - Klavesnicova navigace (sipky, Escape)
  - Swipe gesta na mobilu
  - Zoom
  - Video prehravani

### SEO a OpenGraph

Kazdy clanek ma:
- Unikatni slug (per portal)
- Meta title a description
- OpenGraph tagy (title, description, image)
- Twitter Card tagy

Pokud OG pole nejsou vyplnena, pouzije se:
- og_title -> title
- og_description -> perex
- og_image_url -> featured_image_url

---

## Zavislosti

```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x"
}
```

---

## Markdown rendering opravy (2025-12-23)

Implementovane opravy a vylepseni Markdown renderovani:

1. **H1 nadpis** - pridan margin-bottom pro vizualni oddeleni
2. **Seznamy** - pridany bullet points:
   - `ul` pouziva `list-disc`
   - `ol` pouziva `list-decimal`
3. **Odkazy bez protokolu** - automaticka oprava:
   - `[text](www.example.com)` -> `[text](https://www.example.com)`
4. **Odkazy s mezerou** - automaticka oprava:
   - `[text] (url)` -> `[text](url)`
5. **Text v seznamech** - zmena barvy na `text-gray-900` pro lepsi citelnost
6. **Perex** - prvni odstavec zobrazen kurzivou pro vizualni odliseni

Implementace: preprocessing Markdown textu + custom renderers v react-markdown.

---

## Poznamky

- Clanky jsou per-portal (kazdy portal ma sve vlastni clanky a tagy)
- Status workflow: draft -> published -> archived
- Publikovane clanky maji automaticky `published_at` timestamp
- Galerie se automaticky maze pri smazani clanku (ON DELETE CASCADE)
