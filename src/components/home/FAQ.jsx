import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';

const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

export default function FAQ() {
  const { t } = useTranslation('home');
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <Section id="faq">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold">
          <span className="gradient-text">{t('faq.sectionTitle')}</span>
        </h2>
        <p className="text-gray-500 mt-4 text-lg">{t('faq.sectionDescription')}</p>
      </motion.div>

      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {questions.map((key, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 rounded-2xl px-6 py-5 bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all duration-300 text-left cursor-pointer"
              >
                <span className="font-semibold text-lg text-dark">
                  {t(`faq.${key}`)}
                </span>
                <motion.svg
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-5 h-5 shrink-0 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pt-3 pb-5 text-gray-500 leading-relaxed">
                      {t(`faq.a${key.slice(1)}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
