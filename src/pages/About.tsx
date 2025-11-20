import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { CheckCircle, Shield, Heart } from "lucide-react";
import { AnimatedSection } from "../components/AnimatedSection";
import { SEOHead } from "../components/SEOHead";
import { useTranslation } from "react-i18next";
import { getMultilingualText } from "../utils/multilingual";

interface AboutContent {
  heading: string;
  philosophy: string;
  purity_promise: {
    heading: string;
    intro: string;
    natural: string;
    safe: string;
  };
  commitment: string;
  tagline: string;
}

export function About() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase
        .from("pages")
        .select("content, content_multilingual, title_multilingual")
        .eq("slug", "about")
        .maybeSingle();

      if (data) {
        // Use multilingual content if available, otherwise fallback to old content
        const multilingualContent = data.content_multilingual || data.content;
        
        // Extract language-specific content from nested multilingual structure
        let contentForLang: AboutContent | null = null;
        
        if (multilingualContent && typeof multilingualContent === 'object') {
          const heading = (multilingualContent as Record<string, unknown>)?.heading;
          const philosophy = (multilingualContent as Record<string, unknown>)?.philosophy;
          const purity_promise = (multilingualContent as Record<string, unknown>)?.purity_promise as Record<string, unknown> | undefined;
          const commitment = (multilingualContent as Record<string, unknown>)?.commitment;
          const tagline = (multilingualContent as Record<string, unknown>)?.tagline;
          const fallbackContent = data.content as AboutContent | null;
          
          if (heading || philosophy || purity_promise || commitment || tagline) {
            contentForLang = {
              heading: getMultilingualText(heading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.heading || '',
              philosophy: getMultilingualText(philosophy as string | Record<string, string> | undefined, currentLang) || fallbackContent?.philosophy || '',
              purity_promise: {
                heading: getMultilingualText(purity_promise?.heading as string | Record<string, string> | undefined, currentLang) || fallbackContent?.purity_promise?.heading || '',
                intro: getMultilingualText(purity_promise?.intro as string | Record<string, string> | undefined, currentLang) || fallbackContent?.purity_promise?.intro || '',
                natural: getMultilingualText(purity_promise?.natural as string | Record<string, string> | undefined, currentLang) || fallbackContent?.purity_promise?.natural || '',
                safe: getMultilingualText(purity_promise?.safe as string | Record<string, string> | undefined, currentLang) || fallbackContent?.purity_promise?.safe || '',
              },
              commitment: getMultilingualText(commitment as string | Record<string, string> | undefined, currentLang) || fallbackContent?.commitment || '',
              tagline: getMultilingualText(tagline as string | Record<string, string> | undefined, currentLang) || fallbackContent?.tagline || '',
            };
          }
        }
        
        setContent(contentForLang || (data.content as AboutContent));
      }
      setLoading(false);
    }

    loadContent();
  }, [currentLang]);

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
        pageSlug="about"
        pageTitle={content?.heading}
        pageDescription={content?.philosophy?.substring(0, 160)}
      />
      <main className="mb-10">
        <section className="py-20 bg-white relative" aria-label="About us">
          <div
            className="absolute inset-0 opacity-10 z-1"
            style={{
              backgroundImage: "url(/904e75a4-37f0-456f-86a3-545e9ec0a288.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="fade-up">
              <h1 className="text-5xl md:text-6xl font-serif text-[#5f031a] mb-8 text-center">
                {getMultilingualText(content?.heading, currentLang) || t('about.heading')}
              </h1>
            </AnimatedSection>

            <AnimatedSection direction="fade-up" delay={200}>
              <div className="prose prose-lg max-w-none text-[#4a4a4a] leading-relaxed mb-16">
                {getMultilingualText(content?.philosophy, currentLang)?.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-6 text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-20 bg-[#FCF6E1]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="fade-up" className="text-center">
              <h2 className="text-4xl md:text-5xl font-serif text-[#5f031a] mb-4">
                {getMultilingualText(content?.purity_promise?.heading, currentLang) || t('about.purityPromise.heading')}
              </h2>
              <p className="text-xl text-[#4a4a4a] mb-12 italic">
                {getMultilingualText(content?.purity_promise?.intro, currentLang) || t('about.purityPromise.intro')}
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <AnimatedSection direction="fade-right" delay={100}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                      <CheckCircle className="text-[#5f031a]" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif text-[#5f031a] mb-3 transition-colors duration-300 hover:text-[#8d1a2f]">
                        {t('about.over95Natural')}
                      </h3>
                      <p className="text-[#4a4a4a] leading-relaxed">
                        {getMultilingualText(content?.purity_promise?.natural, currentLang) || t('about.purityPromise.natural')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="fade-left" delay={200}>
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                      <Shield className="text-[#5f031a]" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif text-[#5f031a] mb-3 transition-colors duration-300 hover:text-[#8d1a2f]">
                        {t('about.purityPromise.safe.title')}
                      </h3>
                      <p className="text-[#4a4a4a] leading-relaxed">
                        {getMultilingualText(content?.purity_promise?.safe, currentLang) || t('about.purityPromise.safe.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection direction="fade-up" delay={300}>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                    <Heart className="text-[#5f031a]" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-[#5f031a] mb-3 transition-colors duration-300 hover:text-[#8d1a2f]">
                      {t('about.ourCommitment')}
                    </h3>
                    <div className="text-[#4a4a4a] leading-relaxed space-y-4">
                      {getMultilingualText(content?.commitment, currentLang)
                        ?.split("\n\n")
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-20 bg-[#5f031a] text-[#FCF6E1]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection direction="fade-up">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">
                {getMultilingualText(content?.tagline, currentLang) || t('about.taglineFull')}
              </h2>
              <p className="text-lg opacity-90 mb-8">
                {t('about.experienceDifference')}
              </p>
              <a
                href="/products"
                className="inline-block bg-[#FCF6E1] text-[#5f031a] px-8 py-4 rounded-lg text-lg font-medium hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {t('about.discoverProducts')}
              </a>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </Layout>
  );
}
