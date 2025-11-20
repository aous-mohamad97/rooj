import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, FileText, Package, Settings, Home, Search, Tag } from 'lucide-react';
import { PagesManager } from '../../components/admin/PagesManager';
import { ProductsManager } from '../../components/admin/ProductsManager';
import { SiteSettingsManager } from '../../components/admin/SiteSettingsManager';
import { SEOManager } from '../../components/admin/SEOManager';
import { CategoriesManager } from '../../components/admin/CategoriesManager';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

type Tab = 'pages' | 'products' | 'categories' | 'settings' | 'seo';

export function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pages');
  const { t } = useTranslation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF6E1] flex items-center justify-center">
          <div className="text-center">
          <div className="text-[#5f031a] text-xl mb-4">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/admin';
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-[#FCF6E1]">
      <nav className="bg-[#5f031a] text-[#FCF6E1] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Settings className="text-[#FCF6E1]" size={24} />
              <h1 className="text-xl font-serif">{t('admin.dashboard.title')}</h1>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <a
                href="/"
                className="flex items-center space-x-2 hover:text-white transition-colors rtl:space-x-reverse"
              >
                <Home size={18} />
                <span>{t('nav.viewSite')}</span>
              </a>
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-[#8d1a2f] hover:bg-[#9d4f5e] px-4 py-2 rounded-lg transition-colors rtl:space-x-reverse"
              >
                <LogOut size={18} />
                <span>{t('nav.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'pages'
                    ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={20} />
                <span>{t('admin.dashboard.tabs.pages')}</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors rtl:space-x-reverse ${
                  activeTab === 'products'
                    ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package size={20} />
                <span>{t('admin.dashboard.tabs.products')}</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors rtl:space-x-reverse ${
                  activeTab === 'categories'
                    ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Tag size={20} />
                <span>{t('admin.dashboard.tabs.categories')}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors rtl:space-x-reverse ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={20} />
                <span>{t('admin.dashboard.tabs.settings')}</span>
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors rtl:space-x-reverse ${
                  activeTab === 'seo'
                    ? 'border-b-2 border-[#5f031a] text-[#5f031a]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search size={20} />
                <span>{t('admin.dashboard.tabs.seo')}</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pages' && <PagesManager />}
            {activeTab === 'products' && <ProductsManager />}
            {activeTab === 'categories' && <CategoriesManager />}
            {activeTab === 'settings' && <SiteSettingsManager />}
            {activeTab === 'seo' && <SEOManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
