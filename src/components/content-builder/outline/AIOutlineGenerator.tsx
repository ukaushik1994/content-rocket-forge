
import React from 'react';
import { OutlineGenerator } from './ai-generator/OutlineGenerator';
import { AIOutlineInfo } from './AIOutlineInfo';
import { motion } from 'framer-motion';

export function AIOutlineGenerator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* AI Generator Card */}
      <OutlineGenerator />
      
      {/* Info Card */}
      <AIOutlineInfo />
    </motion.div>
  );
}
