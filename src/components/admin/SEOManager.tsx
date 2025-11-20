import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Search, Globe, FileText, Eye, Code, Map } from 'lucide-react';
import { MultilingualInput } from './MultilingualInput';
import { MultilingualContent } from '../../utils/multilingual';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: {
    seo?: {
      meta_title?: string | MultilingualContent;
      meta_title_multilingual?: MultilingualContent;
      meta_description?: string | MultilingualContent;
      meta_description_multilingual?: MultilingualContent;
      meta_keywords?: string | MultilingualContent;
      meta_keywords_multilingual?: MultilingualContent;
      og_title?: string | MultilingualContent;
      og_title_multilingual?: MultilingualContent;
      og_description?: string | MultilingualContent;
      og_description_multilingual?: MultilingualContent;
      og_image?: string;
      twitter_card?: string;
      twitter_title?: string | MultilingualContent;
      twitter_title_multilingual?: MultilingualContent;
      twitter_description?: string | MultilingualContent;
      twitter_description_multilingual?: MultilingualContent;
      twitter_image?: string;
      canonical_url?: string;
      robots?: string;
    };
  };
}

interface GlobalSEO {
  site_name: string | MultilingualContent;
  site_name_multilingual?: MultilingualContent;
  default_meta_title: string | MultilingualContent;
  default_meta_title_multilingual?: MultilingualContent;
  default_meta_description: string | MultilingualContent;
  default_meta_description_multilingual?: MultilingualContent;
  default_meta_keywords: string | MultilingualContent;
  default_meta_keywords_multilingual?: MultilingualContent;
  default_og_image: string;
  twitter_handle: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  robots_txt: string;
  sitemap_enabled: boolean;
  schema_markup: string;
}

