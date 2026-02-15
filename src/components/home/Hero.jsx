import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Button from '../ui/Button';
import { INSTAGRAM_URL } from '../../constants/links';

const screenshots = ['/img/screens.png', '/img/screen-2.png', '/img/screen-3.png'];

export default function Hero() {
  const { t } = useTranslation('home');
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
            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="primary" size="lg" href={INSTAGRAM_URL}>
                {t('hero.ctaJoin')}
              </Button>
              <Button variant="secondary" size="lg" href="#download">
                {t('hero.ctaDownload')}
              </Button>
            </div>

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
