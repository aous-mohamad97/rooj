/*
  # CMS Schema for Rooj Essence Website

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL identifier (home, about, products, contact)
      - `title` (text) - Page title
      - `content` (jsonb) - Page content as structured JSON
      - `is_published` (boolean) - Publication status
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `category` (text) - Product category (skin_care, fragrances, bakhoor)
      - `description` (text) - Product description
      - `details` (text) - Detailed information
      - `image_url` (text) - Product image URL
      - `order_index` (int) - Display order
      - `is_active` (boolean) - Visibility status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for published content
    - Authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  order_index int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_order ON products(order_index);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
