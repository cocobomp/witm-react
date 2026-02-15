import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import Button from '../ui/Button';

const items = [
  { key: 'swissMade', emoji: '\u{1F1E8}\u{1F1ED}' },
  { key: 'weListen', emoji: '\u{1F442}' },
  { key: 'justLaunched', emoji: '\u{1F680}' },
  { key: 'communityFirst', emoji: '\u{2764}\u{FE0F}' },
];

export default function WhyChoose() {
  const { t } = useTranslation('home');

  return (
    <Section id="why-choose" dark>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold">
          <span className="gradient-text">{t('whyChoose.title')}</span>
        </h2>
        <p className="text-gray-400 mt-4 text-lg">{t('whyChoose.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center"
          >
            {/* Glassmorphism card */}
            <div className="relative rounded-2xl p-5 sm:p-8 bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all duration-300">
              {/* Emoji with glow */}
              <div className="relative inline-block mb-5">
                <div
                  className="absolute inset-0 blur-xl opacity-30 rounded-full"
                  style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
                />
                <span className="relative text-5xl sm:text-6xl block">{item.emoji}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {t(`whyChoose.${item.key}`)}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t(`whyChoose.${item.key}Desc`, { defaultValue: '' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <Button variant="primary" size="lg" href="#download">
          {t('hero.ctaDownload')}
        </Button>
      </motion.div>
    </Section>
  );
}
