import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { MultilingualInput } from './MultilingualInput';
import { MultilingualContent } from '../../utils/multilingual';

interface Product {
  id: string;
  name: string;
  name_multilingual?: MultilingualContent;
  category: string; // Keep for backward compatibility
  category_id: string | null;
  categories?: {
    id: string;
    slug: string;
    name: string;
    name_multilingual?: MultilingualContent;
    icon?: string;
  } | null;
  description: string;
  description_multilingual?: MultilingualContent;
  details: string;
  details_multilingual?: MultilingualContent;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, name, is_active')
      .eq('is_active', true)
      .order('order_index');

    if (data) {
      setCategories(data);
    }
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        name_multilingual,
        description_multilingual,
        details_multilingual,
        categories:category_id (
          id,
          slug,
          name,
          name_multilingual,
          icon
        )
      `)
      .order('order_index');

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsCreating(false);
  };

  const handleCreate = () => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : null;
    const defaultCategorySlug = categories.length > 0 ? categories[0].slug : 'skin_care';
    setEditingProduct({
      id: '',
      name: '',
      name_multilingual: {},
      category: defaultCategorySlug,
      category_id: defaultCategoryId,
      description: '',
      description_multilingual: {},
      details: '',
      details_multilingual: {},
      image_url: '',
      order_index: products.length + 1,
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    setSaving(true);
    setMessage('');

    if (isCreating) {
      // Get category slug from selected category_id
      const selectedCategory = categories.find(cat => cat.id === editingProduct.category_id);
      const categorySlug = selectedCategory?.slug || editingProduct.category;
      
      const { error } = await supabase.from('products').insert({
        name: editingProduct.name,
        category: categorySlug, // Keep for backward compatibility
        category_id: editingProduct.category_id,
        description: editingProduct.description,
        details: editingProduct.details,
        image_url: editingProduct.image_url,
        order_index: editingProduct.order_index,
        is_active: editingProduct.is_active,
      });

      if (error) {
        setMessage('Error creating product');
      } else {
        setMessage('Product created successfully!');
        await loadProducts();
        setTimeout(() => {
          setEditingProduct(null);
          setIsCreating(false);
          setMessage('');
        }, 1500);
      }
    } else {
      // Get category slug from selected category_id
      const selectedCategory = categories.find(cat => cat.id === editingProduct.category_id);
      const categorySlug = selectedCategory?.slug || editingProduct.category;
      
      // Get default language value for backward compatibility
      const defaultLang = 'en';
      const nameValue = (editingProduct.name_multilingual as Record<string, string>)?.[defaultLang] || editingProduct.name || '';
      const descValue = (editingProduct.description_multilingual as Record<string, string>)?.[defaultLang] || editingProduct.description || '';
      const detailsValue = (editingProduct.details_multilingual as Record<string, string>)?.[defaultLang] || editingProduct.details || '';
      
      const { error } = await supabase
        .from('products')
        .update({
          name: nameValue,
          name_multilingual: editingProduct.name_multilingual || {},
          category: categorySlug, // Keep for backward compatibility
          category_id: editingProduct.category_id,
          description: descValue,
          description_multilingual: editingProduct.description_multilingual || {},
          details: detailsValue,
          details_multilingual: editingProduct.details_multilingual || {},
          image_url: editingProduct.image_url,
          order_index: editingProduct.order_index,
          is_active: editingProduct.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProduct.id);

      if (error) {
        setMessage('Error saving product');
      } else {
        setMessage('Product saved successfully!');
        await loadProducts();
        setTimeout(() => {
          setEditingProduct(null);
          setMessage('');
        }, 1500);
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      setMessage('Error deleting product');
    } else {
      setMessage('Product deleted successfully!');
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateField = (field: keyof Product, value: string | number | boolean) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-[#5f031a]">Manage Products</h2>
        {!editingProduct && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}

      {!editingProduct ? (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-[#FCF6E1] rounded-lg"
            >
              {product.image_url ? (
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-400 text-center px-2">No image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-[#5f031a]">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  {product.categories?.name || product.category} • Order: {product.order_index}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                {product.image_url && (
                  <p className="text-xs text-gray-400 mt-1 truncate" title={product.image_url}>
                    {product.image_url}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FCF6E1] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-[#5f031a]">
              {isCreating ? 'Create New Product' : `Editing: ${editingProduct.name}`}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <MultilingualInput
              label="Product Name"
              value={editingProduct.name_multilingual || editingProduct.name}
              onChange={(value) => {
                if (!editingProduct) return;
                const defaultLang = 'en';
                const nameValue = (value as Record<string, string>)[defaultLang] || '';
                setEditingProduct({ ...editingProduct, name: nameValue, name_multilingual: value });
              }}
              type="text"
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Category
              </label>
              <select
                value={editingProduct.category_id || ''}
                onChange={(e) => {
                  const selectedCategory = categories.find(cat => cat.id === e.target.value);
                  if (selectedCategory) {
                    updateField('category_id', e.target.value);
                    updateField('category', selectedCategory.slug);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <MultilingualInput
              label="Description"
              value={editingProduct.description_multilingual || editingProduct.description}
              onChange={(value) => {
                if (!editingProduct) return;
                const defaultLang = 'en';
                const descValue = (value as Record<string, string>)[defaultLang] || '';
                setEditingProduct({ ...editingProduct, description: descValue, description_multilingual: value });
              }}
              type="textarea"
              rows={4}
            />

            <MultilingualInput
              label="Details"
              value={editingProduct.details_multilingual || editingProduct.details}
              onChange={(value) => {
                if (!editingProduct) return;
                const defaultLang = 'en';
                const detailsValue = (value as Record<string, string>)[defaultLang] || '';
                setEditingProduct({ ...editingProduct, details: detailsValue, details_multilingual: value });
              }}
              type="textarea"
              rows={6}
            />

            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={editingProduct.image_url}
                onChange={(e) => updateField('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
              />
              {editingProduct.image_url && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={editingProduct.image_url}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent && !parent.querySelector('.error-message')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'error-message flex items-center justify-center h-full text-red-500 text-sm';
                          errorDiv.textContent = 'Failed to load image. Please check the URL.';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 break-all">{editingProduct.image_url}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Order Index
              </label>
              <input
                type="number"
                value={editingProduct.order_index}
                onChange={(e) => updateField('order_index', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingProduct.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="w-4 h-4 text-[#5f031a] focus:ring-[#5f031a] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-[#5f031a]">
                Active (visible on website)
              </label>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : isCreating ? 'Create Product' : 'Save Changes'}</span>
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
