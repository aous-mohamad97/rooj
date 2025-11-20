import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Droplet, Sparkles, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMultilingualText } from '../utils/multilingual';

interface Product {
  id: string;
  name: string;
  name_multilingual?: Record<string, string>;
  category: string;
  categories?: {
    id: string;
    slug: string;
    name: string;
    name_multilingual?: Record<string, string>;
    icon?: string;
  } | null;
  description: string;
  description_multilingual?: Record<string, string>;
  details: string;
  details_multilingual?: Record<string, string>;
  image_url: string;
  order_index: number;
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({ product, isOpen, onClose }: ProductDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skin_care':
        return Droplet;
      case 'fragrances':
        return Sparkles;
      case 'bakhoor':
        return Flame;
      default:
        return Droplet;
    }
  };

  const getCategoryLabel = (category: string) => {
    // Use category name from relationship if available
    if (product.categories?.name_multilingual) {
      return getMultilingualText(product.categories.name_multilingual, currentLang);
    }
    if (product.categories?.name) {
      return product.categories.name;
    }
    
    // Fallback to hardcoded labels
    switch (category) {
      case 'skin_care':
        return t('product.category.skinCare');
      case 'fragrances':
        return t('product.category.fragrances');
      case 'bakhoor':
        return t('product.category.bakhoor');
      default:
        return category;
    }
  };

  const productCategory = product.categories?.slug || product.category;
  const Icon = getCategoryIcon(productCategory);

  return (
    <>
      {/* Backdrop and Dialog Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      >
        {/* Dialog */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-[#5f031a] text-[#FCF6E1] rounded-full hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
            {/* Image Section */}
            <div className="relative h-auto w-full lg:w-1/2 bg-gradient-to-br from-[#FCF6E1] to-[#f5f1e8] flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={getMultilingualText(product.name_multilingual || product.name, currentLang)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Icon className="mx-auto mb-3 text-[#5f031a] opacity-20" size={64} />
                    <span className="text-[#5f031a] text-opacity-30 text-sm">
                      No image available
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="inline-block text-xs font-bold text-[#5f031a] bg-white/90 px-3 py-1 rounded-full backdrop-blur-sm">
                  {getCategoryLabel(productCategory)}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif text-[#5f031a] mb-3">
                    {getMultilingualText(product.name_multilingual || product.name, currentLang)}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Icon className="text-[#5f031a]" size={20} />
                    <span className="text-sm text-[#4a4a4a] font-medium">
                      {getCategoryLabel(productCategory)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-serif text-[#5f031a] mb-2">{t('product.description', 'Description')}</h3>
                  <p className="text-[#4a4a4a] leading-relaxed">
                    {getMultilingualText(product.description_multilingual || product.description, currentLang)}
                  </p>
                </div>

                {/* Details */}
                {product.details && (
                  <div>
                    <h3 className="text-lg font-serif text-[#5f031a] mb-2">{t('product.details', 'Details')}</h3>
                    <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-line">
                      {getMultilingualText(product.details_multilingual || product.details, currentLang)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#5f031a]/10">
                  <div className="flex flex-col sm:flex-row gap-4 rtl:flex-row-reverse">
                    <a
                      href="/contact"
                      className="flex-1 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg text-center font-medium hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      {t('product.contactUs')}
                    </a>
                    <button
                      onClick={onClose}
                      className="flex-1 border-2 border-[#5f031a] text-[#5f031a] px-6 py-3 rounded-lg font-medium hover:bg-[#5f031a] hover:text-[#FCF6E1] transition-all duration-300 transform hover:scale-105"
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

