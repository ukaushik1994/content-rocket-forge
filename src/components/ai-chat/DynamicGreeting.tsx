import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASE_POOLS = {
  morning: [
    "Rise and create.",
    "Morning momentum.",
    "Fresh ideas await.",
    "Let's make today count.",
    "New day, new content.",
    "Early bird energy.",
  ],
  afternoon: [
    "Back at it.",
    "Afternoon hustle.",
    "Keep the momentum.",
    "Let's power through.",
    "Midday magic.",
    "Creative fuel.",
  ],
  evening: [
    "Evening flow.",
    "Winding down? Or warming up?",
    "Creative hours.",
    "One more thing?",
    "Golden hour vibes.",
    "Still creating.",
  ],
  night: [
    "Night owl mode.",
    "Burning the midnight oil.",
    "Late night brilliance.",
    "The quiet hours.",
    "After hours.",
    "When the magic happens.",
  ],
};

function getTimePeriod(): keyof typeof PHRASE_POOLS {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getRandomPhrase(period: keyof typeof PHRASE_POOLS, exclude?: string): string {
  const pool = PHRASE_POOLS[period];
  const filtered = exclude ? pool.filter(p => p !== exclude) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

interface DynamicGreetingProps {
  firstName?: string;
}

export const DynamicGreeting: React.FC<DynamicGreetingProps> = ({ firstName }) => {
  const [phrase, setPhrase] = useState(() => getRandomPhrase(getTimePeriod()));

  // Pick a new phrase only when the component remounts (e.g. conversation change)
  useEffect(() => {
    setPhrase(getRandomPhrase(getTimePeriod()));
  }, []);

  const displayText = firstName ? `${phrase.replace('.', '')}, ${firstName}.` : phrase;

  return (
    <motion.div
      className="text-center space-y-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={phrase}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {displayText}
        </motion.h1>
      </AnimatePresence>
      <p className="text-sm text-muted-foreground">
        What would you like to work on today?
      </p>
    </motion.div>
  );
};