export function SEOManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [globalSEO, setGlobalSEO] = useState<GlobalSEO>({
    site_name: 'Rooj Essence',
    default_meta_title: '',
    default_meta_description: '',
    default_meta_keywords: '',
    default_og_image: '',
    twitter_handle: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    robots_txt: 'User-agent: *\nAllow: /',
    sitemap_enabled: true,
    schema_markup: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'pages'>('global');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    // Load pages
    const { data: pagesData } = await supabase
      .from('pages')
      .select('*')
      .order('slug');

    if (pagesData) {
      setPages(pagesData);
    }

    // Load global SEO settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'global_seo')
      .maybeSingle();

    if (settingsData && settingsData.value) {
      setGlobalSEO({ ...globalSEO, ...(settingsData.value as GlobalSEO) });
    }

    setLoading(false);
  };

  const handleSaveGlobalSEO = async () => {
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'global_seo',
        value: globalSEO,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage('Error saving global SEO settings');
    } else {
      setMessage('Global SEO settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }

    setSaving(false);
  };

  const handleSavePageSEO = async () => {
    if (!selectedPage) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('pages')
      .update({
        content: selectedPage.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPage.id);

    if (error) {
      setMessage('Error saving page SEO');
    } else {
      setMessage('Page SEO saved successfully!');
      await loadData();
      setTimeout(() => {
        setMessage('');
        setSelectedPage(null);
      }, 1500);
    }

    setSaving(false);
  };

  const updatePageSEO = (field: string, value: string | MultilingualContent) => {
    if (!selectedPage) return;

    const newContent = { ...selectedPage.content };
    if (!newContent.seo) {
      newContent.seo = {};
    }

    (newContent.seo as Record<string, string | MultilingualContent>)[field] = value;
    setSelectedPage({ ...selectedPage, content: newContent });
  };

  const updateGlobalSEO = (field: keyof GlobalSEO, value: string | boolean | MultilingualContent) => {
    setGlobalSEO({ ...globalSEO, [field]: value });
  };

  if (loading) {
    return <div className="text-center py-8">Loading SEO settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-[#5f031a] flex items-center space-x-2">
          <Search size={24} />
          <span>SEO Management</span>
        </h2>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('global')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'global'
                ? 'border-[#5f031a] text-[#5f031a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={18} className="inline mr-2" />
            Global SEO
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'pages'
                ? 'border-[#5f031a] text-[#5f031a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={18} className="inline mr-2" />
            Page SEO
          </button>
        </nav>
      </div>

      {/* Global SEO Tab */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          <div className="bg-[#FCF6E1] rounded-lg p-6">
            <h3 className="text-lg font-serif text-[#5f031a] mb-4 flex items-center space-x-2">
              <Globe size={20} />
              <span>Site-Wide SEO Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MultilingualInput
                  label="Site Name"
                  value={globalSEO.site_name_multilingual || globalSEO.site_name}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const nameValue = (value as Record<string, string>)[defaultLang] || '';
                    setGlobalSEO({ ...globalSEO, site_name: nameValue, site_name_multilingual: value });
                  }}
                  type="text"
                />
              </div>

              <div>
                <MultilingualInput
                  label="Default Meta Title"
                  value={globalSEO.default_meta_title_multilingual || globalSEO.default_meta_title}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const titleValue = (value as Record<string, string>)[defaultLang] || '';
                    setGlobalSEO({ ...globalSEO, default_meta_title: titleValue, default_meta_title_multilingual: value });
                  }}
                  type="text"
                  placeholder="Default title for pages without specific SEO"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {String(globalSEO.default_meta_title || '').length}/60 characters
                </p>
              </div>

              <div className="md:col-span-2">
                <MultilingualInput
                  label="Default Meta Description"
                  value={globalSEO.default_meta_description_multilingual || globalSEO.default_meta_description}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const descValue = (value as Record<string, string>)[defaultLang] || '';
                    setGlobalSEO({ ...globalSEO, default_meta_description: descValue, default_meta_description_multilingual: value });
                  }}
                  type="textarea"
                  rows={3}
                  placeholder="Default description for pages without specific SEO"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {String(globalSEO.default_meta_description || '').length}/160 characters
                </p>
              </div>

              <div className="md:col-span-2">
                <MultilingualInput
                  label="Default Meta Keywords"
                  value={globalSEO.default_meta_keywords_multilingual || globalSEO.default_meta_keywords}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const keywordsValue = (value as Record<string, string>)[defaultLang] || '';
                    setGlobalSEO({ ...globalSEO, default_meta_keywords: keywordsValue, default_meta_keywords_multilingual: value });
                  }}
                  type="text"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Default OG Image URL
                </label>
                <input
                  type="url"
                  value={globalSEO.default_og_image}
                  onChange={(e) => updateGlobalSEO('default_og_image', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={globalSEO.twitter_handle}
                  onChange={(e) => updateGlobalSEO('twitter_handle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="@roojessence"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCF6E1] rounded-lg p-6">
            <h3 className="text-lg font-serif text-[#5f031a] mb-4 flex items-center space-x-2">
              <Code size={20} />
              <span>Analytics & Tracking</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={globalSEO.google_analytics_id}
                  onChange={(e) => updateGlobalSEO('google_analytics_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={globalSEO.google_tag_manager_id}
                  onChange={(e) => updateGlobalSEO('google_tag_manager_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="GTM-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={globalSEO.facebook_pixel_id}
                  onChange={(e) => updateGlobalSEO('facebook_pixel_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="123456789012345"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCF6E1] rounded-lg p-6">
            <h3 className="text-lg font-serif text-[#5f031a] mb-4 flex items-center space-x-2">
              <Map size={20} />
              <span>Technical SEO</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Robots.txt Content
                </label>
                <textarea
                  value={globalSEO.robots_txt}
                  onChange={(e) => updateGlobalSEO('robots_txt', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sitemap_enabled"
                  checked={globalSEO.sitemap_enabled}
                  onChange={(e) => updateGlobalSEO('sitemap_enabled', e.target.checked)}
                  className="w-4 h-4 text-[#5f031a] focus:ring-[#5f031a] border-gray-300 rounded"
                />
                <label htmlFor="sitemap_enabled" className="text-sm font-medium text-[#5f031a]">
                  Enable Sitemap Generation
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Schema Markup (JSON-LD)
                </label>
                <textarea
                  value={globalSEO.schema_markup}
                  onChange={(e) => updateGlobalSEO('schema_markup', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] font-mono text-sm"
                  placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter valid JSON-LD schema markup for your organization
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveGlobalSEO}
            disabled={saving}
            className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Global SEO Settings'}</span>
          </button>
        </div>
      )}

      {/* Page SEO Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {!selectedPage ? (
            <div className="space-y-4">
              <h3 className="text-lg font-serif text-[#5f031a] mb-4">Select a Page to Edit SEO</h3>
              {pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className="flex items-center justify-between p-4 bg-[#FCF6E1] rounded-lg hover:shadow-lg transition-all cursor-pointer"
                >
                  <div>
                    <h4 className="text-lg font-medium text-[#5f031a]">{page.title}</h4>
                    <p className="text-sm text-gray-600">/{page.slug}</p>
                  </div>
                  <Eye size={20} className="text-[#5f031a]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FCF6E1] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-[#5f031a]">
                  SEO Settings for: {selectedPage.title}
                </h3>
                <button
                  onClick={() => setSelectedPage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to Pages
                </button>
              </div>

              <div className="space-y-6">
                <MultilingualInput
                  label="Meta Title"
                  value={selectedPage.content.seo?.meta_title_multilingual || selectedPage.content.seo?.meta_title || ''}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const titleValue = (value as Record<string, string>)[defaultLang] || '';
                    updatePageSEO('meta_title', titleValue);
                    updatePageSEO('meta_title_multilingual', value);
                  }}
                  type="text"
                  placeholder="Page title for search engines"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {String(selectedPage.content.seo?.meta_title || '').length}/60 characters
                </p>

                <MultilingualInput
                  label="Meta Description"
                  value={selectedPage.content.seo?.meta_description_multilingual || selectedPage.content.seo?.meta_description || ''}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const descValue = (value as Record<string, string>)[defaultLang] || '';
                    updatePageSEO('meta_description', descValue);
                    updatePageSEO('meta_description_multilingual', value);
                  }}
                  type="textarea"
                  rows={3}
                  placeholder="Page description for search engines"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {String(selectedPage.content.seo?.meta_description || '').length}/160 characters
                </p>

                <MultilingualInput
                  label="Meta Keywords"
                  value={selectedPage.content.seo?.meta_keywords_multilingual || selectedPage.content.seo?.meta_keywords || ''}
                  onChange={(value) => {
                    const defaultLang = 'en';
                    const keywordsValue = (value as Record<string, string>)[defaultLang] || '';
                    updatePageSEO('meta_keywords', keywordsValue);
                    updatePageSEO('meta_keywords_multilingual', value);
                  }}
                  type="text"
                  placeholder="keyword1, keyword2, keyword3"
                />

                <div className="border-t border-[#5f031a]/20 pt-6">
                  <h4 className="text-md font-serif text-[#5f031a] mb-4">Open Graph (Facebook)</h4>
                  <div className="space-y-4">
                    <MultilingualInput
                      label="OG Title"
                      value={selectedPage.content.seo?.og_title_multilingual || selectedPage.content.seo?.og_title || ''}
                      onChange={(value) => {
                        const defaultLang = 'en';
                        const ogTitleValue = (value as Record<string, string>)[defaultLang] || '';
                        updatePageSEO('og_title', ogTitleValue);
                        updatePageSEO('og_title_multilingual', value);
                      }}
                      type="text"
                    />
                    <MultilingualInput
                      label="OG Description"
                      value={selectedPage.content.seo?.og_description_multilingual || selectedPage.content.seo?.og_description || ''}
                      onChange={(value) => {
                        const defaultLang = 'en';
                        const ogDescValue = (value as Record<string, string>)[defaultLang] || '';
                        updatePageSEO('og_description', ogDescValue);
                        updatePageSEO('og_description_multilingual', value);
                      }}
                      type="textarea"
                      rows={2}
                    />
                    <div>
                      <label className="block text-sm font-medium text-[#5f031a] mb-2">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={selectedPage.content.seo?.og_image || ''}
                        onChange={(e) => updatePageSEO('og_image', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#5f031a]/20 pt-6">
                  <h4 className="text-md font-serif text-[#5f031a] mb-4">Twitter Cards</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5f031a] mb-2">
                        Twitter Card Type
                      </label>
                      <select
                        value={selectedPage.content.seo?.twitter_card || 'summary'}
                        onChange={(e) => updatePageSEO('twitter_card', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                      </select>
                    </div>
                    <MultilingualInput
                      label="Twitter Title"
                      value={selectedPage.content.seo?.twitter_title_multilingual || selectedPage.content.seo?.twitter_title || ''}
                      onChange={(value) => {
                        const defaultLang = 'en';
                        const twitterTitleValue = (value as Record<string, string>)[defaultLang] || '';
                        updatePageSEO('twitter_title', twitterTitleValue);
                        updatePageSEO('twitter_title_multilingual', value);
                      }}
                      type="text"
                    />
                    <MultilingualInput
                      label="Twitter Description"
                      value={selectedPage.content.seo?.twitter_description_multilingual || selectedPage.content.seo?.twitter_description || ''}
                      onChange={(value) => {
                        const defaultLang = 'en';
                        const twitterDescValue = (value as Record<string, string>)[defaultLang] || '';
                        updatePageSEO('twitter_description', twitterDescValue);
                        updatePageSEO('twitter_description_multilingual', value);
                      }}
                      type="textarea"
                      rows={2}
                    />
                    <div>
                      <label className="block text-sm font-medium text-[#5f031a] mb-2">
                        Twitter Image URL
                      </label>
                      <input
                        type="url"
                        value={selectedPage.content.seo?.twitter_image || ''}
                        onChange={(e) => updatePageSEO('twitter_image', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#5f031a]/20 pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5f031a] mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={selectedPage.content.seo?.canonical_url || ''}
                        onChange={(e) => updatePageSEO('canonical_url', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                        placeholder="https://example.com/page"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5f031a] mb-2">
                        Robots Meta Tag
                      </label>
                      <select
                        value={selectedPage.content.seo?.robots || 'index, follow'}
                        onChange={(e) => updatePageSEO('robots', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                      >
                        <option value="index, follow">Index, Follow</option>
                        <option value="noindex, follow">Noindex, Follow</option>
                        <option value="index, nofollow">Index, Nofollow</option>
                        <option value="noindex, nofollow">Noindex, Nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSavePageSEO}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Page SEO'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedPage(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

