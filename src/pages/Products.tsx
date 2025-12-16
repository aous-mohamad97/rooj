import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { Droplet, Sparkles, Flame, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { AnimatedSection } from "../components/AnimatedSection";
import { ProductDetailDialog } from "../components/ProductDetailDialog";
import { SEOHead } from "../components/SEOHead";
import { useTranslation } from "react-i18next";
import { getMultilingualText } from "../utils/multilingual";

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
  created_at?: string;
  updated_at?: string;
}

type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'order_index';

export function Products() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isRTL = (i18n.dir && i18n.dir(currentLang) === 'rtl') || currentLang.startsWith('ar');
  const productsSectionRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('order_index');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
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
        .eq("is_active", true)
        .order("order_index");

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  // Get unique categories from products (using category slug from relationship or fallback)
  const categories = Array.from(
    new Set(
      products.map((p) => {
        // Use category from relationship if available, otherwise fallback to category field
        return p.categories?.slug || p.category;
      })
    )
  );

  // Filter products
  const filteredProducts = products.filter((product) => {
    const productCategory = product.categories?.slug || product.category;
    const categoryMatch =
      !selectedCategory || productCategory === selectedCategory;
    const productName = getMultilingualText(product.name_multilingual || product.name, currentLang);
    const productDescription = getMultilingualText(product.description_multilingual || product.description, currentLang);
    const productDetails = getMultilingualText(product.details_multilingual || product.details, currentLang);
    const searchMatch =
      !searchTerm ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productDetails.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const nameA = getMultilingualText(a.name_multilingual || a.name, currentLang).toLowerCase();
    const nameB = getMultilingualText(b.name_multilingual || b.name, currentLang).toLowerCase();
    
    switch (sortBy) {
      case 'name_asc':
        return nameA.localeCompare(nameB);
      case 'name_desc':
        return nameB.localeCompare(nameA);
      case 'newest': {
        // Use updated_at if available, otherwise created_at, fallback to 0
        const dateA = a.updated_at || a.created_at || '1970-01-01T00:00:00Z';
        const dateB = b.updated_at || b.created_at || '1970-01-01T00:00:00Z';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      case 'oldest': {
        // Use created_at first, then updated_at, fallback to future date
        const dateAOld = a.created_at || a.updated_at || '9999-12-31T23:59:59Z';
        const dateBOld = b.created_at || b.updated_at || '9999-12-31T23:59:59Z';
        return new Date(dateAOld).getTime() - new Date(dateBOld).getTime();
      }
      case 'order_index':
      default:
        return (a.order_index || 0) - (b.order_index || 0);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const scrollToFiltersTop = () => {
    const targetEl = filtersRef.current || productsSectionRef.current;
    if (targetEl) {
      const top =
        targetEl.getBoundingClientRect().top +
        window.scrollY;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Ensure scroll happens after state updates/render
    requestAnimationFrame(scrollToFiltersTop);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "skin_care":
        return Droplet;
      case "fragrances":
        return Sparkles;
      case "bakhoor":
        return Flame;
      default:
        return Droplet;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "skin_care":
        return "Skin Care";
      case "fragrances":
        return "Fragrances";
      case "bakhoor":
        return "Bakhoor";
      default:
        return category;
    }
  };

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
      <SEOHead pageSlug="products" />
      <main>
        <section
          ref={productsSectionRef}
          className="py-20 bg-white relative"
          aria-label="Products"
        >
          <div
            className="absolute inset-0 opacity-10 z-1"
            style={{
              backgroundImage: "url(/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="fade-up" className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-serif text-[#5f031a] mb-6">
                {t('products.title')}
              </h1>
              <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto">
                {t('products.description')}
              </p>
            </AnimatedSection>

            <AnimatedSection direction="fade-up" delay={200}>
              <div
                ref={filtersRef}
                className="bg-[#FCF6E1] rounded-2xl p-6 mb-12 hover:shadow-lg transition-all duration-300"
              >
                {/* Main Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#5f031a] mb-2">
                      {t('products.search') || 'Search Products'}
                    </label>
                    <div className="relative">
                      <Search
                        className="absolute left-4 top-3 text-[#4a4a4a] transition-colors duration-300"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder={t('products.searchPlaceholder') || "Search by name, description..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-[#5f031a]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white transition-all duration-300 hover:border-[#5f031a]/40"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#5f031a] mb-2">
                      {t('products.category') || 'Category'}
                    </label>
                    <select
                      value={selectedCategory || ""}
                      onChange={(e) =>
                        setSelectedCategory(e.target.value || null)
                      }
                      className="w-full px-4 py-3 border border-[#5f031a]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white transition-all duration-300 hover:border-[#5f031a]/40"
                    >
                      <option value="">{t('products.allCategories') || 'All Categories'}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                      showAdvanced
                        ? 'bg-[#5f031a] text-[#FCF6E1] hover:bg-[#8d1a2f]'
                        : 'bg-white text-[#5f031a] border border-[#5f031a]/20 hover:border-[#5f031a]/40'
                    }`}
                  >
                    <SlidersHorizontal size={18} />
                    <span className="text-sm font-medium">
                      {t('products.advanced') || 'Advanced'}
                    </span>
                  </button>
                </div>

                {/* Advanced Filters */}
                <div 
                  className={`border-t border-[#5f031a]/20 pt-4 mt-4 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    showAdvanced 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0 pt-0 mt-0'
                  }`}
                >
                  <div>
                    <label className="block text-sm font-medium text-[#5f031a] mb-2">
                      {t('products.sortBy') || 'Sort By'}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-4 py-3 border border-[#5f031a]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white transition-all duration-300 hover:border-[#5f031a]/40"
                    >
                      <option value="order_index">{t('products.sortDefault') || 'Default Order'}</option>
                      <option value="name_asc">{t('products.sortNameAsc') || 'Name (A-Z)'}</option>
                      <option value="name_desc">{t('products.sortNameDesc') || 'Name (Z-A)'}</option>
                      <option value="newest">{t('products.sortNewest') || 'Newest First'}</option>
                      <option value="oldest">{t('products.sortOldest') || 'Oldest First'}</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchTerm("");
                        setSortBy('order_index');
                        setShowAdvanced(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#5f031a] text-[#FCF6E1] rounded-full text-sm hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <X size={16} />
                      <span>{t('common.clear') || 'Clear'} {t('common.filter') || 'Filters'}</span>
                    </button>
                    {(selectedCategory || searchTerm || sortBy !== 'order_index') && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-[#5f031a] rounded-full text-xs border border-[#5f031a]/20">
                            {getCategoryLabel(selectedCategory)}
                            <button
                              onClick={() => setSelectedCategory(null)}
                              className="hover:text-[#8d1a2f]"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        )}
                        {searchTerm && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-[#5f031a] rounded-full text-xs border border-[#5f031a]/20">
                            "{searchTerm}"
                            <button
                              onClick={() => setSearchTerm("")}
                              className="hover:text-[#8d1a2f]"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-[#4a4a4a]">
                    {sortedProducts.length === 1 
                      ? t('products.showing_one', { 
                          count: sortedProducts.length,
                          start: startIndex + 1,
                          end: Math.min(endIndex, sortedProducts.length)
                        })
                      : t('products.showing_plural', { 
                          count: sortedProducts.length,
                          start: startIndex + 1,
                          end: Math.min(endIndex, sortedProducts.length)
                        }) || `Showing ${startIndex + 1}-${Math.min(endIndex, sortedProducts.length)} of ${sortedProducts.length} products`}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {paginatedProducts.length > 0 ? (
              <>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
                  role="list"
                >
                  {paginatedProducts.map((product, index) => {
                    const Icon = getCategoryIcon(product.category);

                    // Localized product content
                    const localizedName = getMultilingualText(
                      product.name_multilingual || product.name,
                      currentLang
                    );
                    const localizedDescription = getMultilingualText(
                      product.description_multilingual || product.description,
                      currentLang
                    );
                    const localizedDetails = getMultilingualText(
                      product.details_multilingual || product.details || "",
                      currentLang
                    );
                    const localizedCategoryName =
                      getMultilingualText(
                        product.categories?.name_multilingual ||
                          product.categories?.name ||
                          "",
                        currentLang
                      ) ||
                      getCategoryLabel(product.categories?.slug || product.category);

                    return (
                      <AnimatedSection
                        key={product.id}
                        direction="fade-up"
                        delay={index * 100}
                        className="h-full"
                      >
                        <article
                          onClick={() => handleProductClick(product)}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-[#5f031a]/10 h-full flex flex-col cursor-pointer"
                          role="listitem"
                          itemScope
                          itemType="https://schema.org/Product"
                        >
                          <div className="relative overflow-hidden h-72 bg-gradient-to-br from-[#FCF6E1] to-[#f5f1e8] flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={`${localizedName} - ${localizedCategoryName} product. ${localizedDescription.substring(
                                  0,
                                  100
                                )}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <Icon
                                    className="mx-auto mb-3 text-[#5f031a] opacity-20"
                                    size={48}
                                  />
                                  <span className="text-[#5f031a] text-opacity-30 text-sm">
                                    No image available
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className="inline-block text-xs font-bold text-[#5f031a] bg-white/90 px-3 py-1 rounded-full backdrop-blur-sm">
                                {localizedCategoryName}
                              </span>
                            </div>
                          </div>

                          <div className="p-6 flex flex-col flex-1 min-h-0">
                            <h3
                              className="text-xl font-serif text-[#5f031a] mb-2 group-hover:text-[#8d1a2f] transition-colors"
                              itemProp="name"
                            >
                              {localizedName}
                            </h3>
                            <p
                              className="text-[#4a4a4a] text-sm leading-relaxed mb-4 flex-1 min-h-[3rem]"
                              itemProp="description"
                            >
                              {localizedDescription}
                            </p>

                            {localizedDetails && (
                              <div className="border-t border-[#5f031a]/10 pt-4 mt-auto">
                                <p className="text-[#4a4a4a] text-xs leading-relaxed">
                                  {localizedDetails.substring(0, 120)}
                                  {localizedDetails.length > 120 ? "..." : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </article>
                      </AnimatedSection>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#5f031a] text-[#FCF6E1] hover:bg-[#8d1a2f] transform hover:scale-105'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                      aria-label="Previous page"
                    >
                      {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                      <span>{t('common.previous') || 'Previous'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] px-3 py-2 rounded-lg transition-all duration-300 ${
                                currentPage === page
                                  ? 'bg-[#5f031a] text-[#FCF6E1] font-semibold shadow-md'
                                  : 'bg-white text-[#5f031a] border border-[#5f031a]/20 hover:border-[#5f031a]/40 hover:bg-[#FCF6E1]'
                              }`}
                              aria-label={`Go to page ${page}`}
                              aria-current={currentPage === page ? 'page' : undefined}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-[#4a4a4a]">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#5f031a] text-[#FCF6E1] hover:bg-[#8d1a2f] transform hover:scale-105'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                      aria-label="Next page"
                    >
                      <span>{t('common.next') || 'Next'}</span>
                      {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Droplet
                  className="mx-auto mb-4 text-[#5f031a] opacity-20"
                  size={48}
                />
                <p className="text-xl text-[#4a4a4a]">
                  {t('products.noProductsMatching') || 'No products found matching your filters.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchTerm("");
                    setSortBy('order_index');
                    setShowAdvanced(false);
                  }}
                  className="mt-4 inline-block bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  {t('products.viewAllProducts') || 'View All Products'}
                </button>
              </div>
            )}
          </div>
        </section>

        <ProductDetailDialog
          product={selectedProduct}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />

        <section className="py-20 bg-[#5f031a] text-[#FCF6E1]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection direction="fade-up">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {t('products.questionsAboutProducts')}
              </h2>
              <p className="text-lg mb-8 opacity-90">
                {t('products.helpFindProducts')}
              </p>
            <a
              href="/contact"
              className="inline-block bg-[#FCF6E1] text-[#5f031a] px-8 py-4 rounded-lg text-lg font-medium hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {t('products.getInTouch')}
            </a>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </Layout>
  );
}
