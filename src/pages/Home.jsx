import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Features from '../components/home/Features';
import ExampleQuestions from '../components/home/ExampleQuestions';
import Details from '../components/home/Details';
import AppCarousel from '../components/home/AppCarousel';
import GameFeatures from '../components/home/GameFeatures';
import WhyChoose from '../components/home/WhyChoose';
import FAQ from '../components/home/FAQ';
import Download from '../components/home/Download';
import Team from '../components/home/Team';
import Testimonials from '../components/home/Testimonials';
import Feedback from '../components/home/Feedback';

export default function Home() {
  const { t, i18n } = useTranslation('common');

  return (
    <>
      <SEO
        title={t('meta.siteTitle')}
        description={t('meta.siteDescription')}
        lang={i18n.language}
        canonical="https://whoisthemost.com"
        keywords="WITM, Who Is The Most, party game, voting game, friends, Switzerland, dare"
      />
      <Hero />
      <About />
      <Features />
      <ExampleQuestions />
      <AppCarousel />
      <Details />
      <GameFeatures />
      <WhyChoose />
      <FAQ />
      <Download />
      <Team />
      <Testimonials />
      <Feedback />
    </>
  );
}
