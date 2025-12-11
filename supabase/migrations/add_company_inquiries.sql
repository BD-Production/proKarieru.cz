-- ============================================
-- Migrace: Tabulka pro firemni poptavky
-- proKarieru - 2025-12-11
-- ============================================

CREATE TABLE IF NOT EXISTS company_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Firemni udaje
  company_name VARCHAR(255) NOT NULL,
  ico VARCHAR(20),

  -- Kontaktni osoba
  contact_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Poptavka
  message TEXT,
  interest_type VARCHAR(50)[], -- ['katalog', 'veletrh', 'soutez']

  -- Metadata
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,

  -- Stav zpracovani
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, converted, rejected
  notes TEXT, -- interni poznamky

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychle vyhledavani
CREATE INDEX IF NOT EXISTS idx_company_inquiries_status ON company_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_company_inquiries_created ON company_inquiries(created_at DESC);

-- RLS
ALTER TABLE company_inquiries ENABLE ROW LEVEL SECURITY;

-- Politiky - vkladat muze kdokoli (anonymni), cist jen autentizovani
CREATE POLICY "Anyone can insert company_inquiries" ON company_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view company_inquiries" ON company_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company_inquiries" ON company_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');
