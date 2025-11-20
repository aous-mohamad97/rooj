import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, X, Plus, Trash2, Tag } from 'lucide-react';
import { MultilingualContent } from '../../utils/multilingual';
import { MultilingualInput } from './MultilingualInput';

interface Category {
  id: string;
  slug: string;
  name: string;
  name_multilingual?: MultilingualContent;
  description: string;
  description_multilingual?: MultilingualContent;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, name_multilingual, description_multilingual')
      .order('order_index');

    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingCategory({
      id: '',
      slug: '',
      name: '',
      description: '',
      icon: '',
      order_index: categories.length,
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products using this category will need to be updated.')) {
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage('Error deleting category');
      setTimeout(() => setMessage(''), 3000);
    } else {
      await loadCategories();
      setMessage('Category deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateField = (field: keyof Category, value: string | number | boolean) => {
    if (!editingCategory) return;
    setEditingCategory({ ...editingCategory, [field]: value });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    // Auto-generate slug from name if empty
    if (!editingCategory.slug && editingCategory.name) {
      editingCategory.slug = generateSlug(editingCategory.name);
    }

    if (!editingCategory.name || !editingCategory.slug) {
      setMessage('Name and slug are required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (isCreating) {
        // Get default language value for backward compatibility
        const defaultLang = 'en';
        const nameValue = (editingCategory.name_multilingual as Record<string, string>)?.[defaultLang] || editingCategory.name || '';
        const descValue = (editingCategory.description_multilingual as Record<string, string>)?.[defaultLang] || editingCategory.description || '';
        
        const { error } = await supabase
          .from('categories')
          .insert({
            slug: editingCategory.slug,
            name: nameValue,
            name_multilingual: editingCategory.name_multilingual || {},
            description: descValue,
            description_multilingual: editingCategory.description_multilingual || {},
            icon: editingCategory.icon,
            order_index: editingCategory.order_index,
            is_active: editingCategory.is_active,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          setMessage('Error creating category: ' + error.message);
        } else {
          setMessage('Category created successfully!');
          await loadCategories();
          setEditingCategory(null);
          setIsCreating(false);
        }
      } else {
      // Get default language value for backward compatibility
      const defaultLang = 'en';
      const nameValue = (editingCategory.name_multilingual as Record<string, string>)?.[defaultLang] || editingCategory.name || '';
      const descValue = (editingCategory.description_multilingual as Record<string, string>)?.[defaultLang] || editingCategory.description || '';
      
      const { error } = await supabase
        .from('categories')
        .update({
          slug: editingCategory.slug,
          name: nameValue,
          name_multilingual: editingCategory.name_multilingual || {},
          description: descValue,
          description_multilingual: editingCategory.description_multilingual || {},
          icon: editingCategory.icon,
          order_index: editingCategory.order_index,
          is_active: editingCategory.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCategory.id);

        if (error) {
          setMessage('Error updating category: ' + error.message);
        } else {
          setMessage('Category updated successfully!');
          await loadCategories();
          setEditingCategory(null);
        }
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    }

    setSaving(false);
    if (message && !message.includes('Error')) {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-[#5f031a] flex items-center space-x-2">
          <Tag size={24} />
          <span>Categories</span>
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
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

      {editingCategory ? (
        <div className="bg-[#FCF6E1] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif text-[#5f031a]">
              {isCreating ? 'Create New Category' : 'Edit Category'}
            </h3>
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCreating(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <MultilingualInput
              label="Category Name"
              value={editingCategory.name_multilingual || editingCategory.name}
              onChange={(value) => {
                if (!editingCategory) return;
                const defaultLang = 'en';
                const nameValue = (value as Record<string, string>)[defaultLang] || '';
                // Auto-generate slug from English name
                const newSlug = nameValue
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_+|_+$/g, '');
                setEditingCategory({ 
                  ...editingCategory, 
                  name: nameValue, 
                  name_multilingual: value,
                  slug: newSlug || editingCategory.slug || (isCreating ? generateSlug(nameValue) : editingCategory.slug)
                });
              }}
              type="text"
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={editingCategory.slug}
                onChange={(e) => updateField('slug', generateSlug(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] font-mono text-sm"
                placeholder="skin_care"
              />
              <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated from name)</p>
            </div>

            <MultilingualInput
              label="Description"
              value={editingCategory.description_multilingual || editingCategory.description}
              onChange={(value) => {
                if (!editingCategory) return;
                const defaultLang = 'en';
                const descValue = (value as Record<string, string>)[defaultLang] || '';
                setEditingCategory({ 
                  ...editingCategory, 
                  description: descValue, 
                  description_multilingual: value 
                });
              }}
              type="textarea"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Icon Name
                </label>
                <input
                  type="text"
                  value={editingCategory.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                  placeholder="droplet, sparkles, flame"
                />
                <p className="text-xs text-gray-500 mt-1">Icon identifier for UI</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f031a] mb-2">
                  Order Index
                </label>
                <input
                  type="number"
                  value={editingCategory.order_index}
                  onChange={(e) => updateField('order_index', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingCategory.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="w-4 h-4 text-[#5f031a] focus:ring-[#5f031a] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-[#5f031a]">
                Active (visible on site)
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Category'}</span>
              </button>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCreating(false);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-[#FCF6E1] rounded-lg">
            <Tag className="mx-auto mb-4 text-[#5f031a] opacity-50" size={48} />
            <p className="text-[#5f031a]">No categories yet. Create your first category!</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-serif text-[#5f031a]">{category.name}</h3>
                    <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </span>
                    {!category.is_active && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-gray-600 mb-2">{category.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {category.icon && (
                      <span>Icon: {category.icon}</span>
                    )}
                    <span>Order: {category.order_index}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-[#5f031a] hover:bg-[#FCF6E1] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

