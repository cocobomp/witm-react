import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import Card from '../ui/Card';
import { CONTACT_EMAIL } from '../../constants/links';

const pillars = [
  { key: 'swissQuality', emoji: '\u{1F1E8}\u{1F1ED}' },
  { key: 'weListen', emoji: '\u{1F442}' },
  { key: 'justLaunched', emoji: '\u{1F680}' },
  { key: 'communityFirst', emoji: '\u{2764}\u{FE0F}' },
];

const iconBoxes = [
  { key: 'createRooms', emoji: '\u{1F3E0}' },
  { key: 'funQuiz', emoji: '\u{1F3AE}' },
  { key: 'dynamicVoting', emoji: '\u{1F5F3}\u{FE0F}' },
  { key: 'leaderboard', emoji: '\u{1F3C6}' },
];

export default function About() {
  const { t } = useTranslation('home');

  return (
    <Section id="about" className="relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />

      <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">
            {t('about.sectionLabel')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6 text-gray-900">
            {t('about.title')}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t('about.description')}
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            {t('about.story')}
          </p>

          {/* Swiss Identity Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {pillars.map((p, i) => (
              <motion.span
                key={p.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-sm font-medium text-gray-700 border border-gray-100"
              >
                <span>{p.emoji}</span>
                {t(`about.pillars.${p.key}.label`)}
              </motion.span>
            ))}
          </div>

          <motion.a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group inline-flex items-center gap-2 text-primary font-semibold transition-colors hover:text-accent"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {t('about.cta')}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>

        {/* Right Column - Icon Boxes (staggered individually) */}
        <div className="grid grid-cols-2 gap-4">
          {iconBoxes.map((box, i) => (
            <motion.div
              key={box.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
            >
              <Card hover gradientBorder>
                <div className="text-3xl mb-3">{box.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`iconBoxes.${box.key}.title`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t(`iconBoxes.${box.key}.description`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
