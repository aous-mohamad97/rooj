import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { MapPin, Phone, Instagram } from "lucide-react";
import { AnimatedSection } from "../components/AnimatedSection";
import { SEOHead } from "../components/SEOHead";
import { useTranslation } from "react-i18next";
import { getMultilingualText } from "../utils/multilingual";

interface ContactContent {
  heading: string;
  description: string;
  location: string;
  phone: string;
  instagram: string;
}

export function Contact() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase
        .from("pages")
        .select("content, content_multilingual, title_multilingual")
        .eq("slug", "contact")
        .maybeSingle();

      if (data) {
        // Use multilingual content if available, otherwise fallback to old content
        const multilingualContent = data.content_multilingual || data.content;
        
        // Extract language-specific content from nested multilingual structure
        let contentForLang: ContactContent | null = null;
        
        if (multilingualContent && typeof multilingualContent === 'object') {
          const heading = (multilingualContent as Record<string, unknown>)?.heading;
          const description = (multilingualContent as Record<string, unknown>)?.description;
          const location = (multilingualContent as Record<string, unknown>)?.location;
          const phone = (multilingualContent as Record<string, unknown>)?.phone;
          const instagram = (multilingualContent as Record<string, unknown>)?.instagram;
          const fallbackContent = data.content as ContactContent | null;
          
          if (heading || description || location || phone || instagram) {
            contentForLang = {
              heading: getMultilingualText(heading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.heading || '',
              description: getMultilingualText(description as string | Record<string, string> | undefined, currentLang) || fallbackContent?.description || '',
              location: getMultilingualText(location as string | Record<string, string> | undefined, currentLang) || fallbackContent?.location || '',
              phone: getMultilingualText(phone as string | Record<string, string> | undefined, currentLang) || fallbackContent?.phone || '',
              instagram: getMultilingualText(instagram as string | Record<string, string> | undefined, currentLang) || fallbackContent?.instagram || '',
            };
          }
        }
        
        setContent(contentForLang || (data.content as ContactContent));
      }
      setLoading(false);
    }

    loadContent();
  }, [currentLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSubmitted(false), 5000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[#5f031a]">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        pageSlug="contact"
        pageTitle={getMultilingualText(content?.heading, currentLang) || t('contact.heading')}
        pageDescription={getMultilingualText(content?.description, currentLang) || t('contact.description')}
      />
      <main>
        <section className="py-20 bg-white relative" aria-label="Contact us">
          <div
            className="absolute inset-0 opacity-10 z-1"
            style={{
              backgroundImage: "url(/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="fade-up" className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-serif text-[#5f031a] mb-6">
                {getMultilingualText(content?.heading, currentLang) || t('contact.heading')}
              </h1>
              <p className="text-xl text-[#4a4a4a] max-w-3xl mx-auto leading-relaxed">
                {getMultilingualText(content?.description, currentLang) || t('contact.description')}
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <AnimatedSection direction="fade-right">
                <div>
                  <h2 className="text-3xl font-serif text-[#5f031a] mb-8">
                    {t('contact.info.contactInformation')}
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-6 bg-[#FCF6E1] rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                        <MapPin className="text-[#5f031a]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#5f031a] mb-1 transition-colors duration-300 hover:text-[#8d1a2f]">
                          {t('contact.info.location')}
                        </h3>
                        <p className="text-[#4a4a4a]">
                          {getMultilingualText(content?.location, currentLang) || t('footer.location')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-[#FCF6E1] rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                        <Phone className="text-[#5f031a]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#5f031a] mb-1 transition-colors duration-300 hover:text-[#8d1a2f]">
                          {t('contact.info.phoneWhatsApp')}
                        </h3>
                        <a
                          href={`tel:${getMultilingualText(content?.phone, currentLang) || "+963951399815"}`}
                          className="text-[#4a4a4a] hover:text-[#5f031a] transition-all duration-300 transform hover:scale-105 inline-block"
                        >
                          {getMultilingualText(content?.phone, currentLang) || t('footer.phone')}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-[#FCF6E1] rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                        <Instagram className="text-[#5f031a]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#5f031a] mb-1 transition-colors duration-300 hover:text-[#8d1a2f]">
                          {t('contact.info.instagram')}
                        </h3>
                        <a
                          href="https://instagram.com/rooj.essence"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4a4a4a] hover:text-[#5f031a] transition-all duration-300 transform hover:scale-105 inline-block"
                        >
                          {getMultilingualText(content?.instagram, currentLang) || "@rooj.essence"}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-[#5f031a] text-[#FCF6E1] rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-serif mb-3">{t('contact.info.businessHours')}</h3>
                    <p className="opacity-90">
                      {t('contact.info.responseTime')}
                    </p>
                    <p className="opacity-90 mt-2">
                      {t('contact.info.urgentInquiry')}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="fade-left">
                <div>
                  <h2 className="text-3xl font-serif text-[#5f031a] mb-8">
                    {t('contact.form.formTitle')}
                  </h2>

                  {submitted && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg animate-pulse">
                      {t('contact.form.thankYou')}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-[#5f031a] font-medium mb-2"
                      >
                        {t('contact.form.name')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder={t('contact.form.namePlaceholder')}
                        className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[#5f031a] font-medium mb-2"
                      >
                        {t('contact.form.email')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder={t('contact.form.emailPlaceholder')}
                        className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-[#5f031a] font-medium mb-2"
                      >
                        {t('contact.form.subject')}
                      </label>
                      <input
                        type="text"
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder={t('contact.form.subjectPlaceholder')}
                        className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-[#5f031a] font-medium mb-2"
                      >
                        {t('contact.form.message')}
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder={t('contact.form.messagePlaceholder')}
                        className="w-full px-4 py-3 border border-[#5f031a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f031a] bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#5f031a] text-[#FCF6E1] px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#8d1a2f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting ? t('contact.form.sending') : t('contact.form.sendMessage')}
                    </button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
