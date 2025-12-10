-- ============================================
-- Migrace: Pridani novych poli pro Homepage
-- proKarieru - 2025-12-10
-- ============================================

-- ============================================
-- ROZSIRENI COMPANIES TABULKY
-- ============================================

-- Lokace firmy (pole stringu)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT[] DEFAULT '{}';

-- Sektory/obory pusobnosti
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT '{}';

-- Typy prilezitosti (Trainee, Diplomka, Plny uvazek, Staz)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS opportunities TEXT[] DEFAULT '{}';

-- Typy pozic ktere firma hleda (Projektant, Stavbyvedouci, Pripravar)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS positions TEXT[] DEFAULT '{}';

-- Kratky popis firmy
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;

-- Pocet zamestnancu (napr. "101-500")
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50);

-- Roky na trhu
ALTER TABLE companies ADD COLUMN IF NOT EXISTS years_on_market INTEGER;

-- Benefity
ALTER TABLE companies ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- HR kontakt (JSONB pro flexibilitu)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_contact JSONB DEFAULT '{}';

-- ============================================
-- NOVA TABULKA: KONTAKTNI FORMULARE (LEADY)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,

  -- Kontaktni udaje
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,

  -- Metadata
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  source VARCHAR(50) DEFAULT 'contact_form', -- contact_form, fair, etc.

  -- Stav zpracovani
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, converted, rejected
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychle dotazy
CREATE INDEX IF NOT EXISTS idx_contact_leads_company ON contact_leads(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_portal ON contact_leads(portal_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created ON contact_leads(created_at DESC);

-- ============================================
-- NOVA TABULKA: TRACKOVANI KLIKU
-- ============================================
CREATE TABLE IF NOT EXISTS click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  portal_id UUID REFERENCES portals(id) ON DELETE SET NULL,

  -- Typ akce
  action_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'website', 'profile_view'

  -- Anonymni identifikator session
  session_id VARCHAR(100),

  -- Dodatecna metadata
  user_agent TEXT,
  referer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexy pro analyticke dotazy
CREATE INDEX IF NOT EXISTS idx_click_tracking_company ON click_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_portal ON click_tracking(portal_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_type ON click_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_click_tracking_created ON click_tracking(created_at DESC);

-- ============================================
-- RLS POLICIES PRO NOVE TABULKY
-- ============================================
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Public insert pro kontaktni formulare (studenti mohou posilat)
CREATE POLICY "Public insert contact_leads" ON contact_leads
  FOR INSERT WITH CHECK (true);

-- Admin full access pro leady
CREATE POLICY "Admin full access contact_leads" ON contact_leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Public insert pro tracking (anonymni)
CREATE POLICY "Public insert click_tracking" ON click_tracking
  FOR INSERT WITH CHECK (true);

-- Admin read access pro tracking
CREATE POLICY "Admin read click_tracking" ON click_tracking
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- FULL-TEXT SEARCH INDEX (volitelne)
-- ============================================
-- Pro rychle fulltextove vyhledavani firem
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies
  USING gin(to_tsvector('simple',
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(array_to_string(location, ' '), '') || ' ' ||
    coalesce(array_to_string(sectors, ' '), '') || ' ' ||
    coalesce(array_to_string(positions, ' '), '') || ' ' ||
    coalesce(array_to_string(opportunities, ' '), '')
  ));
