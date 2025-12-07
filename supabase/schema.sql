-- ============================================
-- proKarieru - Databazove schema
-- Spustit v Supabase SQL Editor
-- ============================================

-- ============================================
-- PORTALY
-- ============================================
CREATE TABLE portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  domain VARCHAR(100) UNIQUE NOT NULL,
  tagline VARCHAR(255),
  primary_color VARCHAR(7) NOT NULL DEFAULT '#C34751',
  secondary_color VARCHAR(7),
  logo_url TEXT,
  og_image_url TEXT,
  ga_measurement_id VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EDICE (brozury)
-- ============================================
CREATE TABLE editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  season VARCHAR(20),
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FIRMY (globalni entita)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  og_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPOJENI FIRMA <-> EDICE
-- ============================================
CREATE TABLE company_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, edition_id)
);

-- ============================================
-- STRANKY BROZURY (obrazky)
-- ============================================
CREATE TABLE company_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_edition_id UUID REFERENCES company_editions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_edition_id, page_number)
);

-- ============================================
-- VELETRHY
-- ============================================
CREATE TABLE fairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES portals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  date DATE,
  time_start TIME,
  time_end TIME,
  location_name VARCHAR(200),
  location_address TEXT,
  description TEXT,
  map_svg_url TEXT,
  og_image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VYSTAVOVATELE NA VELETRHU
-- ============================================
CREATE TABLE fair_exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  booth_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fair_id, company_id)
);

-- ============================================
-- SOUTEZE
-- ============================================
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  prize TEXT,
  ecomail_list_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRIHLASKY DO SOUTEZE
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

-- Public read access pro aktivni obsah
CREATE POLICY "Public read portals" ON portals FOR SELECT USING (is_active = true);
CREATE POLICY "Public read editions" ON editions FOR SELECT USING (true);
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read company_editions" ON company_editions FOR SELECT USING (true);
CREATE POLICY "Public read company_pages" ON company_pages FOR SELECT USING (true);
CREATE POLICY "Public read fairs" ON fairs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read fair_exhibitors" ON fair_exhibitors FOR SELECT USING (true);
CREATE POLICY "Public read contests" ON contests FOR SELECT USING (is_active = true);

-- Public insert pro souteze
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

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Spustit v SQL nebo vytvorit v Supabase Dashboard > Storage

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-pages', 'company-pages', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-pages
CREATE POLICY "Public read company-pages" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-pages');

CREATE POLICY "Authenticated upload company-pages" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-pages' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update company-pages" ON storage.objects
  FOR UPDATE USING (bucket_id = 'company-pages' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete company-pages" ON storage.objects
  FOR DELETE USING (bucket_id = 'company-pages' AND auth.role() = 'authenticated');

-- Storage policies for company-logos
CREATE POLICY "Public read company-logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated upload company-logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update company-logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete company-logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

-- ============================================
-- SEED DATA - Prvni portal proStavare
-- ============================================
INSERT INTO portals (name, slug, domain, tagline, primary_color, secondary_color, is_active)
VALUES (
  'proStavare',
  'prostavare',
  'prostavare.cz',
  'Propojujeme stavebni firmy s talenty',
  '#C34751',
  '#6D6F7E',
  true
);

-- Prvni edice
INSERT INTO editions (portal_id, name, year, season, location, is_active, display_order)
SELECT id, 'Jaro 2025 Praha', 2025, 'spring', 'Praha', true, 0
FROM portals WHERE slug = 'prostavare';
