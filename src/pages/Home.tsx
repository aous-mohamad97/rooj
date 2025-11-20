import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { Leaf, Award, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { ProductDetailDialog } from '../components/ProductDetailDialog';
import { SEOHead } from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import { getMultilingualText } from '../utils/multilingual';

interface HomeContent {
  hero: {
    heading: string;
    subheading: string;
  };
  value_proposition: {
    heading: string;
    description: string;
  };
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  name_multilingual?: Record<string, string>;
  category: string;
  categories?: Category & { name_multilingual?: Record<string, string> } | null;
  description: string;
  description_multilingual?: Record<string, string>;
  details: string;
  details_multilingual?: Record<string, string>;
  image_url: string;
  order_index: number;
}

export function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [content, setContent] = useState<HomeContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function loadContent() {
      const { data: pageData } = await supabase
        .from('pages')
        .select('content, content_multilingual, title_multilingual')
        .eq('slug', 'home')
        .maybeSingle();

      if (pageData) {
        // Use multilingual content if available, otherwise fallback to old content
        const multilingualContent = pageData.content_multilingual || pageData.content;
        
        // Extract language-specific content from nested multilingual structure
        let contentForLang: HomeContent | null = null;
        
        if (multilingualContent && typeof multilingualContent === 'object') {
          const hero = (multilingualContent as Record<string, unknown>)?.hero as Record<string, unknown> | undefined;
          const value_proposition = (multilingualContent as Record<string, unknown>)?.value_proposition as Record<string, unknown> | undefined;
          const fallbackContent = pageData.content as HomeContent | null;
          
          if (hero || value_proposition) {
            contentForLang = {
              hero: {
                heading: getMultilingualText(hero?.heading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.hero?.heading || '',
                subheading: getMultilingualText(hero?.subheading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.hero?.subheading || '',
              },
              value_proposition: {
                heading: getMultilingualText(value_proposition?.heading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.value_proposition?.heading || '',
                description: getMultilingualText(value_proposition?.description as string | Record<string, string> | undefined, currentLang) || fallbackContent?.value_proposition?.description || '',
              },
            };
          }
        }
        
        setContent(contentForLang || (pageData.content as HomeContent));
      }

      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          name_multilingual,
          description_multilingual,
          details_multilingual,
          categories:category_id (
            id,
            slug,
            name,
            name_multilingual,
            icon
          )
        `)
        .eq('is_active', true)
        .limit(8)
        .order('order_index');

      if (productsData) {
        setProducts(productsData);
      }
      setLoading(false);
    }

    loadContent();
  }, [currentLang]);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(1, Math.ceil(products.length / 3)));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? Math.max(0, Math.ceil(products.length / 3) - 1) : prev - 1
    );
  };

  const visibleProducts = products.slice(carouselIndex * 3, carouselIndex * 3 + 3);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[#5f031a]">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        pageSlug="home"
        pageTitle={content?.hero.heading}
        pageDescription={content?.hero.subheading}
      />
      <main className="mb-10">
        <section className="relative min-h-[85vh] flex items-center bg-[#FCF6E1]" aria-label="Hero section">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: "fixed",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <AnimatedSection direction="fade-up" className="max-w-3xl">
            <div className="main-title">
              <img src="/logo.png" alt="Rooj Essence" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#5f031a] mb-6 leading-tight">
              {content?.hero.heading || 'Build a new relationship with your body.'}
            </h1>
            <p className="text-xl md:text-2xl text-[#4a4a4a] leading-relaxed mb-8">
              {content?.hero.subheading || 'Rooj Essence is a Syrian brand dedicated to natural daily care.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="inline-block bg-[#5f031a] text-[#FCF6E1] px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center"
              >
                {t('home.shopCollection')}
              </a>
              <a
                href="/about"
                className="inline-block border-2 border-[#5f031a] text-[#5f031a] px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#5f031a] hover:text-[#FCF6E1] transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center"
              >
                {t('home.learnPhilosophy')}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 bg-white" aria-label="Value proposition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="fade-up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#5f031a] mb-6">
              {getMultilingualText(content?.value_proposition?.heading, currentLang) || t('home.valueProposition.heading')}
            </h2>
            <p className="text-xl text-[#4a4a4a] max-w-3xl mx-auto leading-relaxed">
              {getMultilingualText(content?.value_proposition?.description, currentLang) || t('home.valueProposition.description')}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" role="list">
            <AnimatedSection direction="fade-up" delay={100}>
              <article className="text-center p-8 rounded-xl bg-[#FCF6E1] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105" role="listitem">
                <div className="inline-block p-4 bg-[#5f031a] rounded-full mb-6 transform transition-transform duration-300 hover:scale-110" aria-hidden="true">
                  <Leaf className="text-[#FCF6E1]" size={32} />
                </div>
                <h3 className="text-2xl font-serif text-[#5f031a] mb-4 transition-colors duration-300 hover:text-[#8d1a2f]">{t('home.features.natural.title')}</h3>
                <p className="text-[#4a4a4a] leading-relaxed">
                  {t('home.features.natural.description')}
                </p>
              </article>
            </AnimatedSection>

            <AnimatedSection direction="fade-up" delay={200}>
              <article className="text-center p-8 rounded-xl bg-[#FCF6E1] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105" role="listitem">
                <div className="inline-block p-4 bg-[#5f031a] rounded-full mb-6 transform transition-transform duration-300 hover:scale-110" aria-hidden="true">
                  <Award className="text-[#FCF6E1]" size={32} />
                </div>
                <h3 className="text-2xl font-serif text-[#5f031a] mb-4 transition-colors duration-300 hover:text-[#8d1a2f]">{t('home.features.certified.title')}</h3>
                <p className="text-[#4a4a4a] leading-relaxed">
                  {t('home.features.certified.description')}
                </p>
              </article>
            </AnimatedSection>

            <AnimatedSection direction="fade-up" delay={300}>
              <article className="text-center p-8 rounded-xl bg-[#FCF6E1] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105" role="listitem">
                <div className="inline-block p-4 bg-[#5f031a] rounded-full mb-6 transform transition-transform duration-300 hover:scale-110" aria-hidden="true">
                  <Heart className="text-[#FCF6E1]" size={32} />
                </div>
                <h3 className="text-2xl font-serif text-[#5f031a] mb-4 transition-colors duration-300 hover:text-[#8d1a2f]">{t('home.features.care.title')}</h3>
                <p className="text-[#4a4a4a] leading-relaxed">
                  {t('home.features.care.description')}
                </p>
              </article>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FCF6E1]" aria-label="Featured products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="fade-up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#5f031a] mb-4">
              {t('home.featuredProducts.title')}
            </h2>
            <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto">
              {t('home.featuredProducts.description')}
            </p>
          </AnimatedSection>

          {products.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" role="list">
                {visibleProducts.map((product, index) => (
                  <AnimatedSection key={product.id} direction="fade-up" delay={index * 100} className="h-full">
                    <article
                      onClick={() => handleProductClick(product)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col cursor-pointer"
                      role="listitem"
                      itemScope
                      itemType="https://schema.org/Product"
                    >
                    <div className="relative overflow-hidden h-64 bg-gray-100 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={`${product.name} - ${product.categories?.name || (product.category === 'skin_care' ? 'Skin Care' : product.category === 'fragrances' ? 'Fragrances' : 'Bakhoor')} product from Rooj Essence`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FCF6E1]">
                          <span className="text-[#5f031a] text-opacity-30 text-center px-4">
                            No image available
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                      <span className="inline-block text-xs font-bold text-[#5f031a] bg-white/90 px-3 py-1 rounded-full backdrop-blur-sm" itemProp="category">
                        {getMultilingualText(product.categories?.name_multilingual || product.categories?.name || '', currentLang) || (product.category === 'skin_care'
                          ? 'Skin Care'
                          : product.category === 'fragrances'
                          ? 'Fragrances'
                          : 'Bakhoor')}
                      </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-serif text-[#5f031a] mb-3 line-clamp-2" itemProp="name">
                        {getMultilingualText(product.name_multilingual || product.name, currentLang)}
                      </h3>
                      <p className="text-[#4a4a4a] text-sm leading-relaxed line-clamp-3 flex-1" itemProp="description">
                        {getMultilingualText(product.description_multilingual || product.description, currentLang)}
                      </p>
                    </div>
                  </article>
                  </AnimatedSection>
                ))}
              </div>

              {Math.ceil(products.length / 3) > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={prevSlide}
                    className="p-2 bg-[#5f031a] text-[#FCF6E1] rounded-full hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.ceil(products.length / 3) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
                          i === carouselIndex ? 'bg-[#5f031a] scale-125' : 'bg-[#5f031a]/30'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className="p-2 bg-[#5f031a] text-[#FCF6E1] rounded-full hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-110 active:scale-95"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-[#4a4a4a]">
              <p>{t('home.noProductsAvailable')}</p>
            </div>
          )}

          <AnimatedSection direction="fade-up" className="text-center mt-12">
            <a
              href="/products"
              className="inline-block bg-[#5f031a] text-[#FCF6E1] px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {t('home.viewAllProducts')}
            </a>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 bg-[#5f031a] text-[#FCF6E1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection direction="fade-up">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">
              {t('home.readyToTransform')}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t('home.discoverCollection')}
            </p>
            <a
              href="/products"
              className="inline-block bg-[#FCF6E1] text-[#5f031a] px-8 py-4 rounded-lg text-lg font-medium hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {t('home.exploreProducts')}
            </a>
          </AnimatedSection>
        </div>
      </section>

      <ProductDetailDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
      </main>
    </Layout>
  );
}
