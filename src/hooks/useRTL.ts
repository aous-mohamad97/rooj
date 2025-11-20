import { useTranslation } from 'react-i18next';

export function useRTL() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    textAlignClass: isRTL ? 'text-right' : 'text-left',
  };
}

