import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flagCode: 'GB', flagColors: 'bg-blue-700' },
    { code: 'ar', name: 'العربية', flagCode: 'SY', flagColors: 'bg-red-600' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Store preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', langCode);
    }
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors rtl:space-x-reverse"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span 
          className={`inline-flex items-center justify-center w-6 h-4 rounded text-[10px] font-bold text-white ${currentLanguage.flagColors} shadow-sm`}
          role="img" 
          aria-label={`${currentLanguage.name} flag`}
        >
          {currentLanguage.flagCode}
        </span>
        <span className="text-sm hidden sm:inline">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px] z-50 rtl:left-0 rtl:right-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2 rtl:space-x-reverse rtl:text-right ${
                i18n.language === lang.code ? 'bg-[#FCF6E1] text-[#5f031a] font-medium' : 'text-gray-700'
              }`}
            >
              <span 
                className={`inline-flex items-center justify-center w-6 h-4 rounded text-[10px] font-bold text-white ${lang.flagColors} shadow-sm`}
                role="img" 
                aria-label={`${lang.name} flag`}
              >
                {lang.flagCode}
              </span>
              <span>{lang.name}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto rtl:mr-auto rtl:ml-0 text-[#5f031a]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

