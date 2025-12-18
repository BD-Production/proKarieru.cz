-- ============================================
-- MIGRACE: Články/Blog pro portály
-- ============================================

-- ============================================
-- TAGY PRO ČLÁNKY (per portál)
-- ============================================
CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portal_id, slug)
);

-- ============================================
-- ČLÁNKY
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,

  -- Základní údaje
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  perex TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown formát

  -- Obrázky
  featured_image_url TEXT NOT NULL,

  -- Meta
  author_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order INTEGER DEFAULT 0,

  -- OpenGraph override (pokud prázdné, použije se title/perex/featured_image)
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(portal_id, slug)
);

-- ============================================
-- GALERIE OBRÁZKŮ K ČLÁNKU
-- ============================================
CREATE TABLE article_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPOJENÍ ČLÁNKŮ A TAGŮ (M:N)
-- ============================================
CREATE TABLE article_tag_relations (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================
-- INDEXY PRO VÝKON
-- ============================================
CREATE INDEX idx_articles_portal_status ON articles(portal_id, status);
CREATE INDEX idx_articles_sort ON articles(portal_id, sort_order);
CREATE INDEX idx_articles_published ON articles(portal_id, status, published_at DESC);
CREATE INDEX idx_article_gallery_article ON article_gallery(article_id, sort_order);
CREATE INDEX idx_article_tags_portal ON article_tags(portal_id);
CREATE INDEX idx_article_tag_relations_article ON article_tag_relations(article_id);
CREATE INDEX idx_article_tag_relations_tag ON article_tag_relations(tag_id);

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tag_relations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read article_tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public read article_gallery" ON article_gallery FOR SELECT USING (true);
CREATE POLICY "Public read article_tag_relations" ON article_tag_relations FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access article_tags" ON article_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access articles" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access article_gallery" ON article_gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access article_tag_relations" ON article_tag_relations FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET PRO OBRÁZKY ČLÁNKŮ
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for article-images
CREATE POLICY "Public read article-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated upload article-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update article-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete article-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');
