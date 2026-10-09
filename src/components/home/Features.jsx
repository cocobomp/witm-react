import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';

// Real categories from the QELP game
const categories = [
  { key: 'wtf', emoji: '🎲' },
  { key: 'friends', emoji: '👬' },
  { key: 'family', emoji: '👨‍👩‍👧' },
  { key: 'job', emoji: '💼' },
  { key: 'hot', emoji: '🥵' },
  { key: 'problemes', emoji: '🥊' },
  { key: 'normal', emoji: '❔' },
];

export default function Features() {
  const { t } = useTranslation('home');

  return (
    <Section id="features" className="bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('features.sectionTitle')}
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('features.sectionDescription')}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ scale: 1.05 }}
            className="group relative rounded-2xl p-[1px] transition-all duration-300 cursor-default bg-gradient-to-br from-transparent via-transparent to-transparent hover:from-primary/30 hover:via-accent/20 hover:to-primary/30"
          >
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm transition-shadow group-hover:shadow-lg group-hover:shadow-indigo-100 h-full">
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <h3 className="font-semibold text-gray-800 text-xs">
                {t(`features.${cat.key}`)}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
