/**
 * Utility functions for handling multilingual content from the database
 */

export type MultilingualContent = {
  [key: string]: string | any;
};

/**
 * Get content for a specific language with fallback to English
 * @param content - Multilingual content object (e.g., { "en": "...", "ar": "..." })
 * @param lang - Target language code (default: 'en')
 * @param fallback - Fallback language code (default: 'en')
 * @returns Content in the requested language or fallback
 */
export function getMultilingualText(
  content: MultilingualContent | string | null | undefined,
  lang: string = 'en',
  fallback: string = 'en'
): string {
  if (!content) return '';
  
  // If it's already a string (backward compatibility), return it
  if (typeof content === 'string') {
    return content;
  }
  
  // If it's an object with language keys
  if (typeof content === 'object') {
    // Try requested language first
    if (content[lang]) {
      return String(content[lang]);
    }
    
    // Fallback to default language
    if (content[fallback]) {
      return String(content[fallback]);
    }
    
    // Try to get any available language
    const keys = Object.keys(content);
    if (keys.length > 0) {
      return String(content[keys[0]]);
    }
  }
  
  return '';
}

/**
 * Get multilingual object for a specific language
 * @param content - Multilingual content object
 * @param lang - Target language code
 * @param fallback - Fallback language code
 * @returns Content object in the requested language or fallback
 */
export function getMultilingualObject(
  content: MultilingualContent | any,
  lang: string = 'en',
  fallback: string = 'en'
): any {
  if (!content) return {};
  
  // If it's already an object without language keys (backward compatibility)
  if (typeof content === 'object' && !content[lang] && !content[fallback]) {
    return content;
  }
  
  // If it's an object with language keys
  if (typeof content === 'object') {
    // Try requested language first
    if (content[lang]) {
      return content[lang];
    }
    
    // Fallback to default language
    if (content[fallback]) {
      return content[fallback];
    }
    
    // Try to get any available language
    const keys = Object.keys(content);
    if (keys.length > 0) {
      return content[keys[0]];
    }
  }
  
  return {};
}

/**
 * Create multilingual content object
 * @param lang - Language code
 * @param text - Text content
 * @returns Multilingual content object
 */
export function createMultilingualContent(
  lang: string,
  text: string
): MultilingualContent {
  return { [lang]: text };
}

/**
 * Update multilingual content with new language
 * @param existing - Existing multilingual content
 * @param lang - Language code
 * @param text - Text content
 * @returns Updated multilingual content object
 */
export function updateMultilingualContent(
  existing: MultilingualContent | null | undefined,
  lang: string,
  text: string
): MultilingualContent {
  const current = existing || {};
  return {
    ...current,
    [lang]: text,
  };
}

