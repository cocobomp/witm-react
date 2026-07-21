import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import Card from '../ui/Card';
import Section from '../ui/Section';

const STAGGER_DELAY = 0.1;

// Real game mechanics from the WITM app (distinct from question categories)
const gameFeatures = [
  { key: 'reactions', emoji: '🎉' },
  { key: 'awards', emoji: '🏆' },
  { key: 'scoring', emoji: '🎯' },
  { key: 'coupleMode', emoji: '💑' },
  { key: 'collabMode', emoji: '✍️' },
  { key: 'toneFilter', emoji: '😇😈' },
  { key: 'leaderboard', emoji: '🌍' },
  { key: 'languages', emoji: '🇨🇭' },
];

export default function GameFeatures() {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();
  const hiddenState = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };

  return (
    <Section id="game-features" gradient>
      <motion.div
        initial={hiddenState}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('gameFeatures.sectionTitle')}
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('gameFeatures.sectionSubtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {gameFeatures.map((feature, i) => (
          <motion.div
            key={feature.key}
            initial={hiddenState}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: shouldReduceMotion ? 0 : i * STAGGER_DELAY,
            }}
          >
            <Card gradientBorder hover className="h-full">
              <span className="block text-3xl mb-3" aria-hidden="true">
                {feature.emoji}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t(`gameFeatures.${feature.key}.title`)}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t(`gameFeatures.${feature.key}.description`)}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
