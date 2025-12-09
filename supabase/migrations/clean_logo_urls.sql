-- Clean cache-busting parameters from logo_url values
-- This migration removes ?v=timestamp parameters from logo_url

UPDATE companies
SET logo_url = SPLIT_PART(logo_url, '?', 1)
WHERE logo_url LIKE '%?%';
