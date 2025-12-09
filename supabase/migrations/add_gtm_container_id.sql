-- Add GTM Container ID column to portals table
ALTER TABLE portals ADD COLUMN IF NOT EXISTS gtm_container_id TEXT;
