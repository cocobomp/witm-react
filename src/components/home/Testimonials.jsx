import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';

const avatarColors = [
  'from-pink-500 to-rose-400',
  'from-blue-500 to-cyan-400',
  'from-amber-500 to-yellow-400',
  'from-emerald-500 to-teal-400',
];

export default function Testimonials() {
  const { t } = useTranslation('home');

  const reviews = t('testimonials.reviews', { returnObjects: true });

  return (
    <Section id="testimonials" dark>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold">
          <span className="gradient-text">{t('testimonials.sectionTitle')}</span>
        </h2>
        <p className="text-gray-400 mt-4 text-lg">
          {t('testimonials.sectionDescription')}
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="relative rounded-2xl p-5 sm:p-6 bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all duration-300 h-full flex flex-col">
              {/* Quote icon */}
              <svg
                className="w-8 h-8 text-white/10 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>

              {/* Quote text */}
              <p className="text-gray-300 text-sm leading-relaxed italic flex-1 mb-5">
                "{review.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                {/* Avatar circle with initial */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {review.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {review.name}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{review.context}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
