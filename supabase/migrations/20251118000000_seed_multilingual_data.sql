/*
  # Multilingual Seeder Migration
  
  This migration seeds the database with complete multilingual content (EN/AR) for:
  - Categories
  - Products
  - Pages (home, about, products, contact)
  - Site Settings
  - Global SEO Settings
  
  All content includes both English (en) and Arabic (ar) translations.
*/

-- ============================================
-- CATEGORIES SEED DATA
-- ============================================
INSERT INTO categories (slug, name, name_multilingual, description, description_multilingual, icon, order_index, is_active)
VALUES 
  (
    'skin_care',
    'Skin Care',
    '{"en": "Skin Care", "ar": "العناية بالبشرة"}'::jsonb,
    'Natural skincare products for daily care',
    '{"en": "Natural skincare products for daily care", "ar": "منتجات العناية بالبشرة الطبيعية للعناية اليومية"}'::jsonb,
    'droplet',
    1,
    true
  ),
  (
    'fragrances',
    'Fragrances',
    '{"en": "Fragrances", "ar": "العطور"}'::jsonb,
    'Premium fragrances and perfumes',
    '{"en": "Premium fragrances and perfumes", "ar": "عطور وعطور فاخرة"}'::jsonb,
    'sparkles',
    2,
    true
  ),
  (
    'bakhoor',
    'Bakhoor',
    '{"en": "Bakhoor", "ar": "البخور"}'::jsonb,
    'Traditional Arabic incense and bakhoor',
    '{"en": "Traditional Arabic incense and bakhoor", "ar": "البخور والعطور العربية التقليدية"}'::jsonb,
    'flame',
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_multilingual = EXCLUDED.name_multilingual,
  description = EXCLUDED.description,
  description_multilingual = EXCLUDED.description_multilingual,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ============================================
-- PRODUCTS SEED DATA
-- ============================================
-- Get category IDs for foreign key references
DO $$
DECLARE
  skin_care_id uuid;
  fragrances_id uuid;
  bakhoor_id uuid;
BEGIN
  SELECT id INTO skin_care_id FROM categories WHERE slug = 'skin_care';
  SELECT id INTO fragrances_id FROM categories WHERE slug = 'fragrances';
  SELECT id INTO bakhoor_id FROM categories WHERE slug = 'bakhoor';

  -- Skin Care Products
  INSERT INTO products (name, name_multilingual, category, category_id, description, description_multilingual, details, details_multilingual, image_url, order_index, is_active)
  VALUES 
    (
      'Rooj Daytime – Protective Day Cream',
      '{"en": "Rooj Daytime – Protective Day Cream", "ar": "روج النهار – كريم الحماية النهاري"}'::jsonb,
      'skin_care',
      skin_care_id,
      'A rich, botanical formula featuring extracts of Licorice, Turmeric, Frankincense, Wheat Germ, Aloe Vera, Chamomile, Rose, and Sweet Almond.',
      '{"en": "A rich, botanical formula featuring extracts of Licorice, Turmeric, Frankincense, Wheat Germ, Aloe Vera, Chamomile, Rose, and Sweet Almond.", "ar": "تركيبة نباتية غنية تحتوي على مستخلصات من عرق السوس والكركم واللبان وجنين القمح والصبار والبابونج والورد واللوز الحلو."}'::jsonb,
      'It features a dual-action sunscreen that combines physical filters (reflecting rays) and chemical filters (absorbing rays) to provide effective, comprehensive protection from sun damage. Its gentle formula is safe for even the most sensitive skin.',
      '{"en": "It features a dual-action sunscreen that combines physical filters (reflecting rays) and chemical filters (absorbing rays) to provide effective, comprehensive protection from sun damage. Its gentle formula is safe for even the most sensitive skin.", "ar": "يتميز بواقي شمسي ثنائي الفعل يجمع بين المرشحات الفيزيائية (التي تعكس الأشعة) والمرشحات الكيميائية (التي تمتص الأشعة) لتوفير حماية فعالة وشاملة من أضرار الشمس. تركيبته اللطيفة آمنة حتى لأكثر البشرة حساسية."}'::jsonb,
      'https://images.pexels.com/photos/3587350/pexels-photo-3587350.jpeg?auto=compress&cs=tinysrgb&w=600',
      1,
      true
    ),
    (
      'Rooj Nighttime – Restorative Night Cream',
      '{"en": "Rooj Nighttime – Restorative Night Cream", "ar": "روج الليل – كريم الليل الترميمي"}'::jsonb,
      'skin_care',
      skin_care_id,
      'Designed to support your skin natural renewal process while you sleep.',
      '{"en": "Designed to support your skin natural renewal process while you sleep.", "ar": "مصمم لدعم عملية تجديد البشرة الطبيعية أثناء النوم."}'::jsonb,
      'This cream uses a blend of natural wax, botanical oils, and aqueous extracts to deeply moisturize, nourish, and rebalance your skin after a long day.',
      '{"en": "This cream uses a blend of natural wax, botanical oils, and aqueous extracts to deeply moisturize, nourish, and rebalance your skin after a long day.", "ar": "يستخدم هذا الكريم مزيجاً من الشمع الطبيعي والزيوت النباتية والمستخلصات المائية لترطيب وتغذية وإعادة توازن بشرتك بعمق بعد يوم طويل."}'::jsonb,
      'https://images.pexels.com/photos/3587352/pexels-photo-3587352.jpeg?auto=compress&cs=tinysrgb&w=600',
      2,
      true
    );

  -- Fragrance Products
  INSERT INTO products (name, name_multilingual, category, category_id, description, description_multilingual, details, details_multilingual, image_url, order_index, is_active)
  VALUES 
    (
      'Soirée Splash – Selene',
      '{"en": "Soirée Splash – Selene", "ar": "سواريه سبلاش – سيلين"}'::jsonb,
      'fragrances',
      fragrances_id,
      'Named for the Greek goddess of the moon.',
      '{"en": "Named for the Greek goddess of the moon.", "ar": "سمي على اسم إلهة القمر اليونانية."}'::jsonb,
      'A transparent, nocturnal scent blending white musk and jasmine. It is feminine, soft, and as tranquil as moonlight.',
      '{"en": "A transparent, nocturnal scent blending white musk and jasmine. It is feminine, soft, and as tranquil as moonlight.", "ar": "عطر شفاف ليلي يخلط بين المسك الأبيض والياسمين. إنه أنثوي وناعم وهادئ مثل ضوء القمر."}'::jsonb,
      'https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?auto=compress&cs=tinysrgb&w=600',
      3,
      true
    ),
    (
      'Soirée Splash – Mitra',
      '{"en": "Soirée Splash – Mitra", "ar": "سواريه سبلاش – ميثرا"}'::jsonb,
      'fragrances',
      fragrances_id,
      'From the ancient root Mithra, a symbol of loyalty and the bond between souls.',
      '{"en": "From the ancient root Mithra, a symbol of loyalty and the bond between souls.", "ar": "من الجذر القديم ميثرا، رمز الولاء والرابطة بين الأرواح."}'::jsonb,
      'A fragrance that balances soft incense with white flowers, feeling both sacred and gentle. It speaks to the truth in the relationship you have with yourself, before anyone else.',
      '{"en": "A fragrance that balances soft incense with white flowers, feeling both sacred and gentle. It speaks to the truth in the relationship you have with yourself, before anyone else.", "ar": "عطر يوازن بين البخور الناعم والزهور البيضاء، ويشعر بأنه مقدس ولطيف. يتحدث عن الحقيقة في العلاقة التي تربطك بنفسك، قبل أي شخص آخر."}'::jsonb,
      'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600',
      4,
      true
    ),
    (
      'Men Splash – Atlas',
      '{"en": "Men Splash – Atlas", "ar": "رجال سبلاش – أطلس"}'::jsonb,
      'fragrances',
      fragrances_id,
      'The symbol of strength that carries the world without losing its humanity.',
      '{"en": "The symbol of strength that carries the world without losing its humanity.", "ar": "رمز القوة الذي يحمل العالم دون أن يفقد إنسانيته."}'::jsonb,
      'A grounded fragrance with a base of sandalwood, patchouli, and a touch of incense. It has a silent but profound, heavy, and balanced presence.',
      '{"en": "A grounded fragrance with a base of sandalwood, patchouli, and a touch of incense. It has a silent but profound, heavy, and balanced presence.", "ar": "عطر متجذر بقاعدة من خشب الصندل والباتشولي ولمسة من البخور. له حضور صامت لكن عميق وثقيل ومتوازن."}'::jsonb,
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600',
      5,
      true
    ),
    (
      'Men Splash – Orion',
      '{"en": "Men Splash – Orion", "ar": "رجال سبلاش – أوريون"}'::jsonb,
      'fragrances',
      fragrances_id,
      'The hunter who became a star in the sky.',
      '{"en": "The hunter who became a star in the sky.", "ar": "الصياد الذي أصبح نجماً في السماء."}'::jsonb,
      'An aromatic-leathery scent with a defining note of black pepper and a warm touch of amber. For the man who does not look for the light—he creates it.',
      '{"en": "An aromatic-leathery scent with a defining note of black pepper and a warm touch of amber. For the man who does not look for the light—he creates it.", "ar": "عطر عطري جلدي بنوتة مميزة من الفلفل الأسود ولمسة دافئة من العنبر. للرجل الذي لا يبحث عن النور - بل يخلقه."}'::jsonb,
      'https://images.pexels.com/photos/1516681/pexels-photo-1516681.jpeg?auto=compress&cs=tinysrgb&w=600',
      6,
      true
    ),
    (
      'Rooj Signature Perfume',
      '{"en": "Rooj Signature Perfume", "ar": "عطر روج التوقيعي"}'::jsonb,
      'fragrances',
      fragrances_id,
      'A unique composition that captures both tranquility and allure.',
      '{"en": "A unique composition that captures both tranquility and allure.", "ar": "تركيبة فريدة تجمع بين الهدوء والجاذبية."}'::jsonb,
      'This is the brand identity in one bottle—the scent of pure elegance and simplicity.',
      '{"en": "This is the brand identity in one bottle—the scent of pure elegance and simplicity.", "ar": "هذه هوية العلامة التجارية في زجاجة واحدة - عطر الأناقة والبساطة النقية."}'::jsonb,
      'https://images.pexels.com/photos/3587351/pexels-photo-3587351.jpeg?auto=compress&cs=tinysrgb&w=600',
      7,
      true
    );

  -- Bakhoor Products
  INSERT INTO products (name, name_multilingual, category, category_id, description, description_multilingual, details, details_multilingual, image_url, order_index, is_active)
  VALUES 
    (
      'Rooj Essence Bakhoor',
      '{"en": "Rooj Essence Bakhoor", "ar": "بخور روج إسينس"}'::jsonb,
      'bakhoor',
      bakhoor_id,
      'Crafted from pure, natural ingredients, entirely free from chemical or synthetic additives.',
      '{"en": "Crafted from pure, natural ingredients, entirely free from chemical or synthetic additives.", "ar": "مصنوع من مكونات طبيعية نقية، خالٍ تماماً من المواد الكيميائية أو المضافة الاصطناعية."}'::jsonb,
      'When burned, it releases fine aromatic particles that help purify the air, reducing the buildup of odors and airborne germs. Its natural botanical components create a sense of cleanliness and comfort in your space in a way that is both safe and healthy. Roj Essence Bakhoor is designed to restore balance between your senses and your space—simply and authentically.',
      '{"en": "When burned, it releases fine aromatic particles that help purify the air, reducing the buildup of odors and airborne germs. Its natural botanical components create a sense of cleanliness and comfort in your space in a way that is both safe and healthy. Roj Essence Bakhoor is designed to restore balance between your senses and your space—simply and authentically.", "ar": "عند الاحتراق، يطلق جزيئات عطرية دقيقة تساعد على تنقية الهواء، وتقليل تراكم الروائح والجراثيم المحمولة جواً. مكوناته النباتية الطبيعية تخلق إحساساً بالنظافة والراحة في مساحتك بطريقة آمنة وصحية. بخور روج إسينس مصمم لاستعادة التوازن بين حواسك ومساحتك - ببساطة وأصالة."}'::jsonb,
      'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600',
      8,
      true
    );

END $$;

-- ============================================
-- PAGES SEED DATA
-- ============================================

-- Home Page
INSERT INTO pages (slug, title, title_multilingual, content, content_multilingual, is_published)
VALUES (
  'home',
  'Rooj Essence - Natural Daily Care',
  '{"en": "Rooj Essence - Natural Daily Care", "ar": "روج إسينس - العناية اليومية الطبيعية"}'::jsonb,
  '{
    "hero": {
      "heading": "Build a new relationship with your body.",
      "subheading": "Rooj Essence is a Syrian brand dedicated to natural daily care."
    },
    "value_proposition": {
      "heading": "Scientific Awareness, Natural Spirit",
      "description": "Our products are handmade, built on thoughtful formulas."
    }
  }'::jsonb,
  '{
    "hero": {
      "heading": {
        "en": "Build a new relationship with your body.",
        "ar": "ابني علاقة جديدة مع جسدك."
      },
      "subheading": {
        "en": "Rooj Essence is a Syrian brand dedicated to natural daily care.",
        "ar": "روج إسينس هي علامة سورية مكرسة للعناية اليومية الطبيعية."
      }
    },
    "value_proposition": {
      "heading": {
        "en": "Scientific Awareness, Natural Spirit",
        "ar": "وعي علمي، روح طبيعية"
      },
      "description": {
        "en": "Our products are handmade, built on thoughtful formulas.",
        "ar": "منتجاتنا مصنوعة يدوياً، مبنية على تركيبات مدروسة."
      }
    }
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_multilingual = EXCLUDED.title_multilingual,
  content = EXCLUDED.content,
  content_multilingual = EXCLUDED.content_multilingual,
  updated_at = now();

-- About Page
INSERT INTO pages (slug, title, title_multilingual, content, content_multilingual, is_published)
VALUES (
  'about',
  'About Rooj Essence',
  '{"en": "About Rooj Essence", "ar": "من نحن - روج إسينس"}'::jsonb,
  '{
    "heading": "We Are Redefining Care.",
    "philosophy": "At Rooj Essence, we believe that true care comes from understanding the harmony between nature and science.",
    "purity_promise": {
      "heading": "Our Purity Promise",
      "intro": "Every product we create is a testament to our commitment to purity and quality.",
      "natural": "100% Natural Ingredients",
      "essential": "Essential Oils & Extracts",
      "safe": "Certified Safe"
    },
    "commitment": "We are committed to providing you with products that are not only effective but also safe for your body and the environment.",
    "tagline": "Natural care, naturally better."
  }'::jsonb,
  '{
    "heading": {
      "en": "We Are Redefining Care.",
      "ar": "نحن نعيد تعريف العناية."
    },
    "philosophy": {
      "en": "At Rooj Essence, we believe that true care comes from understanding the harmony between nature and science.",
      "ar": "في روج إسينس، نؤمن بأن العناية الحقيقية تأتي من فهم الانسجام بين الطبيعة والعلم."
    },
    "purity_promise": {
      "heading": {
        "en": "Our Purity Promise",
        "ar": "وعدنا بالنقاء"
      },
      "intro": {
        "en": "Every product we create is a testament to our commitment to purity and quality.",
        "ar": "كل منتج نصنعه هو شهادة على التزامنا بالنقاء والجودة."
      },
      "natural": {
        "en": "100% Natural Ingredients",
        "ar": "مكونات 100% طبيعية"
      },
      "essential": {
        "en": "Essential Oils & Extracts",
        "ar": "زيوت عطرية ومستخلصات"
      },
      "safe": {
        "en": "Certified Safe",
        "ar": "معتمد وآمن"
      }
    },
    "commitment": {
      "en": "We are committed to providing you with products that are not only effective but also safe for your body and the environment.",
      "ar": "نحن ملتزمون بتزويدك بمنتجات ليست فعالة فحسب، بل آمنة أيضاً لجسدك والبيئة."
    },
    "tagline": {
      "en": "Natural care, naturally better.",
      "ar": "عناية طبيعية، أفضل بشكل طبيعي."
    }
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_multilingual = EXCLUDED.title_multilingual,
  content = EXCLUDED.content,
  content_multilingual = EXCLUDED.content_multilingual,
  updated_at = now();

-- Products Page
INSERT INTO pages (slug, title, title_multilingual, content, content_multilingual, is_published)
VALUES (
  'products',
  'Our Products',
  '{"en": "Our Products", "ar": "منتجاتنا"}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_multilingual = EXCLUDED.title_multilingual,
  updated_at = now();

-- Contact Page
INSERT INTO pages (slug, title, title_multilingual, content, content_multilingual, is_published)
VALUES (
  'contact',
  'Contact Us',
  '{"en": "Contact Us", "ar": "اتصل بنا"}'::jsonb,
  '{
    "heading": "Get in Touch",
    "description": "We''d love to hear from you. Send us a message and we''ll respond as soon as possible.",
    "location": "Damascus, Syria",
    "phone": "+963 XXX XXX XXX",
    "instagram": "@roojessence"
  }'::jsonb,
  '{
    "heading": {
      "en": "Get in Touch",
      "ar": "تواصل معنا"
    },
    "description": {
      "en": "We''d love to hear from you. Send us a message and we''ll respond as soon as possible.",
      "ar": "نحب أن نسمع منك. أرسل لنا رسالة وسنرد في أقرب وقت ممكن."
    },
    "location": {
      "en": "Damascus, Syria",
      "ar": "دمشق، سوريا"
    },
    "phone": {
      "en": "+963 XXX XXX XXX",
      "ar": "+963 XXX XXX XXX"
    },
    "instagram": {
      "en": "@roojessence",
      "ar": "@roojessence"
    }
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_multilingual = EXCLUDED.title_multilingual,
  content = EXCLUDED.content,
  content_multilingual = EXCLUDED.content_multilingual,
  updated_at = now();

-- ============================================
-- SITE SETTINGS SEED DATA
-- ============================================

-- Global SEO Settings
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'global_seo',
  '{
    "site_name": "Rooj Essence",
    "site_name_multilingual": {
      "en": "Rooj Essence",
      "ar": "روج إسينس"
    },
    "default_meta_title": "Rooj Essence - Natural Daily Care",
    "default_meta_title_multilingual": {
      "en": "Rooj Essence - Natural Daily Care",
      "ar": "روج إسينس - العناية اليومية الطبيعية"
    },
    "default_meta_description": "Rooj Essence is a Syrian brand dedicated to natural daily care products. Discover our range of handmade skincare, fragrances, and bakhoor.",
    "default_meta_description_multilingual": {
      "en": "Rooj Essence is a Syrian brand dedicated to natural daily care products. Discover our range of handmade skincare, fragrances, and bakhoor.",
      "ar": "روج إسينس هي علامة سورية مكرسة لمنتجات العناية اليومية الطبيعية. اكتشف مجموعتنا من العناية بالبشرة المصنوعة يدوياً والعطور والبخور."
    },
    "default_meta_keywords": "natural care, skincare, fragrances, bakhoor, Syrian products, handmade, organic",
    "default_meta_keywords_multilingual": {
      "en": "natural care, skincare, fragrances, bakhoor, Syrian products, handmade, organic",
      "ar": "عناية طبيعية، عناية بالبشرة، عطور، بخور، منتجات سورية، مصنوع يدوياً، عضوي"
    },
    "default_og_image": "",
    "twitter_handle": "@roojessence",
    "google_analytics_id": "",
    "google_tag_manager_id": "",
    "facebook_pixel_id": "",
    "robots_txt": "User-agent: *\nAllow: /",
    "sitemap_enabled": true,
    "schema_markup": "{\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"Rooj Essence\",\"description\":\"Natural daily care products\",\"url\":\"\",\"logo\":\"\"}"
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- Contact Information Settings
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'contact_info',
  '{
    "location": "Damascus, Syria",
    "location_multilingual": {
      "en": "Damascus, Syria",
      "ar": "دمشق، سوريا"
    },
    "phone": "+963 XXX XXX XXX",
    "email": "info@roojessence.com",
    "instagram": "@roojessence",
    "facebook": "",
    "twitter": ""
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- PAGE-SPECIFIC SEO SETTINGS
-- ============================================

-- Update Home page with SEO
UPDATE pages
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{seo}',
  '{
    "meta_title_multilingual": {
      "en": "Rooj Essence - Natural Daily Care | Home",
      "ar": "روج إسينس - العناية اليومية الطبيعية | الرئيسية"
    },
    "meta_description_multilingual": {
      "en": "Discover Rooj Essence natural daily care products. Handmade skincare, fragrances, and bakhoor from Syria.",
      "ar": "اكتشف منتجات روج إسينس للعناية اليومية الطبيعية. عناية بالبشرة مصنوعة يدوياً وعطور وبخور من سوريا."
    },
    "meta_keywords_multilingual": {
      "en": "natural care, skincare, Syrian products, handmade",
      "ar": "عناية طبيعية، عناية بالبشرة، منتجات سورية، مصنوع يدوياً"
    }
  }'::jsonb
)
WHERE slug = 'home';

