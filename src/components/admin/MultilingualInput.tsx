import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MultilingualContent, updateMultilingualContent, getMultilingualText } from '../../utils/multilingual';

interface MultilingualInputProps {
  label: string;
  value: MultilingualContent | string | null | undefined;
  onChange: (value: MultilingualContent) => void;
  type?: 'text' | 'textarea';
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

export function MultilingualInput({
  label,
  value,
  onChange,
  type = 'text',
  rows = 4,
  placeholder,
  required = false,
}: MultilingualInputProps) {
  const { i18n } = useTranslation();
  const [activeLang, setActiveLang] = useState<string>(i18n.language || 'en');
  const languages = ['en', 'ar'];

  // Convert value to multilingual format if it's a string (backward compatibility)
  const multilingualValue: MultilingualContent = typeof value === 'string' 
    ? { en: value } 
    : (value || {});

  const currentLangValue = getMultilingualText(multilingualValue, activeLang) || '';

  const handleChange = (lang: string, text: string) => {
    const updated = updateMultilingualContent(multilingualValue, lang, text);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#5f031a] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Language Tabs */}
      <div className="flex space-x-2 rtl:space-x-reverse border-b border-gray-200">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-colors rtl:space-x-reverse ${
              activeLang === lang
                ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={14} />
            <span>{lang.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Input Field */}
      {type === 'textarea' ? (
        <textarea
          value={currentLangValue}
          onChange={(e) => handleChange(activeLang, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] resize-none"
        />
      ) : (
        <input
          type="text"
          value={currentLangValue}
          onChange={(e) => handleChange(activeLang, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
        />
      )}

      {/* Show other language values as preview */}
      {languages.filter(lang => lang !== activeLang).map((lang) => {
        const langValue = getMultilingualText(multilingualValue, lang);
        if (!langValue) return null;
        return (
          <div key={lang} className="text-xs text-gray-500 mt-1">
            <span className="font-medium">{lang.toUpperCase()}:</span> {langValue.substring(0, 50)}
            {langValue.length > 50 ? '...' : ''}
          </div>
        );
      })}
    </div>
  );
}

