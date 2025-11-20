/*
  # Multilingual Support Migration
  
  This migration adds multilingual support to dynamic content:
  - Pages: title and content stored as JSONB with language keys
  - Products: name, description, details stored as JSONB with language keys
  - Categories: name, description stored as JSONB with language keys
  
  Structure: { "en": "...", "ar": "..." }
*/

-- Update pages table to support multilingual content
-- Convert existing title to multilingual format
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS title_multilingual jsonb DEFAULT '{}'::jsonb;

ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS content_multilingual jsonb DEFAULT '{}'::jsonb;

-- Migrate existing data: convert single title/content to multilingual format
UPDATE pages 
SET title_multilingual = jsonb_build_object('en', COALESCE(title, ''))
WHERE title_multilingual = '{}'::jsonb OR title_multilingual IS NULL;

UPDATE pages 
SET content_multilingual = COALESCE(content, '{}'::jsonb)
WHERE content_multilingual = '{}'::jsonb OR content_multilingual IS NULL;

-- Keep old columns for backward compatibility (can be removed later)
-- For now, we'll use the multilingual columns as primary

-- Update products table to support multilingual content
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_multilingual jsonb DEFAULT '{}'::jsonb;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description_multilingual jsonb DEFAULT '{}'::jsonb;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS details_multilingual jsonb DEFAULT '{}'::jsonb;

-- Migrate existing product data
UPDATE products 
SET 
  name_multilingual = jsonb_build_object('en', COALESCE(name, '')),
  description_multilingual = jsonb_build_object('en', COALESCE(description, '')),
  details_multilingual = jsonb_build_object('en', COALESCE(details, ''))
WHERE name_multilingual = '{}'::jsonb OR name_multilingual IS NULL;

-- Update categories table to support multilingual content
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS name_multilingual jsonb DEFAULT '{}'::jsonb;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description_multilingual jsonb DEFAULT '{}'::jsonb;

-- Migrate existing category data
UPDATE categories 
SET 
  name_multilingual = jsonb_build_object('en', COALESCE(name, '')),
  description_multilingual = jsonb_build_object('en', COALESCE(description, ''))
WHERE name_multilingual = '{}'::jsonb OR name_multilingual IS NULL;

-- Create helper function to get multilingual content with fallback
CREATE OR REPLACE FUNCTION get_multilingual_text(
  multilingual_json jsonb,
  lang text DEFAULT 'en',
  fallback_lang text DEFAULT 'en'
)
RETURNS text AS $$
BEGIN
  -- Try to get the requested language
  IF multilingual_json ? lang THEN
    RETURN multilingual_json->>lang;
  END IF;
  
  -- Fallback to default language
  IF multilingual_json ? fallback_lang THEN
    RETURN multilingual_json->>fallback_lang;
  END IF;
  
  -- If no language found, try to get any value
  IF jsonb_typeof(multilingual_json) = 'object' THEN
    RETURN multilingual_json->>(SELECT key FROM jsonb_object_keys(multilingual_json) AS key LIMIT 1);
  END IF;
  
  -- Last resort: return empty string
  RETURN '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_title_multilingual ON pages USING gin (title_multilingual);
CREATE INDEX IF NOT EXISTS idx_pages_content_multilingual ON pages USING gin (content_multilingual);
CREATE INDEX IF NOT EXISTS idx_products_name_multilingual ON products USING gin (name_multilingual);
CREATE INDEX IF NOT EXISTS idx_categories_name_multilingual ON categories USING gin (name_multilingual);

