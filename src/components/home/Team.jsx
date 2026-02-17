import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import { INSTAGRAM_URL } from '../../constants/links';

const teamMembers = [
  {
    key: 'corentin',
    image: '/img/team/team-1.JPEG',
  },
  {
    key: 'celien',
    image: '/img/team/celien.jpeg',
  },
  {
    key: 'fabien',
    image: '/img/team/fabien.jpeg',
  },
  {
    key: 'nathan',
    image: '/img/team/nathan.jpeg',
  },
];

export default function Team() {
  const { t } = useTranslation('home');

  return (
    <Section id="team">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t('team.sectionSubtitlePrefix')}{' '}
          <span className="gradient-text">{t('team.sectionSubtitleHighlight')}</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="text-center"
          >
            {/* Photo with decorative background */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto mb-4 sm:mb-6">
              {/* Decorative gradient ring */}
              <div
                className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-primary/30 via-accent/30 to-primary/30 animate-spin-slow"
                style={{ animationDuration: '8s' }}
              />
              <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100" />
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg shadow-indigo-100 ring-4 ring-white">
                <img
                  src={member.image}
                  alt={t(`team.members.${member.key}.name`)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              {t(`team.members.${member.key}.name`)}
            </h3>
            <p className="text-primary font-medium mt-1">
              {t(`team.members.${member.key}.role`)}
            </p>

            {/* Bio / quote */}
            <p className="text-gray-500 text-sm leading-relaxed mt-4 italic">
              {t(`team.members.${member.key}.bio`, { defaultValue: '' })}
            </p>

            {/* Social links - only show for Corentin */}
            {member.key === 'corentin' && (
              <div className="flex justify-center gap-3 mt-6">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary hover:from-primary hover:to-accent hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-primary/20 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
