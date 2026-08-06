import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../contexts/ThemeContext';

const VOTE_STORAGE_KEY = 'witm-theme-vote';

const themeIcons = {
  minimal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  gaming: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  ),
  glass: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
};

const themeLabels = {
  minimal: 'Minimal',
  gaming: 'Gaming',
  glass: 'Glass',
};

export default function ThemeSwitcher() {
  const { theme, cycleTheme, themes } = useTheme();
  const [showVotes, setShowVotes] = useState(false);
  const [votes, setVotes] = useState({});
  const [userVote, setUserVote] = useState(() => {
    try {
      return localStorage.getItem(VOTE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [voting, setVoting] = useState(false);

  // Fetch vote counts
  useEffect(() => {
    if (!showVotes) return;

    async function fetchVotes() {
      const counts = {};
      for (const t of themes) {
        try {
          const snap = await getDoc(doc(db, 'theme_votes', t));
          counts[t] = snap.exists() ? (snap.data().count || 0) : 0;
        } catch {
          counts[t] = 0;
        }
      }
      setVotes(counts);
    }

    fetchVotes();
  }, [showVotes, themes]);

  const handleVote = async (themeId) => {
    if (userVote || voting) return;

    setVoting(true);
    try {
      const ref = doc(db, 'theme_votes', themeId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        await setDoc(ref, { count: increment(1) }, { merge: true });
      } else {
        await setDoc(ref, { count: 1 });
      }

      setVotes((prev) => ({ ...prev, [themeId]: (prev[themeId] || 0) + 1 }));
      setUserVote(themeId);
      try {
        localStorage.setItem(VOTE_STORAGE_KEY, themeId);
      } catch {
        // localStorage unavailable
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Vote panel */}
      <AnimatePresence>
        {showVotes && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="theme-switcher-panel rounded-2xl p-4 min-w-[220px] shadow-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">
              Vote for a theme
            </p>
            <div className="flex flex-col gap-2">
              {themes.map((t) => {
                const count = votes[t] || 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isVoted = userVote === t;

                return (
                  <button
                    key={t}
                    onClick={() => handleVote(t)}
                    disabled={!!userVote || voting}
                    className={`
                      relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
                      transition-all duration-200 overflow-hidden
                      ${isVoted
                        ? 'theme-vote-active ring-2 ring-[var(--color-primary)]'
                        : 'theme-vote-btn'
                      }
                      ${userVote && !isVoted ? 'opacity-60' : ''}
                      ${!userVote ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {/* Background fill bar */}
                    {totalVotes > 0 && (
                      <div
                        className="absolute inset-0 rounded-xl theme-vote-fill transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {themeIcons[t]}
                      {themeLabels[t]}
                    </span>
                    {totalVotes > 0 && (
                      <span className="relative z-10 ml-auto text-xs opacity-70">
                        {count} ({pct}%)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {userVote && (
              <p className="text-xs opacity-50 mt-2 text-center">
                Thanks for voting!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Vote toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowVotes((v) => !v)}
          className="theme-switcher-btn rounded-full px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-colors"
          aria-label={showVotes ? 'Hide theme votes' : 'Show theme votes'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Vote
        </motion.button>

        {/* Theme cycle button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92, rotate: 15 }}
          onClick={cycleTheme}
          className="theme-switcher-btn rounded-full w-12 h-12 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
          aria-label={`Switch theme (current: ${themeLabels[theme]})`}
          title={themeLabels[theme]}
        >
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {themeIcons[theme]}
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
