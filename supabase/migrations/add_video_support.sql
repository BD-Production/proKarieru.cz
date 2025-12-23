-- ============================================
-- PŘIDÁNÍ PODPORY VIDEÍ DO GALERIE ČLÁNKŮ
-- ============================================

-- Přidat sloupec pro typ média (image/video)
ALTER TABLE article_gallery
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image'
CHECK (media_type IN ('image', 'video'));

-- Přidat sloupec pro URL náhledu videa
ALTER TABLE article_gallery
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Přidat sloupec pro délku videa (v sekundách)
ALTER TABLE article_gallery
ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Přidat sloupec pro velikost souboru (v bytech)
ALTER TABLE article_gallery
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Aktualizovat existující záznamy
UPDATE article_gallery SET media_type = 'image' WHERE media_type IS NULL;

-- Index pro typ média
CREATE INDEX IF NOT EXISTS idx_article_gallery_media_type
ON article_gallery(article_id, media_type);

-- ============================================
-- STORAGE BUCKET PRO VIDEA
-- ============================================

-- Vytvořit bucket pro videa (spustit v Supabase Dashboard SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-videos',
  'article-videos',
  true,
  104857600, -- 100 MB limit
  ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES PRO article-videos
-- ============================================

-- Public čtení
CREATE POLICY "Public read article-videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-videos');

-- Authenticated upload
CREATE POLICY "Authenticated upload article-videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'article-videos'
    AND auth.uid() IS NOT NULL
  );

-- Authenticated update
CREATE POLICY "Authenticated update article-videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'article-videos'
    AND auth.uid() IS NOT NULL
  );

-- Authenticated delete
CREATE POLICY "Authenticated delete article-videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'article-videos'
    AND auth.uid() IS NOT NULL
  );