-- Update About page with SEO
UPDATE pages
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{seo}',
  '{
    "meta_title_multilingual": {
      "en": "About Rooj Essence - Our Story & Philosophy",
      "ar": "من نحن - روج إسينس | قصتنا وفلسفتنا"
    },
    "meta_description_multilingual": {
      "en": "Learn about Rooj Essence commitment to natural, handmade products. Discover our philosophy of combining science and nature.",
      "ar": "تعرف على التزام روج إسينس بالمنتجات الطبيعية المصنوعة يدوياً. اكتشف فلسفتنا في الجمع بين العلم والطبيعة."
    }
  }'::jsonb
)
WHERE slug = 'about';

-- Update Products page with SEO
UPDATE pages
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{seo}',
  '{
    "meta_title_multilingual": {
      "en": "Products - Rooj Essence Collection",
      "ar": "المنتجات - مجموعة روج إسينس"
    },
    "meta_description_multilingual": {
      "en": "Browse our complete collection of natural skincare, fragrances, and bakhoor. Handmade with care in Syria.",
      "ar": "تصفح مجموعتنا الكاملة من العناية بالبشرة الطبيعية والعطور والبخور. مصنوع يدوياً بعناية في سوريا."
    }
  }'::jsonb
)
WHERE slug = 'products';

-- Update Contact page with SEO
UPDATE pages
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{seo}',
  '{
    "meta_title_multilingual": {
      "en": "Contact Us - Rooj Essence",
      "ar": "اتصل بنا - روج إسينس"
    },
    "meta_description_multilingual": {
      "en": "Get in touch with Rooj Essence. We''d love to hear from you.",
      "ar": "تواصل مع روج إسينس. نحب أن نسمع منك."
    }
  }'::jsonb
)
WHERE slug = 'contact';

