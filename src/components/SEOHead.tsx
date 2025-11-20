import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getMultilingualText } from '../utils/multilingual';

interface SEOData {
  meta_title?: string | Record<string, string>;
  meta_title_multilingual?: Record<string, string>;
  meta_description?: string | Record<string, string>;
  meta_description_multilingual?: Record<string, string>;
  meta_keywords?: string | Record<string, string>;
  meta_keywords_multilingual?: Record<string, string>;
  og_title?: string | Record<string, string>;
  og_title_multilingual?: Record<string, string>;
  og_description?: string | Record<string, string>;
  og_description_multilingual?: Record<string, string>;
  og_image?: string;
  twitter_card?: string;
  twitter_title?: string | Record<string, string>;
  twitter_title_multilingual?: Record<string, string>;
  twitter_description?: string | Record<string, string>;
  twitter_description_multilingual?: Record<string, string>;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
}

interface GlobalSEO {
  site_name: string | Record<string, string>;
  site_name_multilingual?: Record<string, string>;
  default_meta_title: string | Record<string, string>;
  default_meta_title_multilingual?: Record<string, string>;
  default_meta_description: string | Record<string, string>;
  default_meta_description_multilingual?: Record<string, string>;
  default_meta_keywords: string | Record<string, string>;
  default_meta_keywords_multilingual?: Record<string, string>;
  default_og_image: string;
  twitter_handle: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  schema_markup: string;
}

interface SEOHeadProps {
  pageSlug?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageImage?: string;
}

// Helper function to update or create meta tag
const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
  if (typeof document === 'undefined') return;
  
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

