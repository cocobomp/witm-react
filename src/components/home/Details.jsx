import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';

const featureKeys = [
  'feature1',
  'feature3',
  'feature5',
  'feature7',
];

// Alternating subtle bg colors for the image background shape
const bgColors = [
  'bg-indigo-50',
  'bg-violet-50',
  'bg-purple-50',
  'bg-indigo-50',
];

export default function Details() {
  const { t } = useTranslation('home');

  return (
    <Section id="details">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('details.sectionSubtitlePrefix')}{' '}
          <span className="gradient-text">
            {t('details.sectionSubtitleHighlight')}
          </span>
        </h2>
      </motion.div>

      <div className="space-y-16 md:space-y-28">
        {featureKeys.map((key, i) => {
          const isEven = i % 2 === 1;
          const featureNum = parseInt(key.replace('feature', ''), 10);
          const imgSrc = `/img/detail-${featureNum}.svg`;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                isEven ? 'md:direction-rtl' : ''
              }`}
            >
              {/* Image with background shape */}
              <div className={`${isEven ? 'md:order-2' : ''} flex justify-center`}>
                <div className={`relative p-4 sm:p-8 rounded-3xl ${bgColors[i]}`}>
                  <img
                    src={imgSrc}
                    alt={t(`details.${key}.title`)}
                    className="w-full max-w-sm mx-auto relative z-10"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text */}
              <div className={`${isEven ? 'md:order-1' : ''}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
                  {t(`details.${key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {t(`details.${key}.description`)}
                </p>

                {/* Optional bullets with improved styling */}
                {t(`details.${key}.bullet1`, { defaultValue: '' }) && (
                  <ul className="space-y-3 text-gray-600">
                    {['bullet1', 'bullet2', 'bullet3'].map(
                      (bulletKey) =>
                        t(`details.${key}.${bulletKey}`, {
                          defaultValue: '',
                        }) && (
                          <li key={bulletKey} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <svg
                                className="w-3.5 h-3.5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                            <span className="leading-relaxed">
                              {t(`details.${key}.${bulletKey}`, {
                                defaultValue: '',
                              })}
                            </span>
                          </li>
                        )
                    )}
                  </ul>
                )}

                {/* Optional extra text */}
                {t(`details.${key}.extra`, { defaultValue: '' }) && (
                  <p className="text-gray-500 text-sm mt-5 leading-relaxed">
                    {t(`details.${key}.extra`, { defaultValue: '' })}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
