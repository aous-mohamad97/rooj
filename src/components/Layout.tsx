import { ReactNode, useState, useEffect } from 'react';
import { Menu, X, Instagram, Phone, MapPin, Mail } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getMultilingualText } from '../utils/multilingual';

interface LayoutProps {
  children: ReactNode;
}

interface ContactInfo {
  location?: string;
  location_multilingual?: Record<string, string>;
  phone?: string;
  phone_multilingual?: Record<string, string>;
  email?: string;
  instagram?: string;
  instagram_multilingual?: Record<string, string>;
  facebook?: string;
  twitter?: string;
}

interface SiteInfo {
  site_name?: string;
  site_name_multilingual?: Record<string, string>;
  tagline?: string;
  tagline_multilingual?: Record<string, string>;
  logo?: string;
}

interface Page {
  slug: string;
  title: string;
  title_multilingual?: Record<string, string>;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  
  // Track current path for active link detection
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  
  // Load footer data from backend
  useEffect(() => {
    async function loadFooterData() {
      try {
        // Load contact info
        const { data: contactData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'contact_info')
          .maybeSingle();

        if (contactData?.value) {
          setContactInfo(contactData.value as ContactInfo);
        }

        // Load site info (name, tagline, logo)
        const { data: siteData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'global_seo')
          .maybeSingle();

        if (siteData?.value) {
          const seoData = siteData.value as Record<string, unknown>;
          setSiteInfo({
            site_name: seoData.site_name as string | undefined,
            site_name_multilingual: seoData.site_name_multilingual as Record<string, string> | undefined,
            tagline: seoData.tagline as string | undefined,
            tagline_multilingual: seoData.tagline_multilingual as Record<string, string> | undefined,
            logo: (seoData.logo as string | undefined) || '/logo.png',
          });
        }

        // Load pages for quick links
        const { data: pagesData } = await supabase
          .from('pages')
          .select('slug, title, title_multilingual')
          .eq('is_published', true)
          .in('slug', ['home', 'about', 'products', 'contact'])
          .order('slug');

        if (pagesData) {
          setPages(pagesData);
        }
      } catch (error) {
        console.error('Error loading footer data:', error);
      }
    }

    loadFooterData();
  }, []);

  // Update path when navigation occurs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', updatePath);
    
