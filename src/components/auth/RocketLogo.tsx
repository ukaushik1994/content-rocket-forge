import React from 'react';
import { motion } from 'framer-motion';

export const RocketLogo = () => {
  return (
    <motion.div
      className="flex items-center justify-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Brand text */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">
            Creaiter
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Where Creativity Meets AI
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
