import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import { getAllPosts } from '../utils/blog';
import useLangPrefix from '../hooks/useLangPrefix';

// Deterministic gradient palette for post card placeholders
const GRADIENTS = [
  'from-indigo-400 to-violet-400',
  'from-violet-400 to-fuchsia-400',
  'from-blue-400 to-indigo-400',
  'from-emerald-400 to-teal-400',
  'from-amber-400 to-orange-400',
  'from-rose-400 to-pink-400',
];

export default function Blog() {
  const { t, i18n } = useTranslation('blog');
  const langPrefix = useLangPrefix();

  const posts = getAllPosts(i18n.language);

  // Fallback to English posts if none found for current language
  const displayPosts = posts.length > 0 ? posts : getAllPosts('en');

  return (
    <>
      <SEO
        title={t('metaTitle')}
        description={t('latestPosts')}
        lang={i18n.language}
        canonical={`https://whoisthemost.com${langPrefix}/blog`}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white pt-28 pb-8 sm:pt-32 sm:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to={langPrefix || '/'} className="hover:text-primary transition-colors">
              Home
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">{t('breadcrumb')}</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t('pageTitle')}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              {t('latestPosts')}
            </p>
          </div>
        </div>
      </div>

      <Section className="!pt-8">
        {displayPosts.length === 0 ? (
          /* Better empty state */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('noPosts')}
            </p>
            <Link
              to={langPrefix || '/'}
              className="inline-flex items-center gap-2 mt-6 text-primary hover:text-primary/80 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayPosts.map((post, index) => (
              <Link key={post.slug} to={`${langPrefix}/blog/${post.slug}`} className="group">
                <Card hover className="h-full overflow-hidden !p-0">
                  <div className="flex flex-col h-full">
                    {/* Gradient image placeholder */}
                    <div className={`h-40 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                      {/* Abstract decorative shapes */}
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute -left-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute bottom-3 left-4">
                          <span className="text-xs bg-white/20 text-white backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
                            {post.tags[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs text-gray-400 mb-2.5">
                        {new Date(post.date).toLocaleDateString(i18n.language, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <h2 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      {post.tags && post.tags.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {post.tags.slice(1).map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
