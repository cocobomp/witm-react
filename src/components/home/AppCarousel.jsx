import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';

const SCREENSHOT_COUNT = 3;
const AUTO_PLAY_INTERVAL = 4000;

export default function AppCarousel() {
  const { t, i18n } = useTranslation('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Get language folder - extract base language code and fallback to 'en'
  const baseLang = i18n.language?.split('-')[0] || 'en';
  const lang = ['en', 'fr', 'de'].includes(baseLang) ? baseLang : 'en';

  const screenshots = Array.from({ length: SCREENSHOT_COUNT }, (_, i) => ({
    src: `/img/screenshots/${lang}/screen-${i + 1}.png`,
    alt: t(`carousel.screen${i + 1}Alt`, { defaultValue: `App screenshot ${i + 1}` }),
  }));

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SCREENSHOT_COUNT);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SCREENSHOT_COUNT) % SCREENSHOT_COUNT);
  }, []);

  const goToSlide = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      zIndex: 0,
    }),
  };

  return (
    <Section className="bg-gradient-to-b from-white to-surface overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('carousel.sectionTitle')}
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('carousel.sectionDescription')}
        </p>
      </motion.div>

      <div
        className="relative max-w-sm mx-auto"
        aria-live="polite"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Phone frame */}
        <div className="relative mx-auto w-[280px] sm:w-[320px]">
          {/* Phone bezel */}
          <div className="relative rounded-[3rem] bg-gradient-to-b from-gray-800 to-gray-900 p-3 shadow-2xl shadow-gray-900/30">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />

            {/* Screen */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white aspect-[9/19.5]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={`${lang}-${currentIndex}`}
                  src={screenshots[currentIndex].src}
                  alt={screenshots[currentIndex].alt}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Reflection glow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-primary/20 rounded-full blur-2xl" />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-12 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={t('carousel.previous', { defaultValue: 'Previous screenshot' })}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-12 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={t('carousel.next', { defaultValue: 'Next screenshot' })}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={t('carousel.goToSlide', { number: index + 1, defaultValue: `Go to slide ${index + 1}` })}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto mt-4">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? `${((currentIndex + 1) / SCREENSHOT_COUNT) * 100}%` : '100%' }}
            transition={{ duration: isPaused ? 0.3 : AUTO_PLAY_INTERVAL / 1000, ease: 'linear' }}
            key={isPaused ? 'paused' : currentIndex}
          />
        </div>
      </div>
    </Section>
  );
}
