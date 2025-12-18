-- ============================================
-- Prohlizec katalogu - Intro/Outro stranky a poradí firem
-- ============================================

-- ============================================
-- CATALOG_PAGES - Intro a outro stranky katalogu
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('intro', 'outro')),
  page_order INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychle dotazy
CREATE INDEX IF NOT EXISTS idx_catalog_pages_portal_edition ON catalog_pages(portal_id, edition_id);
CREATE INDEX IF NOT EXISTS idx_catalog_pages_type ON catalog_pages(edition_id, type, page_order);

-- ============================================
-- CATALOG_COMPANY_ORDER - Poradí a viditelnost firem v katalogu
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_company_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  order_position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portal_id, edition_id, company_id)
);

-- Index pro rychle dotazy
CREATE INDEX IF NOT EXISTS idx_catalog_company_order_edition ON catalog_company_order(edition_id, order_position);
CREATE INDEX IF NOT EXISTS idx_catalog_company_order_visible ON catalog_company_order(edition_id, is_visible);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE catalog_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_company_order ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read catalog_pages" ON catalog_pages FOR SELECT USING (true);
CREATE POLICY "Public read catalog_company_order" ON catalog_company_order FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access catalog_pages" ON catalog_pages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access catalog_company_order" ON catalog_company_order FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- STORAGE BUCKET pro catalog stranky
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-pages', 'catalog-pages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for catalog-pages
CREATE POLICY "Public read catalog-pages" ON storage.objects
  FOR SELECT USING (bucket_id = 'catalog-pages');

CREATE POLICY "Authenticated upload catalog-pages" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'catalog-pages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated update catalog-pages" ON storage.objects
  FOR UPDATE USING (bucket_id = 'catalog-pages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated delete catalog-pages" ON storage.objects
  FOR DELETE USING (bucket_id = 'catalog-pages' AND auth.uid() IS NOT NULL);
