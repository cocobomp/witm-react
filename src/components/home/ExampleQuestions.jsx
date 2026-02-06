import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';

// Real questions from the WITM game
const questions = [
  { key: 'q1', emoji: '🎉' },  // Party planner
  { key: 'q2', emoji: '☕' },  // Coffee spender
  { key: 'q3', emoji: '🎪' },  // Run away to circus
  { key: 'q4', emoji: '🏠' },  // Messiest in house
  { key: 'q5', emoji: '🎭' },  // Dramatic quitter
  { key: 'q6', emoji: '🛸' },  // Area 51
];

export default function ExampleQuestions() {
  const { t } = useTranslation('home');

  return (
    <Section className="bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('examples.sectionTitle')}
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('examples.sectionDescription')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((q, i) => (
          <motion.div
            key={q.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group"
          >
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
              <span className="text-3xl shrink-0">{q.emoji}</span>
              <p className="text-gray-700 font-medium">
                {t(`examples.${q.key}`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
