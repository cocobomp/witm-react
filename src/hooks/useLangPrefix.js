import { useTranslation } from 'react-i18next';

export default function useLangPrefix() {
  const { i18n } = useTranslation();
  return ['fr', 'de'].includes(i18n.language) ? `/${i18n.language}` : '';
}
