
import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';

const SelectFormatDisplay: React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-full bg-white/5 p-6 mb-4"
      >
        <FileSearch className="h-8 w-8 text-gray-400" />
      </motion.div>
      
      <motion.h3 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg font-medium text-white"
      >
        Select a format to view content
      </motion.h3>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-sm text-gray-400 max-w-md mt-2"
      >
        Choose one of the available formats from the tabs above to view the generated content
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="h-0.5 bg-gradient-to-r from-neon-purple to-neon-blue w-16 mt-6"
      />
    </motion.div>
  );
};

export default SelectFormatDisplay;
