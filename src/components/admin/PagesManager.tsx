import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, X } from 'lucide-react';
import { MultilingualInput } from './MultilingualInput';
import { MultilingualContent } from '../../utils/multilingual';

interface Page {
  id: string;
  slug: string;
  title: string;
  title_multilingual?: MultilingualContent;
  content: Record<string, unknown>;
  content_multilingual?: MultilingualContent;
  is_published: boolean;
}

export function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*, title_multilingual, content_multilingual')
      .order('slug');

    if (data) {
      setPages(data);
    }
    setLoading(false);
  };

  const handleEdit = (page: Page) => {
    setEditingPage({ ...page });
  };

  const handleCancel = () => {
    setEditingPage(null);
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('pages')
      .update({
        content: editingPage.content,
        content_multilingual: editingPage.content_multilingual || {},
        title_multilingual: editingPage.title_multilingual || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingPage.id);

    if (error) {
      setMessage('Error saving page');
    } else {
      setMessage('Page saved successfully!');
      await loadPages();
      setTimeout(() => {
        setEditingPage(null);
        setMessage('');
      }, 1500);
    }

    setSaving(false);
  };

  const renderEditor = (page: Page) => {
    switch (page.slug) {
      case 'home':
        return (
          <div className="space-y-4">
            <MultilingualInput
              label="Hero Heading"
              value={((page.content_multilingual as Record<string, unknown>)?.hero as Record<string, unknown>)?.heading as MultilingualContent | string || ((page.content as Record<string, unknown>)?.hero as Record<string, unknown>)?.heading as string || ''}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentHero = (currentContent.hero || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  hero: { 
                    ...currentHero, 
                    heading: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Hero Subheading"
              value={((page.content_multilingual as Record<string, unknown>)?.hero as Record<string, unknown>)?.subheading as MultilingualContent | string || ((page.content as Record<string, unknown>)?.hero as Record<string, unknown>)?.subheading as string || ''}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentHero = (currentContent.hero || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  hero: { 
                    ...currentHero, 
                    subheading: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={3}
            />
            <MultilingualInput
              label="Value Proposition Heading"
              value={((page.content_multilingual as Record<string, unknown>)?.value_proposition as Record<string, unknown>)?.heading as MultilingualContent | string || ((page.content as Record<string, unknown>)?.value_proposition as Record<string, unknown>)?.heading as string || ''}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentVP = (currentContent.value_proposition || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  value_proposition: { 
                    ...currentVP, 
                    heading: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Value Proposition Description"
              value={((page.content_multilingual as Record<string, unknown>)?.value_proposition as Record<string, unknown>)?.description as MultilingualContent | string || ((page.content as Record<string, unknown>)?.value_proposition as Record<string, unknown>)?.description as string || ''}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentVP = (currentContent.value_proposition || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  value_proposition: { 
                    ...currentVP, 
                    description: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={4}
            />
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <MultilingualInput
              label="Main Heading"
              value={((page.content_multilingual as Record<string, unknown>)?.heading as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.heading as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  heading: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Philosophy"
              value={((page.content_multilingual as Record<string, unknown>)?.philosophy as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.philosophy as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  philosophy: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={6}
            />
            <MultilingualInput
              label="Tagline"
              value={((page.content_multilingual as Record<string, unknown>)?.tagline as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.tagline as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  tagline: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Purity Promise Heading"
              value={(((page.content_multilingual as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.heading as MultilingualContent | string) || (((page.content as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.heading as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentPP = (currentContent.purity_promise || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  purity_promise: { 
                    ...currentPP, 
                    heading: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Purity Promise Intro"
              value={(((page.content_multilingual as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.intro as MultilingualContent | string) || (((page.content as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.intro as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentPP = (currentContent.purity_promise || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  purity_promise: { 
                    ...currentPP, 
                    intro: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={3}
            />
            <MultilingualInput
              label="Purity Promise - Natural"
              value={(((page.content_multilingual as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.natural as MultilingualContent | string) || (((page.content as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.natural as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentPP = (currentContent.purity_promise || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  purity_promise: { 
                    ...currentPP, 
                    natural: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={4}
            />
            <MultilingualInput
              label="Purity Promise - Safe"
              value={(((page.content_multilingual as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.safe as MultilingualContent | string) || (((page.content as Record<string, unknown>)?.purity_promise as Record<string, unknown>)?.safe as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const currentPP = (currentContent.purity_promise || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  purity_promise: { 
                    ...currentPP, 
                    safe: value 
                  } 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={4}
            />
            <MultilingualInput
              label="Commitment"
              value={((page.content_multilingual as Record<string, unknown>)?.commitment as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.commitment as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  commitment: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={4}
            />
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <MultilingualInput
              label="Heading"
              value={((page.content_multilingual as Record<string, unknown>)?.heading as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.heading as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  heading: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Description"
              value={((page.content_multilingual as Record<string, unknown>)?.description as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.description as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  description: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="textarea"
              rows={3}
            />
            <MultilingualInput
              label="Phone"
              value={((page.content_multilingual as Record<string, unknown>)?.phone as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.phone as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  phone: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Location"
              value={((page.content_multilingual as Record<string, unknown>)?.location as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.location as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  location: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
            <MultilingualInput
              label="Instagram Handle"
              value={((page.content_multilingual as Record<string, unknown>)?.instagram as MultilingualContent | string) || ((page.content as Record<string, unknown>)?.instagram as string || '')}
              onChange={(value) => {
                const currentContent = (page.content_multilingual || {}) as Record<string, unknown>;
                const newContentMultilingual = { 
                  ...currentContent, 
                  instagram: value 
                };
                setEditingPage({ ...page, content_multilingual: newContentMultilingual as MultilingualContent });
              }}
              type="text"
            />
          </div>
        );

      default:
        return <p className="text-gray-500">No editor available for this page.</p>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#5f031a] mb-6">Manage Pages</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}

      {!editingPage ? (
        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-4 bg-[#FCF6E1] rounded-lg"
            >
              <div>
                <h3 className="text-lg font-medium text-[#5f031a]">{page.title}</h3>
                <p className="text-sm text-gray-600">/{page.slug}</p>
              </div>
              <button
                onClick={() => handleEdit(page)}
                className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FCF6E1] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-[#5f031a]">
              Editing: {editingPage.title}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {renderEditor(editingPage)}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
