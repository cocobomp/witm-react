import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../../constants/links';
import StoreBadges from '../ui/StoreBadges';

export default function Download() {
  const { t } = useTranslation('home');

  return (
    <Section
      id="download"
      fullWidth
      className="relative bg-gradient-to-r from-primary to-accent overflow-hidden"
    >
      {/* Animated background dots/shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 8 + i * 6,
              height: 8 + i * 6,
              top: `${15 + i * 14}%`,
              left: `${5 + i * 16}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i * 0.5,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: CTA content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('download.title')}
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl">
              {t('download.description')}
            </p>

            <StoreBadges className="justify-center md:justify-start" />
          </motion.div>

          {/* Right: Floating app mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="w-52 h-[420px] rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl shadow-black/40 p-2">
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white">
                  <img
                    src="/img/screens.png"
                    alt="WITM App"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              {/* Reflection / glow beneath */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/20 rounded-full blur-xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
