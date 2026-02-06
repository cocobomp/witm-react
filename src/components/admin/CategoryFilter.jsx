import { useTranslation } from 'react-i18next';

export default function CategoryFilter({ categories, selected, onChange }) {
  const { t } = useTranslation('admin');

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full sm:w-auto px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 cursor-pointer"
      >
        <option value="all" className="bg-dark-surface">
          {t('questions.all')}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id} className="bg-dark-surface">
            {category.icon} {category.title}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
