-- ============================================
-- Migrace: Přidání featured pole pro hero sekci
-- proKarieru - 2025-12-11
-- ============================================

-- Pole pro označení firem zobrazených v hero sekci
ALTER TABLE companies ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Index pro rychlé dotazy na featured firmy
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(featured) WHERE featured = true;
