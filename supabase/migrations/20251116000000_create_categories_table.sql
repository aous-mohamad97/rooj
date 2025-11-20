/*
  # Categories Table for Product Categories

  1. New Table
    - `categories`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier (skin_care, fragrances, bakhoor)
      - `name` (text) - Display name (Skin Care, Fragrances, Bakhoor)
      - `description` (text) - Category description
      - `icon` (text) - Icon name/identifier
      - `order_index` (int) - Display order
      - `is_active` (boolean) - Visibility status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Update products table
    - Add foreign key reference to categories
    - Keep category as text for backward compatibility, but add category_id

  3. Security
    - Enable RLS on categories table
    - Public read access for active categories
    - Authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  order_index int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- Add category_id to products table (optional, for future use)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Insert default categories if they don't exist
INSERT INTO categories (slug, name, description, icon, order_index, is_active)
VALUES 
  ('skin_care', 'Skin Care', 'Natural skincare products for daily care', 'droplet', 1, true),
  ('fragrances', 'Fragrances', 'Premium fragrances and perfumes', 'sparkles', 2, true),
  ('bakhoor', 'Bakhoor', 'Traditional Arabic incense and bakhoor', 'flame', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to link to categories (if category_id is null)
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.slug AND p.category_id IS NULL;

