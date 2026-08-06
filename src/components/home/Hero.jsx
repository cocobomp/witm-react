import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Button from '../ui/Button';
import { INSTAGRAM_URL, TIKTOK_URL } from '../../constants/links';

const SUPPORTED_LANGS = ['en', 'fr', 'de'];

export default function Hero() {
  const { t, i18n } = useTranslation('home');
  const lang = SUPPORTED_LANGS.includes(i18n.language) ? i18n.language : 'en';
  const screenshots = [
    `/img/screenshots/${lang}/screen-1.png`,
    `/img/screenshots/${lang}/screen-2.png`,
    `/img/screenshots/${lang}/screen-3.png`,
  ];
  const [currentImage, setCurrentImage] = useState(0);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative bg-gradient-to-b from-white to-slate-50 overflow-hidden"
    >
      {/* Decorative gradient blobs with parallax */}
      <motion.div
        style={{ y: blobY1 }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
      >
        <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 40%, transparent 70%)' }} />
      </motion.div>
      <motion.div
        style={{ y: blobY2 }}
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
      >
        <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, #6366f1 40%, transparent 70%)' }} />
      </motion.div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-36">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-4"
            >
              WITM
            </motion.span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              <span className="gradient-text">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button variant="primary" size="lg" href="#about">
                {t('hero.ctaJoin')}
              </Button>
              <Button variant="secondary" size="lg" href="#download">
                {t('hero.ctaDownload')}
              </Button>
            </div>

            {/* Stats counter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {['questions', 'categories', 'languages'].map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/5 text-xs sm:text-sm font-medium text-primary border border-primary/10"
                >
                  {t(`hero.stats.${key}`)}
                </span>
              ))}
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex items-center gap-4 mb-8"
            >
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
              <span className="text-gray-300">·</span>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                TikTok
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="hidden md:flex items-center gap-2 text-gray-400 text-sm"
            >
              <motion.svg
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
              <span>{t('hero.scrollHint', { defaultValue: '' })}</span>
            </motion.div>
          </motion.div>

          {/* Right Screenshot Carousel - Device Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-64 sm:w-72 h-[440px] sm:h-[500px] md:h-[560px]">
              {/* Device frame */}
              <div className="absolute inset-0 -m-3 rounded-[3rem] bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl shadow-gray-900/30" />
              <div className="absolute inset-0 -m-1.5 rounded-[2.6rem] bg-gradient-to-b from-gray-700 to-gray-800" />
              <div className="absolute inset-0 rounded-[2.2rem] overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={screenshots[currentImage]}
                    alt="WITM App Screenshot"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </div>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
