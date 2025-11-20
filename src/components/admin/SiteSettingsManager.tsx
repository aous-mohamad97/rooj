import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleEdit = (setting: SiteSetting) => {
    setEditingSetting({ ...setting });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSetting({
      id: '',
      key: '',
      value: {},
      updated_at: new Date().toISOString(),
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingSetting(null);
    setIsCreating(false);
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingSetting || !editingSetting.key.trim()) {
      setMessage('Key is required');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // Validate and parse JSON value
      let parsedValue: unknown;
      if (typeof editingSetting.value === 'string') {
        try {
          parsedValue = JSON.parse(editingSetting.value);
        } catch {
          setMessage('Invalid JSON format');
          setSaving(false);
          return;
        }
      } else {
        parsedValue = editingSetting.value;
      }

      if (isCreating) {
        const { error } = await supabase.from('site_settings').insert({
          key: editingSetting.key.trim(),
          value: parsedValue,
        });

        if (error) {
          setMessage(error.message || 'Error creating setting');
        } else {
          setMessage('Setting created successfully!');
          await loadSettings();
          setTimeout(() => {
            setEditingSetting(null);
            setIsCreating(false);
            setMessage('');
          }, 1500);
        }
      } else {
        const { error } = await supabase
          .from('site_settings')
          .update({
            key: editingSetting.key.trim(),
            value: parsedValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSetting.id);

        if (error) {
          setMessage(error.message || 'Error saving setting');
        } else {
          setMessage('Setting saved successfully!');
          await loadSettings();
          setTimeout(() => {
            setEditingSetting(null);
            setMessage('');
          }, 1500);
        }
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    const { error } = await supabase.from('site_settings').delete().eq('id', id);

    if (error) {
      setMessage('Error deleting setting');
    } else {
      setMessage('Setting deleted successfully!');
      await loadSettings();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateValue = (value: string) => {
    if (!editingSetting) return;
    // Store as string for editing, will be parsed on save
    setEditingSetting({ ...editingSetting, value });
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-[#5f031a]">Manage Site Settings</h2>
        {!editingSetting && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
          >
            <Plus size={18} />
            <span>Add Setting</span>
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes('Error') || message.includes('Invalid')
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {!editingSetting ? (
        <div className="space-y-4">
          {settings.length === 0 ? (
            <div className="text-center py-12 bg-[#FCF6E1] rounded-lg">
              <p className="text-[#4a4a4a] mb-4">No settings found.</p>
              <button
                onClick={handleCreate}
                className="bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
              >
                Create First Setting
              </button>
            </div>
          ) : (
            settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 bg-[#FCF6E1] rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#5f031a]">{setting.key}</h3>
                  <p className="text-sm text-gray-600 mt-1 font-mono break-all">
                    {formatValue(setting.value).substring(0, 100)}
                    {formatValue(setting.value).length > 100 ? '...' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(setting.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(setting)}
                    className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-4 py-2 rounded-lg hover:bg-[#8d1a2f] transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[#FCF6E1] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-[#5f031a]">
              {isCreating ? 'Create New Setting' : `Editing: ${editingSetting.key}`}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Setting Key
              </label>
              <input
                type="text"
                value={editingSetting.key}
                onChange={(e) =>
                  setEditingSetting({ ...editingSetting, key: e.target.value })
                }
                disabled={!isCreating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., site_name, contact_email"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isCreating
                  ? 'Enter a unique key for this setting'
                  : 'Key cannot be changed after creation'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5f031a] mb-2">
                Setting Value (JSON)
              </label>
              <textarea
                value={formatValue(editingSetting.value)}
                onChange={(e) => updateValue(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] font-mono text-sm"
                placeholder='{"example": "value"} or "simple string" or 123'
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter JSON format (object, array, string, number, boolean, or null)
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg hover:bg-[#8d1a2f] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : isCreating ? 'Create Setting' : 'Save Changes'}</span>
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