    // Intercept pushState to detect navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      updatePath();
    };
    
    // Also listen for clicks on links (for custom router navigation)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        setTimeout(updatePath, 0);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.history.pushState = originalPushState;
      document.removeEventListener('click', handleClick);
    };
  }, []);
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FCF6E1]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#5f031a] focus:text-[#FCF6E1] focus:px-4 focus:py-2 focus:rounded-lg">
        {t('common.skipToContent')}
      </a>
      <nav className="bg-[#5f031a] text-[#FCF6E1] sticky top-0 z-50 shadow-lg" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse" aria-label="Rooj Essence Home">
              <img 
                src={siteInfo?.logo || '/logo.png'} 
                alt={`${getMultilingualText(siteInfo?.site_name_multilingual || siteInfo?.site_name, currentLang) || 'Rooj Essence'} Logo - Natural Daily Care Products`} 
                className="h-12 w-auto" 
                width="48" 
                height="48" 
              />
              <div>
                <div className="text-2xl font-serif">
                  {getMultilingualText(siteInfo?.site_name_multilingual || siteInfo?.site_name, currentLang) || 'Rooj Essence'}
                </div>
                <div className="text-xs opacity-90">
                  {getMultilingualText(siteInfo?.tagline_multilingual || siteInfo?.tagline, currentLang) || t('header.tagline')}
                </div>
              </div>
            </a>

            <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <a href="/" className={`hover:text-white transition-all duration-300 transform hover:scale-105 relative group ${isActive('/') ? 'text-white' : ''}`}>
                <span className="relative z-10">{t('nav.home')}</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 rtl:left-auto rtl:right-0 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </a>
              <a href="/about" className={`hover:text-white transition-all duration-300 transform hover:scale-105 relative group ${isActive('/about') ? 'text-white' : ''}`}>
                <span className="relative z-10">{t('nav.about')}</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 rtl:left-auto rtl:right-0 ${isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </a>
              <a href="/products" className={`hover:text-white transition-all duration-300 transform hover:scale-105 relative group ${isActive('/products') ? 'text-white' : ''}`}>
                <span className="relative z-10">{t('nav.products')}</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 rtl:left-auto rtl:right-0 ${isActive('/products') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </a>
              <a href="/contact" className={`hover:text-white transition-all duration-300 transform hover:scale-105 relative group ${isActive('/contact') ? 'text-white' : ''}`}>
                <span className="relative z-10">{t('nav.contact')}</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 rtl:left-auto rtl:right-0 ${isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </a>
              <LanguageSwitcher />
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="/" className={`block py-2 hover:text-white transition-all duration-300 transform hover:translate-x-2 rtl:hover:-translate-x-2 ${isActive('/') ? 'text-white font-medium' : ''}`}>{t('nav.home')}</a>
              <a href="/about" className={`block py-2 hover:text-white transition-all duration-300 transform hover:translate-x-2 rtl:hover:-translate-x-2 ${isActive('/about') ? 'text-white font-medium' : ''}`}>{t('nav.about')}</a>
              <a href="/products" className={`block py-2 hover:text-white transition-all duration-300 transform hover:translate-x-2 rtl:hover:-translate-x-2 ${isActive('/products') ? 'text-white font-medium' : ''}`}>{t('nav.products')}</a>
              <a href="/contact" className={`block py-2 hover:text-white transition-all duration-300 transform hover:translate-x-2 rtl:hover:-translate-x-2 ${isActive('/contact') ? 'text-white font-medium' : ''}`}>{t('nav.contact')}</a>
              <div className="pt-2 border-t border-[#5f031a]/30">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </nav>

      <main id="main-content" role="main">{children}</main>

      <footer className="bg-[#5f031a] text-[#FCF6E1]" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-serif mb-4">
                {getMultilingualText(siteInfo?.site_name_multilingual || siteInfo?.site_name, currentLang) || 'Rooj Essence'}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {getMultilingualText(siteInfo?.tagline_multilingual || siteInfo?.tagline, currentLang) || t('footer.tagline')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-serif mb-4">{t('footer.contact')}</h3>
              <div className="space-y-2 text-sm">
                {contactInfo?.location && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <MapPin size={16} />
                    <span>
                      {getMultilingualText(contactInfo.location_multilingual || contactInfo.location, currentLang) || contactInfo.location}
                    </span>
                  </div>
                )}
                {contactInfo?.phone && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Phone size={16} />
                    <a 
                      href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                      className="hover:text-white transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      {getMultilingualText(contactInfo.phone_multilingual || contactInfo.phone, currentLang) || contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo?.email && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Mail size={16} />
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="hover:text-white transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                {contactInfo?.instagram && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Instagram size={16} />
                    <a 
                      href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-white transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      {getMultilingualText(contactInfo.instagram_multilingual || contactInfo.instagram, currentLang) || contactInfo.instagram}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif mb-4">{t('common.quickLinks', 'Quick Links')}</h3>
              <div className="space-y-2 text-sm">
                {pages.length > 0 ? (
                  pages.map((page) => {
                    const pageTitle = getMultilingualText(page.title_multilingual || page.title, currentLang) || page.title;
                    const navKey = page.slug === 'home' ? 'nav.home' : 
                                  page.slug === 'about' ? 'nav.about' :
                                  page.slug === 'products' ? 'nav.products' :
                                  page.slug === 'contact' ? 'nav.contact' : null;
                    return (
                      <a 
                        key={page.slug}
                        href={`/${page.slug === 'home' ? '' : page.slug}`} 
                        className="block hover:text-white transition-all duration-300 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                      >
                        {navKey ? t(navKey) : pageTitle}
                      </a>
                    );
                  })
                ) : (
                  <>
                    <a href="/" className="block hover:text-white transition-all duration-300 transform hover:translate-x-1 rtl:hover:-translate-x-1">{t('nav.home')}</a>
                    <a href="/about" className="block hover:text-white transition-all duration-300 transform hover:translate-x-1 rtl:hover:-translate-x-1">{t('nav.about')}</a>
                    <a href="/products" className="block hover:text-white transition-all duration-300 transform hover:translate-x-1 rtl:hover:-translate-x-1">{t('nav.products')}</a>
                    <a href="/contact" className="block hover:text-white transition-all duration-300 transform hover:translate-x-1 rtl:hover:-translate-x-1">{t('nav.contact')}</a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#5f031a]/30 text-center text-sm opacity-75">
            <p>
              &copy; {new Date().getFullYear()} {getMultilingualText(siteInfo?.site_name_multilingual || siteInfo?.site_name, currentLang) || 'Rooj Essence'}. {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
