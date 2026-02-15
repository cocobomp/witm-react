import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import useLangPrefix from '../../hooks/useLangPrefix';

export default function Header() {
  const { t } = useTranslation('common');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();
  const langPrefix = useLangPrefix();

  const isHome =
    location.pathname === '/' ||
    location.pathname === '/fr' ||
    location.pathname === '/de' ||
    location.pathname === `${langPrefix}/` ||
    location.pathname === langPrefix;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which section is currently in view for active link indicator
  useEffect(() => {
    if (!isHome) return;
    const sectionIds = ['hero', 'about', 'features', 'team'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open (iOS-safe)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const navItems = [
    { label: t('nav.home'), href: `${langPrefix}/#hero`, section: 'hero' },
    { label: t('nav.about'), href: `${langPrefix}/#about`, section: 'about' },
    { label: t('nav.features'), href: `${langPrefix}/#features`, section: 'features' },
    { label: t('nav.team'), href: `${langPrefix}/#team`, section: 'team' },
    { label: t('nav.blog'), href: `${langPrefix}/blog`, section: 'blog' },
  ];

  const isNavActive = useCallback(
    (item) => {
      if (item.section === 'blog') {
        return location.pathname.includes('/blog');
      }
      return isHome && activeSection === item.section;
    },
    [isHome, activeSection, location.pathname]
  );

  const handleNavClick = (e, href) => {
    if (href.includes('#')) {
      if (isHome) {
        e.preventDefault();
        const id = href.split('#')[1];
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white'
      }`}
    >
      {/* Subtle gradient bottom border when scrolled */}
      {scrolled && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #6366f1, transparent)',
            opacity: 0.4,
          }}
        />
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with hover gradient */}
          <Link
            to={langPrefix || '/'}
            className="group flex items-center gap-2.5 shrink-0"
          >
            <img src="/img/logo.png" alt="WITM" className="h-8 w-8 transition-transform duration-200 group-hover:scale-105" />
            <span className="font-bold text-lg text-gray-900 transition-all duration-200 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent">
              WITM
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isNavActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                    active
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 bottom-0 bg-white z-40 md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-2 -mt-16">
              {navItems.map((item, index) => {
                const active = isNavActive(item);
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                  >
                    <Link
                      to={item.href}
                      onClick={(e) => {
                        handleNavClick(e, item.href);
                        setMobileOpen(false);
                      }}
                      className={`block text-center text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-200 ${
                        active
                          ? 'text-primary bg-primary/5'
                          : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.06, duration: 0.3 }}
                className="pt-6 mt-4 border-t border-gray-100"
              >
                <LanguageSwitcher />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