// Helper function to update or create link tag
const updateLinkTag = (rel: string, href: string, additionalAttrs?: Record<string, string>) => {
  if (typeof document === 'undefined') return;
  
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  if (additionalAttrs) {
    Object.entries(additionalAttrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
};

// Helper function to remove meta/link tags
const removeTag = (selector: string) => {
  if (typeof document === 'undefined') return;
  const element = document.querySelector(selector);
  if (element) {
    element.remove();
  }
};

export function SEOHead({ pageSlug, pageTitle, pageDescription, pageImage }: SEOHeadProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [seoData, setSeoData] = useState<{
    globalSEO: GlobalSEO | null;
    pageSEO: SEOData | null;
    pageTitleFromDB: string | null;
    currentUrl: string;
    siteUrl: string;
  } | null>(null);

  useEffect(() => {
    const loadSEO = async () => {
      let globalSEO: GlobalSEO | null = null;
      let pageSEO: SEOData | null = null;
      let pageTitleFromDB: string | null = null;

      // Load global SEO settings
      const { data: globalData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'global_seo')
        .maybeSingle();

      if (globalData?.value) {
        globalSEO = globalData.value as GlobalSEO;
      }

      // Load page-specific SEO if pageSlug is provided
      if (pageSlug) {
        const { data: pageData } = await supabase
          .from('pages')
          .select('content, title, title_multilingual')
          .eq('slug', pageSlug)
          .maybeSingle();

        if (pageData?.content?.seo) {
          pageSEO = pageData.content.seo as SEOData;
        }

        if (pageData?.title_multilingual) {
          pageTitleFromDB = getMultilingualText(pageData.title_multilingual, currentLang) || pageData.title || null;
        } else if (pageData?.title) {
          pageTitleFromDB = pageData.title;
        }
      }

      const currentUrl = typeof window !== 'undefined' 
        ? window.location.origin + window.location.pathname 
        : '';
      const siteUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : '';

      setSeoData({
        globalSEO,
        pageSEO,
        pageTitleFromDB,
        currentUrl,
        siteUrl,
      });
    };

    loadSEO();
  }, [pageSlug, currentLang]);

  // Analytics scripts (client-side only)
  useEffect(() => {
    if (!seoData?.globalSEO || typeof window === 'undefined') return;

    const { globalSEO } = seoData;

    // Google Analytics
    if (globalSEO.google_analytics_id) {
      const existingGA = document.getElementById('google-analytics');
      if (existingGA) existingGA.remove();

      const gaScript = document.createElement('script');
      gaScript.id = 'google-analytics';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${globalSEO.google_analytics_id}`;
      document.head.appendChild(gaScript);

      gaScript.onload = () => {
        const gtagScript = document.createElement('script');
        gtagScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${globalSEO.google_analytics_id}');
        `;
        document.head.appendChild(gtagScript);
      };
    }

    // Google Tag Manager
    if (globalSEO.google_tag_manager_id) {
      const existingGTM = document.getElementById('google-tag-manager');
      if (existingGTM) existingGTM.remove();

      const gtmScript = document.createElement('script');
      gtmScript.id = 'google-tag-manager';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${globalSEO.google_tag_manager_id}');
      `;
      document.head.appendChild(gtmScript);

      let gtmNoscript = document.getElementById('google-tag-manager-noscript');
      if (gtmNoscript) gtmNoscript.remove();
      gtmNoscript = document.createElement('noscript');
      gtmNoscript.id = 'google-tag-manager-noscript';
      gtmNoscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${globalSEO.google_tag_manager_id}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.appendChild(gtmNoscript);
    }

    // Facebook Pixel
    if (globalSEO.facebook_pixel_id) {
      const existingFB = document.getElementById('facebook-pixel');
      if (existingFB) existingFB.remove();

      const fbScript = document.createElement('script');
      fbScript.id = 'facebook-pixel';
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${globalSEO.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      const fbNoscript = document.createElement('noscript');
      fbNoscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${globalSEO.facebook_pixel_id}&ev=PageView&noscript=1"/>
      `;
      document.body.appendChild(fbNoscript);
    }
  }, [seoData]);

  // Update document head with SEO data
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Helper function to get multilingual text
    const getSEOText = (value: string | Record<string, string> | undefined, multilingualValue?: Record<string, string>, fallback: string = ''): string => {
      if (multilingualValue) {
        return getMultilingualText(multilingualValue, currentLang) || fallback;
      }
      if (typeof value === 'object' && value !== null) {
        return getMultilingualText(value, currentLang) || fallback;
      }
      return (value as string) || fallback;
    };

    if (!seoData) {
      // Set default SEO while loading
      document.title = 'Rooj Essence - Natural Daily Care';
      updateMetaTag('description', 'Rooj Essence is a Syrian brand dedicated to natural daily care products.');
      return;
    }

    const { globalSEO, pageSEO, pageTitleFromDB, currentUrl, siteUrl } = seoData;

    // Determine final values (page-specific overrides global defaults) with multilingual support
    const finalTitle = getSEOText(
      pageSEO?.meta_title,
      pageSEO?.meta_title_multilingual,
      pageTitle || pageTitleFromDB || getSEOText(globalSEO?.default_meta_title, globalSEO?.default_meta_title_multilingual, 'Rooj Essence - Natural Daily Care')
    );
    
    const finalDescription = getSEOText(
      pageSEO?.meta_description,
      pageSEO?.meta_description_multilingual,
      pageDescription || getSEOText(globalSEO?.default_meta_description, globalSEO?.default_meta_description_multilingual, 'Rooj Essence is a Syrian brand dedicated to natural daily care products.')
    );
    
    const finalKeywords = getSEOText(
      pageSEO?.meta_keywords,
      pageSEO?.meta_keywords_multilingual,
      getSEOText(globalSEO?.default_meta_keywords, globalSEO?.default_meta_keywords_multilingual, 'natural care, skincare, fragrances, bakhoor, Syrian products')
    );
    
    const finalOGImage = pageSEO?.og_image || pageImage || globalSEO?.default_og_image || `${siteUrl}/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg`;
    const finalOGTitle = getSEOText(pageSEO?.og_title, pageSEO?.og_title_multilingual, finalTitle);
    const finalOGDescription = getSEOText(pageSEO?.og_description, pageSEO?.og_description_multilingual, finalDescription);
    const finalTwitterTitle = getSEOText(pageSEO?.twitter_title, pageSEO?.twitter_title_multilingual, finalTitle);
    const finalTwitterDescription = getSEOText(pageSEO?.twitter_description, pageSEO?.twitter_description_multilingual, finalDescription);
    const finalTwitterImage = pageSEO?.twitter_image || finalOGImage;
    const finalTwitterCard = pageSEO?.twitter_card || 'summary_large_image';
    
    // Language-specific canonical URLs
    const baseCanonical = pageSEO?.canonical_url || currentUrl || '/';
    const finalCanonical = baseCanonical.includes('?') 
      ? `${baseCanonical}&lang=${currentLang}` 
      : `${baseCanonical}?lang=${currentLang}`;
    
    const finalRobots = pageSEO?.robots || 'index, follow';
    const siteName = getSEOText(globalSEO?.site_name, globalSEO?.site_name_multilingual, 'Rooj Essence');

    // Generate alternate language URLs for hreflang
    const alternateUrls = {
      en: baseCanonical.includes('?') ? `${baseCanonical.split('?')[0]}?lang=en` : `${baseCanonical}?lang=en`,
      ar: baseCanonical.includes('?') ? `${baseCanonical.split('?')[0]}?lang=ar` : `${baseCanonical}?lang=ar`,
    };

    // Update title
    document.title = finalTitle;

    // Update basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('robots', finalRobots);

    // Update canonical URL
    updateLinkTag('canonical', finalCanonical);

    // Update Open Graph tags
    updateMetaTag('og:title', finalOGTitle, 'property');
    updateMetaTag('og:description', finalOGDescription, 'property');
    updateMetaTag('og:image', finalOGImage, 'property');
    updateMetaTag('og:url', finalCanonical, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', siteName, 'property');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', finalTwitterCard);
    updateMetaTag('twitter:title', finalTwitterTitle);
    updateMetaTag('twitter:description', finalTwitterDescription);
    updateMetaTag('twitter:image', finalTwitterImage);
    if (globalSEO?.twitter_handle) {
      updateMetaTag('twitter:site', globalSEO.twitter_handle);
      updateMetaTag('twitter:creator', globalSEO.twitter_handle);
    }

    // Update language
    document.documentElement.setAttribute('lang', currentLang);

    // Update hreflang links
    removeTag('link[rel="alternate"][hreflang="en"]');
    removeTag('link[rel="alternate"][hreflang="ar"]');
    removeTag('link[rel="alternate"][hreflang="x-default"]');
    
    updateLinkTag('alternate', alternateUrls.en, { hreflang: 'en' });
    updateLinkTag('alternate', alternateUrls.ar, { hreflang: 'ar' });
    updateLinkTag('alternate', alternateUrls.en, { hreflang: 'x-default' });

    // Update schema markup
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (globalSEO?.schema_markup) {
      try {
        const schemaMarkup = JSON.parse(globalSEO.schema_markup);
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.textContent = JSON.stringify(schemaMarkup);
        document.head.appendChild(schemaScript);
      } catch (e) {
        console.error('Invalid schema markup JSON:', e);
      }
    }

    // Cleanup function to restore defaults when component unmounts
    return () => {
      document.title = 'Rooj Essence - Natural Daily Care';
      updateMetaTag('description', 'Rooj Essence is a Syrian brand dedicated to natural daily care products.');
    };
  }, [seoData, currentLang, pageTitle, pageDescription, pageImage]);

  // This component doesn't render anything
  return null;
}
