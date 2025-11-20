import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = "/admin/dashboard";
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(t('admin.login.error'));
      setLoading(false);
    } else {
      // Wait a moment for auth state to update, then redirect
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 100);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FCF6E1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#5f031a] text-xl">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF6E1] flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div
        className="absolute inset-0 opacity-10 z-1"
        style={{
          backgroundImage: "url(/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-md w-full relative">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Rooj Essence"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-serif text-[#5f031a] mb-2">
            {t('admin.login.title')}
          </h1>
          <p className="text-[#4a4a4a]">{t('admin.login.subtitle', 'Sign in to manage your content')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-[#5f031a] font-medium mb-2"
              >
                {t('admin.login.email')}
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                placeholder="admin@roojessence.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[#5f031a] font-medium mb-2"
              >
                {t('admin.login.password')}
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5f031a] text-[#FCF6E1] px-6 py-3 rounded-lg font-medium hover:bg-[#8d1a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <LogIn size={20} />
              <span>{loading ? t('admin.login.signingIn') : t('admin.login.signIn')}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-[#5f031a] hover:underline text-sm">
              {t('common.backToWebsite', 'Back to Website')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
